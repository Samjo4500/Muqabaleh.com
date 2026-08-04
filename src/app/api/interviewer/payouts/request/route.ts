import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BookingStatus, InterviewerStatus, PayoutStatus } from '@/lib/enums';
import { z } from 'zod';

const MIN_PAYOUT_CENTS = 5000; // $50 — clients still send amount in cents

const requestSchema = z.object({
  amount: z.number().min(MIN_PAYOUT_CENTS),
  paypalEmail: z.string().email(),
});

// POST /api/interviewer/payouts/request
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    // Clients send cents; InterviewerPayout.amount is stored in dollars
    const amountCents = parsed.data.amount;
    const amountDollars = amountCents / 100;
    const { paypalEmail } = parsed.data;

    try {
      const interviewer = await db.interviewer.findUnique({
        where: { userId },
        select: { id: true, userId: true, status: true },
      });

      if (!interviewer || interviewer.status !== InterviewerStatus.ACTIVE) {
        return NextResponse.json(
          { error: { ar: 'المحاور غير موجود أو غير مفعل', en: 'Interviewer not found or not active' } },
          { status: 403 },
        );
      }

      // Bookings store interviewerPayout in cents
      const bookingAgg = await db.humanBooking.aggregate({
        where: { interviewerId: interviewer.id, status: BookingStatus.COMPLETED },
        _sum: { interviewerPayout: true },
      });

      const totalEarnedCents = bookingAgg._sum.interviewerPayout || 0;

      // Payouts store amount in dollars
      const payoutAgg = await db.interviewerPayout.aggregate({
        where: {
          interviewerId: interviewer.id,
          status: {
            in: [PayoutStatus.COMPLETED, PayoutStatus.PROCESSING, PayoutStatus.PENDING],
          },
        },
        _sum: { amount: true },
      });

      const totalWithdrawnCents = Math.round((payoutAgg._sum.amount || 0) * 100);
      const availableBalanceCents = totalEarnedCents - totalWithdrawnCents;

      if (amountCents > availableBalanceCents) {
        return NextResponse.json(
          {
            error: {
              ar: 'رصيد غير كافٍ',
              en: 'Insufficient balance',
              availableBalance: availableBalanceCents,
            },
          },
          { status: 400 },
        );
      }

      // Collect completed booking IDs not already covered by open/paid payouts
      const priorPayouts = await db.interviewerPayout.findMany({
        where: {
          interviewerId: interviewer.id,
          status: {
            in: [PayoutStatus.PENDING, PayoutStatus.PROCESSING, PayoutStatus.COMPLETED],
          },
        },
        select: { bookingIds: true },
      });
      const alreadyCovered = new Set(priorPayouts.flatMap((p) => p.bookingIds));

      const unpaidBookings = await db.humanBooking.findMany({
        where: {
          interviewerId: interviewer.id,
          status: BookingStatus.COMPLETED,
        },
        select: { id: true, interviewerPayout: true },
        orderBy: { createdAt: 'asc' },
      });

      const bookingIds: string[] = [];
      let coveredCents = 0;
      for (const b of unpaidBookings) {
        if (alreadyCovered.has(b.id)) continue;
        bookingIds.push(b.id);
        coveredCents += b.interviewerPayout;
        if (coveredCents >= amountCents) break;
      }

      const payout = await db.interviewerPayout.create({
        data: {
          interviewerId: interviewer.id,
          userId: interviewer.userId,
          amount: amountDollars,
          paypalEmail: paypalEmail.toLowerCase().trim(),
          status: PayoutStatus.PENDING,
          bookingIds,
        },
      });

      return NextResponse.json({ success: true, payoutId: payout.id });
    } catch (dbErr) {
      console.warn('[POST /api/interviewer/payouts/request] DB unavailable:', dbErr);
      return NextResponse.json(
        { error: { ar: 'خطأ في قاعدة البيانات', en: 'Database error' } },
        { status: 503 },
      );
    }
  } catch (err) {
    console.error('POST /api/interviewer/payouts/request error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء تقديم الطلب', en: 'Error submitting payout request' } },
      { status: 500 },
    );
  }
}
