import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '@/app/api/admin/_lib';

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d = new Date()) {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET(req: NextRequest) {
  const gate = await verifyAdmin();
  if (!gate.authorized) return gate.response;

  const sp = req.nextUrl.searchParams;
  const tab = sp.get('tab') || 'stats';
  const page = Math.max(1, Number(sp.get('page') || 1));
  const pageSize = 20;
  const q = (sp.get('q') || '').trim();
  const sort = sp.get('sort') || 'date';
  const exportCsv = sp.get('export') === '1';
  const range = sp.get('range') || '30d';

  try {
    const today = startOfDay();
    const month = startOfMonth();
    const day30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    if (tab === 'stats' || tab === 'all') {
      const [
        interviewsToday,
        interviewsMonth,
        interviewsAll,
        passports,
        activeUsers,
        revenueAgg,
      ] = await Promise.all([
        db.interview.count({ where: { createdAt: { gte: today } } }),
        db.interview.count({ where: { createdAt: { gte: month } } }),
        db.interview.count(),
        db.interview.count({
          where: { verificationId: { not: null }, status: 'COMPLETED' },
        }),
        db.user.count({ where: { createdAt: { gte: day30 } } }),
        db.payment
          .aggregate({
            _sum: { amount: true },
            where: { status: 'COMPLETED' },
          })
          .catch(() => ({ _sum: { amount: null as number | null } })),
      ]);

      if (tab === 'stats') {
        return NextResponse.json({
          stats: {
            interviewsToday,
            interviewsMonth,
            interviewsAll,
            passports,
            activeUsers,
            // Payment.amount is stored in USD dollars
        revenueUsd: revenueAgg._sum.amount || 0,
          },
        });
      }
    }

    if (tab === 'interviews' || exportCsv) {
      let since: Date | undefined;
      if (range === '30d') since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (range === '90d') since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const where = {
        ...(since ? { createdAt: { gte: since } } : {}),
        ...(q
          ? {
              OR: [
                { user: { name: { contains: q, mode: 'insensitive' as const } } },
                { user: { email: { contains: q, mode: 'insensitive' as const } } },
                { position: { contains: q, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      };

      if (exportCsv) {
        const rows = await db.interview.findMany({
          where,
          include: { user: { select: { name: true, email: true, tier: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5000,
        });
        const header = [
          'id',
          'candidate',
          'email',
          'role',
          'language',
          'score',
          'grade',
          'date',
          'verificationId',
          'tier',
        ];
        const lines = [
          header.join(','),
          ...rows.map((r) =>
            [
              r.id,
              csv(r.user?.name || ''),
              csv(r.user?.email || ''),
              csv(r.position || r.industry || ''),
              csv(r.language || ''),
              r.overallScore ?? '',
              csv(r.recommendation || ''),
              r.createdAt.toISOString(),
              csv(r.verificationId || ''),
              csv(r.user?.tier || ''),
            ].join(','),
          ),
        ];
        return new NextResponse(lines.join('\n'), {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="muqabaleh-interviews-${range}.csv"`,
          },
        });
      }

      const total = await db.interview.count({ where });
      const orderBy =
        sort === 'score'
          ? ({ overallScore: 'desc' as const })
          : ({ createdAt: 'desc' as const });
      const items = await db.interview.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      return NextResponse.json({
        page,
        pageSize,
        total,
        items: items.map((r) => ({
          id: r.id,
          candidateName: r.user?.name || r.user?.email || '—',
          email: r.user?.email || '',
          role: r.position || r.industry || '—',
          language: r.language,
          score: r.overallScore,
          grade: r.recommendation,
          date: r.createdAt,
          // Email send is not persisted (no schema change); passport readiness is.
          passportStatus: r.verificationId ? 'ready' : 'none',
          verificationId: r.verificationId,
        })),
      });
    }

    if (tab === 'users') {
      const where = q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {};
      const total = await db.user.count({ where });
      const users = await db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          tier: true,
          _count: { select: { interviews: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });
      return NextResponse.json({
        page,
        pageSize,
        total,
        items: users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          signupDate: u.createdAt,
          tier: u.tier,
          totalInterviews: u._count.interviews,
        })),
      });
    }

    return NextResponse.json({ error: 'Unknown tab' }, { status: 400 });
  } catch (err) {
    console.error('[admin/coach-overview]', err);
    return NextResponse.json({ error: 'Failed to load overview' }, { status: 500 });
  }
}

function csv(value: string) {
  const v = String(value).replace(/"/g, '""');
  return `"${v}"`;
}
