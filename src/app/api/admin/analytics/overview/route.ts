import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../../_lib';

/** Real analytics aggregates for admin analytics pages (no GA dependency). */
export async function GET() {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    usersTotal,
    users24h,
    users7d,
    interviewsTotal,
    interviewsCompleted,
    interviews7d,
    mockTotal,
    mockCompleted,
    paymentsOk,
    paymentsRefunded,
    paymentsFailed,
    revenueAgg,
    avgScoreAgg,
    topIndustries,
    recentForPeaks,
    poolPublic,
    poolTotal,
    activeSubs,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { createdAt: { gte: dayAgo } } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.interview.count(),
    db.interview.count({ where: { status: 'COMPLETED' } }),
    db.interview.count({ where: { createdAt: { gte: weekAgo } } }),
    db.interviewSession.count(),
    db.interviewSession.count({ where: { status: 'completed' } }),
    db.payment.count({ where: { status: 'COMPLETED' } }),
    db.payment.count({ where: { status: 'REFUNDED' } }),
    db.payment.count({ where: { status: 'FAILED' } }),
    db.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: monthAgo } },
      _sum: { amount: true },
    }),
    db.interview.aggregate({
      where: { overallScore: { not: null } },
      _avg: { overallScore: true },
    }),
    db.interview.groupBy({
      by: ['industry'],
      _count: { _all: true },
      orderBy: { _count: { industry: 'desc' } },
      take: 8,
    }),
    db.interview.findMany({
      where: { createdAt: { gte: weekAgo } },
      select: { createdAt: true },
      take: 2000,
    }),
    db.candidatePool.count({ where: { isVisible: true, isOptedIn: true } }),
    db.candidatePool.count(),
    db.paypalSubscription.count({ where: { status: 'ACTIVE' } }),
  ]);

  const hourCounts = new Map<number, number>();
  for (const row of recentForPeaks) {
    const hour = row.createdAt.getUTCHours();
    hourCounts.set(hour, (hourCounts.get(hour) ?? 0) + 1);
  }
  const peakHours = [...hourCounts.entries()]
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const completionRate =
    interviewsTotal === 0
      ? 0
      : Math.round((interviewsCompleted / interviewsTotal) * 100);
  const refundRate =
    paymentsOk + paymentsRefunded === 0
      ? 0
      : Math.round((paymentsRefunded / (paymentsOk + paymentsRefunded)) * 100);

  const accountTypes = await db.user.groupBy({
    by: ['accountType'],
    _count: { _all: true },
  });

  return NextResponse.json({
    website: {
      usersTotal,
      signups24h: users24h,
      signups7d: users7d,
      activeSubs,
      revenue30dUsd: Number(revenueAgg._sum.amount ?? 0),
      paymentsOk,
      paymentsFailed,
      refundRate,
    },
    behavior: {
      interviews7d,
      mockTotal,
      mockCompleted,
      poolPublic,
      poolTotal,
      accountTypes: accountTypes.map((a) => ({
        type: a.accountType ?? 'UNKNOWN',
        count: a._count._all,
      })),
      funnel: {
        signedUp: usersTotal,
        startedInterview: interviewsTotal,
        completedInterview: interviewsCompleted,
        publicPassport: poolPublic,
      },
    },
    interviews: {
      total: interviewsTotal,
      completed: interviewsCompleted,
      completionRate,
      avgScore: avgScoreAgg._avg.overallScore
        ? Math.round(avgScoreAgg._avg.overallScore)
        : null,
      topIndustries: topIndustries.map((i) => ({
        industry: i.industry || 'GENERAL',
        count: i._count._all,
      })),
      peakHours,
    },
  });
}
