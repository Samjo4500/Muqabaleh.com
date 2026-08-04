import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const MIN_PAYOUT_CENTS = 5000; // $50

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

    // Parse body
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { amount, paypalEmail } = parsed.data;

    try {
      const interviewer = await db.interviewer.findUnique({
        where: { userId },
        select: { id: true, status: true },
      });

      if (!interviewer || interviewer.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: { ar: 'المحاور غير موجود أو غير مفعل', en: 'Interviewer not found or not active' } },
          { status: 403 },
        );
      }

      // Calculate available balance
      const bookingAgg = await db.humanBooking.aggregate({
        where: { interviewerId: interviewer.id, status: 'COMPLETED' },
        _sum: { interviewerPayout: true },
      });

      const totalEarned = bookingAgg._sum.interviewerPayout || 0;

      const payoutAgg = await db.interviewerPayout.aggregate({
        where: {
          interviewerId: interviewer.id,
          status: { in: ['COMPLETED', 'PROCESSING'] },
        },
        _sum: { amount: true },
      });

      const totalWithdrawn = payoutAgg._sum.amount || 0;
      const availableBalance = totalEarned - totalWithdrawn;

      if (amount > availableBalance) {
        return NextResponse.json(
          { error: { ar: 'رصيد غير كافٍ', en: 'Insufficient balance', availableBalance } },
          { status: 400 },
        );
      }

      // Create payout record
      const payout = await db.interviewerPayout.create({
        data: {
          interviewerId: interviewer.id,
          amount,
          paypalEmail: paypalEmail.toLowerCase().trim(),
          status: 'PENDING',
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
