import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentStatus } from '@/lib/enums';
import { verifyAdmin } from '../_lib';
import { resolveGeminiApiKey } from '@/lib/coach/google-auth';

function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const d = dayStart();
  d.setDate(d.getDate() - n);
  return d;
}

async function probeHealth(): Promise<'green' | 'yellow' | 'red'> {
  const checks: boolean[] = [];
  try {
    await db.$queryRaw`SELECT 1`;
    checks.push(true);
  } catch {
    checks.push(false);
  }
  checks.push(Boolean(resolveGeminiApiKey()));
  checks.push(
    Boolean(
      process.env.PAYPAL_CLIENT_ID ||
        process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
        process.env.PAYPAL_CLIENT_SECRET,
    ),
  );
  const ok = checks.filter(Boolean).length;
  if (ok === checks.length) return 'green';
  if (ok >= 1) return 'yellow';
  return 'red';
}

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const today = dayStart();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const d7 = daysAgo(7);
    const d30 = daysAgo(30);
    const d90 = daysAgo(90);

    const [
      revenueToday,
      revenueThisMonth,
      interviewsToday,
      newSignups,
      activeCompanies,
      pendingTickets,
      totalInterviews,
      completedInterviews,
      b2cUsers,
      b2bUsers,
      industryGroups,
      recentPayments7,
      recentPayments30,
      recentPayments90,
      apiHealth,
    ] = await Promise.all([
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: today } },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: monthStart } },
      }),
      db.interview.count({ where: { createdAt: { gte: today } } }),
      db.user.count({ where: { createdAt: { gte: today } } }),
      db.company.count(),
      db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING'] } } }),
      db.interview.count(),
      db.interview.count({ where: { status: { in: ['COMPLETED', 'SCORED', 'DONE'] } } }),
      db.user.count({ where: { accountType: { in: ['INDIVIDUAL', 'B2C'] } } }),
      db.user.count({
        where: {
          OR: [{ accountType: { in: ['COMPANY', 'B2B'] } }, { companyId: { not: null } }],
        },
      }),
      db.interview.groupBy({
        by: ['industry'],
        _count: { industry: true },
        orderBy: { _count: { industry: 'desc' } },
        take: 8,
      }),
      db.payment.findMany({
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: d7 } },
        select: { amount: true, capturedAt: true, createdAt: true },
      }),
      db.payment.findMany({
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: d30 } },
        select: { amount: true, capturedAt: true, createdAt: true },
      }),
      db.payment.findMany({
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: d90 } },
        select: { amount: true, capturedAt: true, createdAt: true },
      }),
      probeHealth(),
    ]);

    const bucket = (payments: { amount: number; capturedAt: Date | null; createdAt: Date }[], days: number) => {
      const map = new Map<string, number>();
      for (let i = days - 1; i >= 0; i--) {
        const d = daysAgo(i);
        map.set(d.toISOString().slice(0, 10), 0);
      }
      for (const p of payments) {
        const key = (p.capturedAt ?? p.createdAt).toISOString().slice(0, 10);
        if (map.has(key)) map.set(key, (map.get(key) ?? 0) + (p.amount ?? 0));
      }
      return Array.from(map.entries()).map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }));
    };

    const completionRate =
      totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0;

    // Soft visitor estimate from interviews + signups when no analytics store exists
    const visitors24h = Math.max(interviewsToday * 3 + newSignups * 2, interviewsToday + newSignups);

    return NextResponse.json({
      widgets: {
        todaysInterviews: interviewsToday,
        newSignups,
        revenueTodayCents: Math.round((revenueToday._sum.amount ?? 0) * 100),
        revenueThisMonthCents: Math.round((revenueThisMonth._sum.amount ?? 0) * 100),
        activeCompanies,
        pendingSupportTickets: pendingTickets,
        apiHealth,
        visitors24h,
      },
      // backward compat
      revenueTodayCents: Math.round((revenueToday._sum.amount ?? 0) * 100),
      revenueThisMonthCents: Math.round((revenueThisMonth._sum.amount ?? 0) * 100),
      activeUsers: b2cUsers + b2bUsers,
      pendingApplications: pendingTickets,
      charts: {
        revenue7d: bucket(recentPayments7, 7),
        revenue30d: bucket(recentPayments30, 30),
        revenue90d: bucket(recentPayments90, 90),
        completionRate,
        completedInterviews,
        totalInterviews,
        userGrowth: [
          { type: 'B2C', count: b2cUsers },
          { type: 'B2B', count: b2bUsers },
        ],
        topIndustries: industryGroups.map((g) => ({
          industry: g.industry || 'GENERAL',
          count: g._count.industry,
        })),
      },
    });
  } catch (err) {
    console.error('GET /api/admin/stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
