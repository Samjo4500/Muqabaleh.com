import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaymentStatus, UserRole, UserTier } from '@/lib/enums';
import { loadVisitorStats } from '@/lib/analytics/site-visit';
import { verifyAdmin } from '../_lib';

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

function hoursAgo(n: number) {
  return new Date(Date.now() - n * 60 * 60 * 1000);
}

const COMPLETED_INTERVIEW = ['COMPLETED', 'SCORED', 'DONE'] as const;

async function probeHealth(): Promise<'green' | 'yellow' | 'red'> {
  const checks: boolean[] = [];
  try {
    await db.$queryRaw`SELECT 1`;
    checks.push(true);
  } catch {
    checks.push(false);
  }
  checks.push(Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY));
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
    const d24 = hoursAgo(24);
    const d7 = daysAgo(7);
    const d30 = daysAgo(30);
    const d90 = daysAgo(90);

    const [
      revenueToday,
      revenueThisMonth,
      revenue30d,
      interviewsToday,
      interviews7d,
      newSignups,
      newSignups7d,
      usersTotal,
      loggedIn24h,
      candidates,
      companyUsers,
      interviewers,
      admins,
      activeCompanies,
      pendingTickets,
      totalInterviews,
      completedInterviews,
      guestInterviewsToday,
      b2cUsers,
      b2bUsers,
      industryGroups,
      recentPayments7,
      recentPayments30,
      recentPayments90,
      apiHealth,
      activeJeannieSubs,
      jeannieTierUsers,
      liveJobs,
      listedCompanies,
      recentUsers,
      visitors,
    ] = await Promise.all([
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: today } },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: monthStart } },
      }),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: PaymentStatus.COMPLETED, capturedAt: { gte: d30 } },
      }),
      db.interview.count({ where: { createdAt: { gte: today } } }),
      db.interview.count({ where: { createdAt: { gte: d7 } } }),
      db.user.count({ where: { createdAt: { gte: today } } }),
      db.user.count({ where: { createdAt: { gte: d7 } } }),
      db.user.count(),
      db.user.count({ where: { lastLoginAt: { gte: d24 } } }),
      db.user.count({
        where: {
          role: UserRole.USER,
          companyId: null,
          accountType: { in: ['INDIVIDUAL', 'B2C'] },
        },
      }),
      db.user.count({
        where: {
          OR: [
            { accountType: { in: ['COMPANY', 'B2B'] } },
            { companyId: { not: null } },
            { role: UserRole.COMPANY_ADMIN },
          ],
        },
      }),
      db.user.count({ where: { role: UserRole.INTERVIEWER } }),
      db.user.count({ where: { role: { in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } } }),
      db.company.count({ where: { status: 'ACTIVE' } }),
      db.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING'] } } }),
      db.interview.count(),
      db.interview.count({ where: { status: { in: [...COMPLETED_INTERVIEW] } } }),
      db.interview.count({ where: { createdAt: { gte: today }, userId: null } }),
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
      db.paypalSubscription.count({ where: { status: 'ACTIVE' } }),
      db.user.count({
        where: { tier: { in: [UserTier.JEANNIE, UserTier.JEANNIE_PRO] } },
      }),
      db.listedJob.count({ where: { isActive: true } }),
      db.listedCompany.count({ where: { isActive: true } }),
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountType: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      loadVisitorStats(d24, d7),
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

    const revenueTodayUsd = Number(revenueToday._sum.amount ?? 0);
    const revenueMonthUsd = Number(revenueThisMonth._sum.amount ?? 0);
    const revenue30dUsd = Number(revenue30d._sum.amount ?? 0);

    return NextResponse.json({
      people: {
        total: usersTotal,
        newToday: newSignups,
        new7d: newSignups7d,
        loggedIn24h,
        candidates,
        companies: companyUsers,
        interviewers,
        admins,
      },
      visitors,
      interviews: {
        today: interviewsToday,
        last7d: interviews7d,
        total: totalInterviews,
        completed: completedInterviews,
        completionRate,
        guestToday: guestInterviewsToday,
      },
      money: {
        revenueTodayUsd,
        revenueMonthUsd,
        revenue30dUsd,
        activeJeannieSubs,
        jeannieTierUsers,
      },
      jobs: {
        liveListings: liveJobs,
        companies: listedCompanies,
      },
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        accountType: u.accountType,
        createdAt: u.createdAt.toISOString(),
        lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
      })),
      widgets: {
        todaysInterviews: interviewsToday,
        newSignups,
        revenueTodayCents: Math.round(revenueTodayUsd * 100),
        revenueThisMonthCents: Math.round(revenueMonthUsd * 100),
        activeCompanies,
        pendingSupportTickets: pendingTickets,
        apiHealth,
        visitors24h: visitors.available ? visitors.unique24h : 0,
      },
      revenueTodayCents: Math.round(revenueTodayUsd * 100),
      revenueThisMonthCents: Math.round(revenueMonthUsd * 100),
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
