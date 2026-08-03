import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviewer/earnings — total earnings, pending payout, stats
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Try DB first
    try {
      const interviewer = await db.interviewer.findUnique({
        where: { userId },
        select: { id: true, totalEarnings: true, rating: true, totalInterviews: true, payoutEmail: true },
      });

      if (interviewer) {
        const completedBookings = await db.humanBooking.aggregate({
          where: { interviewerId: interviewer.id, status: 'COMPLETED' },
          _sum: { priceTotal: true, interviewerPayout: true, platformFee: true },
          _count: true,
        });

        const upcomingBookings = await db.humanBooking.count({
          where: {
            interviewerId: interviewer.id,
            status: { in: ['PENDING', 'CONFIRMED'] },
            scheduledAt: { gte: new Date() },
          },
        });

        const totalEarnings = completedBookings._sum.priceTotal || 0;
        const platformFees = completedBookings._sum.platformFee || 0;
        const netIncome = completedBookings._sum.interviewerPayout || 0;
        const sessionsCompleted = completedBookings._count || 0;

        return NextResponse.json({
          totalEarnings,
          platformFees,
          netIncome,
          sessionsCompleted,
          currentBalance: netIncome,
          upcomingCount: upcomingBookings,
          avgRating: interviewer.rating || 0,
        });
      }
    } catch (dbErr) {
      console.warn('[GET /api/interviewer/earnings] DB unavailable:', dbErr);
    }

    // Fallback: return zeros (no interviewer profile yet)
    return NextResponse.json({
      totalEarnings: 0,
      platformFees: 0,
      netIncome: 0,
      sessionsCompleted: 0,
      currentBalance: 0,
      upcomingCount: 0,
      avgRating: 0,
    });
  } catch (err) {
    console.error('GET /api/interviewer/earnings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الأرباح', en: 'Error fetching earnings' } },
      { status: 500 },
    );
  }
}
