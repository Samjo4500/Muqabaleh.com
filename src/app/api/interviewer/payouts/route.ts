import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/interviewer/payouts — list payout history for logged-in interviewer
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
        select: { id: true },
      });

      if (!interviewer) {
        return NextResponse.json({ payouts: [] });
      }

      const payouts = await db.interviewerPayout.findMany({
        where: { interviewerId: interviewer.id },
        orderBy: { requestedAt: 'desc' },
        select: {
          id: true,
          amount: true,
          paypalEmail: true,
          status: true,
          adminNote: true,
          batchId: true,
          requestedAt: true,
          processedAt: true,
          completedAt: true,
        },
      });

      // Convert dollars → cents for existing interviewer UI formatCents
      return NextResponse.json({
        payouts: payouts.map((p) => ({
          ...p,
          amount: Math.round(p.amount * 100),
        })),
      });
    } catch (dbErr) {
      console.warn('[GET /api/interviewer/payouts] DB unavailable:', dbErr);
      return NextResponse.json({ payouts: [] });
    }
  } catch (err) {
    console.error('GET /api/interviewer/payouts error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ', en: 'Error fetching payouts' } },
      { status: 500 },
    );
  }
}
