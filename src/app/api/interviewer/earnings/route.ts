import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviewer/earnings — total earnings, available balance, stats
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

    try {
      const interviewer = await db.interviewer.findUnique({
        where: { userId },
        select: {
          id: true,
          totalEarnings: true,
          rating: true,
          totalInterviews: true,
          payoutEmail: true,
        },
      });

      if (!interviewer) {
        return NextResponse.json({
          totalEarnings: 0,
          totalWithdrawn: 0,
          availableBalance: 0,
          sessionsCompleted: 0,
          payoutEmail: null,
        });
      }

      // Sum of interviewerPayout from completed bookings
      const bookingAgg = await db.humanBooking.aggregate({
        where: { interviewerId: interviewer.id, status: 'COMPLETED' },
        _sum: { interviewerPayout: true },
        _count: true,
      });

      const totalEarned = bookingAgg._sum.interviewerPayout || 0;
      const sessionsCompleted = bookingAgg._count || 0;

      // Sum of payouts that are COMPLETED or PROCESSING (money already sent/out)
      const payoutAgg = await db.interviewerPayout.aggregate({
        where: {
          interviewerId: interviewer.id,
          status: { in: ['COMPLETED', 'PROCESSING'] },
        },
        _sum: { amount: true },
      });

      const totalWithdrawn = payoutAgg._sum.amount || 0;
      const availableBalance = totalEarned - totalWithdrawn;

      return NextResponse.json({
        totalEarnings: totalEarned,
        totalWithdrawn,
        availableBalance,
        sessionsCompleted,
        payoutEmail: interviewer.payoutEmail,
      });
    } catch (dbErr) {
      console.warn('[GET /api/interviewer/earnings] DB unavailable:', dbErr);
    }

    return NextResponse.json({
      totalEarnings: 0,
      totalWithdrawn: 0,
      availableBalance: 0,
      sessionsCompleted: 0,
      payoutEmail: null,
    });
  } catch (err) {
    console.error('GET /api/interviewer/earnings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الأرباح', en: 'Error fetching earnings' } },
      { status: 500 },
    );
  }
}
