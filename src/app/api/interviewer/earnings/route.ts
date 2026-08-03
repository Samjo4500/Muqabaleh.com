import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviewer/earnings — total earnings, pending payout, payout history
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

    const interviewer = await db.interviewer.findUnique({
      where: { userId },
      select: { id: true, totalEarnings: true, payoutEmail: true },
    });

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'ملف المقابل غير موجود', en: 'Interviewer profile not found' } },
        { status: 404 },
      );
    }

    // Calculate pending payout: completed bookings that haven't been paid out yet
    const paidPayoutTotal = await db.interviewerPayout.aggregate({
      where: {
        interviewerId: interviewer.id,
        status: 'PAID',
      },
      _sum: { amount: true },
    });

    const pendingPayoutTotal = await db.interviewerPayout.aggregate({
      where: {
        interviewerId: interviewer.id,
        status: 'PENDING',
      },
      _sum: { amount: true },
    });

    // Completed bookings where payout hasn't been created yet
    const unpaidBookings = await db.humanBooking.aggregate({
      where: {
        interviewerId: interviewer.id,
        status: 'COMPLETED',
      },
      _sum: { interviewerPayout: true },
    });

    const totalPaidOut = paidPayoutTotal._sum.amount || 0;
    const pendingPayout = pendingPayoutTotal._sum.amount || 0;
    const totalCompletedPayout = unpaidBookings._sum.interviewerPayout || 0;

    // Pending = total from completed bookings minus what's already in payout records
    const unclaimedEarnings = Math.max(0, totalCompletedPayout - pendingPayout - totalPaidOut);

    const recentPayouts = await db.interviewerPayout.findMany({
      where: { interviewerId: interviewer.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      earnings: {
        totalEarnings: interviewer.totalEarnings,
        totalPaidOut,
        pendingPayout: pendingPayout + unclaimedEarnings,
        unclaimedEarnings,
        payoutEmail: interviewer.payoutEmail,
      },
      recentPayouts,
    });
  } catch (err) {
    console.error('GET /api/interviewer/earnings error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء جلب الأرباح', en: 'Error fetching earnings' } },
      { status: 500 },
    );
  }
}
