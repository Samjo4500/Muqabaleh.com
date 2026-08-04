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
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            capturedAt: { gte: today },
          },
        }),
        db.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            capturedAt: { gte: monthStart },
          },
        }),
        db.user.count({
          where: { tier: { not: 'FREE' } },
        }),
        db.interviewer.count({
          where: { status: 'PENDING' },
        }),
      ]);

    // Convert dollars → cents at API boundary for existing admin UI formatCents
    return NextResponse.json({
      revenueTodayCents: Math.round((revenueToday._sum.amount ?? 0) * 100),
      revenueThisMonthCents: Math.round((revenueThisMonth._sum.amount ?? 0) * 100),
      activeUsers,
      pendingApplications,
    });
  } catch (err) {
    console.error('GET /api/admin/stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
