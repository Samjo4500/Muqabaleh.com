import {
  capturePayPalOrder,
  captureViewOf,
  getPayPalOrder,
  refundCapture,
  type CaptureView,
  type OrderState,
} from '@/lib/paypal/client';
import { markFailed, resolveOrder } from '@/lib/paypal/order-store';
import { grantForCapture, grantLegacy } from '@/lib/paypal/grant';
import { resolveLegacyPlan, type Rejection } from '@/lib/paypal/order-rules';
import { PLAN_CONFIG } from '@/lib/paypal';
import { paypalDb } from '@/lib/paypal/seams';

/**
 * The capture flow, with no Next.js in it.
 *
 * The route is a thin auth + JSON shell around this, so the money logic can be
 * exercised against PayPal's sandbox semantics in tests. Every branch below is
 * covered by tests/paypal/capture-flow.test.ts.
 *
 * Refund policy: a refund is issued only when money moved AND we cannot
 * legitimately grant. Never on a replay, never on a pending capture.
 */

export type CaptureFlowResult =
  | { http: 200; body: { success: true; alreadyGranted: boolean; tier: string; ref?: string } }
  | { http: 202; body: { pending: true; state?: string } }
  | { http: 400 | 401 | 403 | 409 | 502 | 503; body: Record<string, unknown> };

interface Options {
  /** Set when called from the HTTP route; omitted for trusted internal callers. */
  userId?: string;
}

function json<B extends Record<string, unknown>>(http: 200, body: B & { success: true }): CaptureFlowResult;
function json<B extends Record<string, unknown>>(http: 202, body: B & { pending: true }): CaptureFlowResult;
function json<B extends Record<string, unknown>>(
  http: 400 | 401 | 403 | 409 | 502 | 503,
  body: B,
): CaptureFlowResult;
function json(http: number, body: Record<string, unknown>): CaptureFlowResult {
  return { http, body } as CaptureFlowResult;
}

export async function captureFlow(
  input: { paypalOrderId: string; ref?: string | null },
  opts: Options = {},
): Promise<CaptureFlowResult> {
  const { paypalOrderId } = input;
  const order = await resolveOrder({ ref: input.ref ?? null, paypalOrderId });

  // Orders created before this deployhave no PaypalOrder row.
  if (!order) return legacyCapture(paypalOrderId, opts.userId);

  if (opts.userId && order.userId !== opts.userId) {
    return json(403, { error: 'Forbidden' });
  }

  // ---- idempotency: the whole point --------------------------------------
  if (order.grantedAt) {
    return json(200, {
      success: true,
      alreadyGranted: true,
      tier: order.planCode,
      ref: order.ref,
    });
  }

  // ---- preflight: never capture blind ------------------------------------
  const pre = await getPayPalOrder(paypalOrderId);
  if (!pre.ok) {
    console.error('[paypal/capture] preflight failed', pre.status, pre.issue);
    return json(502, { error: 'Could not read order' });
  }

  const advance = await advanceToCaptured(pre.data, order.ref);
  if ('error' in advance) return advance.error;

  const view = captureViewOf(advance.state);
  if (!view) {
    await markFailed(order.ref, 'NO_CAPTURE', `order status ${advance.state.status}`);
    return json(409, { error: 'No capture on order' });
  }

  const outcome = await grantForCapture(order.ref, view, {
    userId: opts.userId,
    db: paypalDb() as never,
  });

  if (outcome.status === 'granted' || outcome.status === 'already_granted') {
    return json(200, {
      success: true,
      alreadyGranted: outcome.status === 'already_granted',
      tier: order.planCode,
      ref: order.ref,
    });
  }

  if (outcome.reason === 'not_completed') {
    // PENDING (e-cheque) / DECLINED: no money to refund, no entitlement yet.
    return json(202, { pending: true, state: outcome.detail });
  }

  // Money moved but this order is not what we agreed to sell. Refund once, and
  // leave the order in REVIEW carrying the reason.
  const refunded = await safeRefund(view, outcome.reason, order.ref);
  return json(400, {
    error: 'Payment not processed',
    reason: outcome.reason,
    refunded,
  });
}

/**
 * Refund a capture at most once per order.
 *
 * A mismatch is a permanent condition, so a retry would otherwise refund the
 * same capture again. The order row carries the marker: whoever sets it first
 * owns the refund, and PayPal itself rejects a second refund of the same
 * capture — both layers are kept.
 */
async function safeRefund(
  view: CaptureView,
  reason: Rejection | string,
  ref: string | null,
): Promise<boolean> {
  const store = paypalDb() as unknown as GrantDbLike;

  if (store && ref) {
    const current = await store.paypalOrder.findUnique({ where: { ref } });
    if (current?.refundedAt) return true; // already handled
    const claimed = await store.paypalOrder.updateMany({
      where: { ref, refundedAt: null },
      data: { refundedAt: new Date() },
    });
    if (claimed.count === 0) return true;
  }

  try {
    const res = await refundCapture(view.captureId, `Automatic refund: ${reason}`);
    if (!res.ok && res.issue !== 'CAPTURE_FULLY_REFUNDED') {
      console.error('[paypal/capture] REFUND FAILED — manual action needed', {
        captureId: view.captureId,
        reason,
        issue: res.issue,
      });
      return false;
    }
    return true;
  } catch (e) {
    console.error('[paypal/capture] REFUND THREW — manual action needed', {
      captureId: view.captureId,
      reason,
      e,
    });
    return false;
  }
}

interface GrantDbLike {
  paypalOrder: {
    findUnique(args: { where: { ref: string } }): Promise<{ ref: string; refundedAt: Date | null } | null>;
    updateMany(args: {
      where: { ref: string; refundedAt: null };
      data: { refundedAt: Date };
    }): Promise<{ count: number }>;
  };
}

/**
 * Drives a PayPal order from its current state to "captured", or explains why
 * it cannot be. Never captures an order the buyer has not approved.
 */
async function advanceToCaptured(
  initialState: OrderState,
  ref: string,
): Promise<{ state: OrderState } | { error: CaptureFlowResult }> {
  let state = initialState;

  if (state.status === 'COMPLETED') return { state };

  if (state.status !== 'APPROVED') {
    // CREATED / SAVED / PAYER_ACTION_REQUIRED / VOIDED.
    return { error: json(409, { error: 'Order not approved yet', state: state.status }) };
  }

  const captured = await capturePayPalOrder(state.id, `capture_${ref}`);
  if (captured.ok) return { state: captured.data };

  if (captured.issue === 'ORDER_ALREADY_CAPTURED') {
    // The webhook or another tab got there first: read the settled state.
    const reread = await getPayPalOrder(state.id);
    if (!reread.ok) return { error: json(502, { error: 'Could not read order' }) };
    return { state: reread.data };
  }

  console.error('[paypal/capture] capture failed', captured.status, captured.issue);
  await markFailed(ref, captured.issue, captured.message);
  return { error: json(502, { error: 'Capture failed' }) };
}

/**
 * Legacy path for orders created before PaypalOrder existed. Ownership comes
 * from PayPal's custom_id; the plan must be unambiguous or we refund.
 */
async function legacyCapture(
  paypalOrderId: string,
  userId?: string,
): Promise<CaptureFlowResult> {
  const pre = await getPayPalOrder(paypalOrderId);
  if (!pre.ok) return json(502, { error: 'Could not read order' });

  const advance = await advanceToCaptured(pre.data, `legacy_${paypalOrderId}`);
  if ('error' in advance) return advance.error;

  const unit = advance.state.purchase_units?.[0];
  const customId = (unit as { custom_id?: string } | undefined)?.custom_id;
  if (userId) {
    if (!customId) return json(403, { error: 'Forbidden' });
    if (customId !== userId) return json(403, { error: 'Forbidden' });
  }

  const view = captureViewOf(advance.state);
  if (!view) return json(409, { error: 'No capture on order' });

  // Ambiguous amounts are refused rather than resolved by object order.
  const plan = resolveLegacyPlan(
    (view.amountCents / 100).toFixed(2),
    PLAN_CONFIG as unknown as Record<string, { amount: string }>,
  );
  if (!plan) {
    const refunded = await safeRefund(view, 'amount_ambiguous', null);
    return json(400, { error: 'Amount mismatch', refunded });
  }

  const outcome = await grantLegacy(
    {
      userId: customId as string,
      paypalOrderId,
      planCode: plan,
      facts: view,
    },
    { db: paypalDb() as never },
  );

  if (outcome.status === 'granted' || outcome.status === 'already_granted') {
    return json(200, { success: true, alreadyGranted: outcome.status === 'already_granted', tier: plan });
  }
  if (outcome.reason === 'not_completed') return json(202, { pending: true, detail: outcome.detail });
  return json(400, { error: 'Payment not processed', reason: outcome.reason });
}
