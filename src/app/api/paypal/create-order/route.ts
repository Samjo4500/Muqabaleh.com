import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPayPalOrder } from '@/lib/paypal/client';
import {
  attachPayPalOrderId,
  createOrderIntent,
  descriptionFor,
  markFailed,
} from '@/lib/paypal/order-store';
import { isSellablePlan, liveModeAllowed } from '@/lib/paypal/order-rules';

/**
 * POST /api/paypal/create-order   { plan: "JEANNIE" | "JEANNIE_PRO" | "MASTERY_PACK" }
 *
 * Fixed vs the previous version:
 *   1. Only SELLABLE_PLANS are accepted. `?plan=PRO` used to return a valid
 *      $9.99 order for a plan the storefront no longer sells.
 *   2. Price/currency come from the server catalog and are persisted in
 *      PaypalOrder, so capture compares against them instead of guessing.
 *   3. invoice_id + custom_id carry our ref, so any webhook can find the order.
 *   4. payee.merchant_id pins the funds to the configured merchant.
 *   5. PayPal-Request-Id makes a retry return the same order, not a second one.
 *   6. Live mode requires PAYPAL_ALLOW_LIVE_CHARGES=true (fails closed).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as Record<string, unknown> | undefined)?.id as
      | string
      | undefined;
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!liveModeAllowed(process.env.PAYPAL_MODE, process.env.PAYPAL_ALLOW_LIVE_CHARGES)) {
      console.error('[paypal/create-order] live charges disabled (PAYPAL_ALLOW_LIVE_CHARGES)');
      return NextResponse.json({ error: 'Payments are temporarily unavailable' }, { status: 503 });
    }

    const merchantId = process.env.PAYPAL_MERCHANT_ID;
    if (!process.env.PAYPAL_CLIENT_ID || !merchantId) {
      console.error('[paypal/create-order] PayPal is not fully configured');
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 503 });
    }

    // Body wins over query string. The old order of precedence let a query
    // parameter override the plan the page actually submitted.
    let planRaw: unknown;
    try {
      planRaw = ((await req.json()) as { plan?: unknown })?.plan;
    } catch {
      /* empty body */
    }
    if (planRaw === undefined || planRaw === null || planRaw === '') {
      planRaw = new URL(req.url).searchParams.get('plan');
    }

    if (!isSellablePlan(planRaw)) {
      return NextResponse.json(
        { error: 'Invalid plan', sellable: ['JEANNIE', 'JEANNIE_PRO', 'MASTERY_PACK'] },
        { status: 400 },
      );
    }
    const plan = planRaw.toUpperCase() as 'JEANNIE' | 'JEANNIE_PRO' | 'MASTERY_PACK';

    const intent = await createOrderIntent(userId, plan);

    const result = await createPayPalOrder({
      requestId: intent.ref,
      ref: intent.ref,
      planCode: intent.planCode,
      amountCents: intent.amountCents,
      currency: intent.currency,
      description: descriptionFor(intent.planCode),
      merchantId,
    });

    if (!result.ok || !result.data.id) {
      await markFailed(intent.ref, result.ok ? 'NO_ORDER_ID' : result.issue, result.ok ? null : result.message);
      return NextResponse.json(
        { error: result.ok ? 'PayPal did not return an order' : result.message },
        { status: 502 },
      );
    }

    await attachPayPalOrderId(intent.ref, result.data.id);

    return NextResponse.json({
      orderId: result.data.id,
      ref: intent.ref,
      amount: (intent.amountCents / 100).toFixed(2),
      currency: intent.currency,
      approveUrl: result.data.links?.find(
        (l) => l.rel === 'payer-action' || l.rel === 'approve',
      )?.href,
    });
  } catch (err) {
    console.error('[paypal/create-order]', err);
    return NextResponse.json({ error: 'PayPal error' }, { status: 500 });
  }
}
