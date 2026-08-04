import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';

export async function GET() {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [revenueToday, revenueThisMonth, activeUsers, pendingApplications] =
      await Promise.all([
        db.payment.aggregate({
          _sum: { amountUsdCents: true },
          where: {
            status: 'CAPTURED',
            capturedAt: { gte: today },
          },
        }),
        db.payment.aggregate({
          _sum: { amountUsdCents: true },
          where: {
            status: 'CAPTURED',
            capturedAt: { gte: monthStart },
          },
        }),
        db.user.count({
          where: { subscriptionTier: { not: 'FREE' } },
        }),
        db.interviewer.count({
          where: { status: 'PENDING' },
        }),
      ]);

    return NextResponse.json({
      revenueTodayCents: revenueToday._sum.amountUsdCents ?? 0,
      revenueThisMonthCents: revenueThisMonth._sum.amountUsdCents ?? 0,
      activeUsers,
      pendingApplications,
    });
  } catch (err) {
    console.error('GET /api/admin/stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
