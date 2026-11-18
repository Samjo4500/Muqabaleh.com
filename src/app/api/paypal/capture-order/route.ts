import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { captureFlow } from '@/lib/paypal/capture-flow';

/**
 * POST /api/paypal/capture-order   { orderId, ref? }
 *
 * Auth + JSON only. The money logic lives in lib/paypal/capture-flow.ts so it
 * can be tested without HTTP.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as Record<string, unknown> | undefined)?.id as
      | string
      | undefined;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { orderId?: string; ref?: string };
    if (!body.orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const result = await captureFlow({ paypalOrderId: body.orderId, ref: body.ref ?? null }, { userId });
    return NextResponse.json(result.body, { status: result.http });
  } catch (err) {
    console.error('[paypal/capture]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
