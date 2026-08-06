import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ApiError, requireApiAuth } from '@/lib/session';

export const dynamic = 'force-dynamic';

/** List PayPal payments for the signed-in candidate. */
export async function GET() {
  try {
    const { userId } = await requireApiAuth();

    const payments = await db.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        packageType: true,
        paypalOrderId: true,
        sessionsCredited: true,
        capturedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ payments });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('[GET /api/candidate/payments]', err);
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
}
