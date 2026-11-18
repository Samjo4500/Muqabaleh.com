import 'server-only';
import { db as baseDb } from '@/lib/db';
import { paypalDb } from '@/lib/paypal/seams';
import { planKeyForPayPalPlanId, verifyWebhookSignature } from '@/lib/paypal';
import { grantPlan, revokeToFree } from '@/lib/plans/entitlements';
import { markApproved, resolveOrder } from '@/lib/paypal/order-store';
import { grantForCapture } from '@/lib/paypal/grant';
import { captureViewOf, getPayPalOrder } from '@/lib/paypal/client';
import { decideActivation } from '@/lib/paypal/order-rules';

/**
 * PayPal webhook, without Next.js in it (the route is a 6-line shell).
 *
 * Fixed vs the previous version:
 *   1. One-time captures are handled at all. PAYMENT.CAPTURE.COMPLETED / DENIED
 *      / REFUNDED were ignored, so a buyer who closed the tab left no trace and
 *      got no entitlement even though the money was taken.
 *   2. Events are deduped by PayPal's event id (PayPal retries until it gets 2xx).
 *   3. CHECKOUT.ORDER.APPROVED records the approval, so an abandoned return is
 *      visible to reconciliation.
 *   4. The capture is re-read from PayPal — the payload is never trusted for the
 *      amount, currency or merchant.
 *   5. Subscription grants are once-only (a retried webhook used to add a month).
 *   6. Signature verification is unchanged and still fails closed.
 */

export interface WebhookResult {
  status: number;
  body: Record<string, unknown>;
}

const json = (body: Record<string, unknown>, status: number): WebhookResult => ({ status, body });

/** Shared client: Prisma in production, the real test database in tests. */
const dbc = () => paypalDb<typeof baseDb>();

const SUBSCRIPTION_EVENTS = new Set([
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
  'BILLING.SUBSCRIPTION.EXPIRED',
  'BILLING.SUBSCRIPTION.ACTIVATED',
  'PAYMENT.SALE.COMPLETED',
]);

const CAPTURE_EVENTS = new Set([
  'PAYMENT.CAPTURE.COMPLETED',
  'PAYMENT.CAPTURE.DENIED',
  'PAYMENT.CAPTURE.REFUNDED',
  'CHECKOUT.ORDER.APPROVED',
]);

interface PayPalEvent {
  id: string;
  event_type: string;
  resource?: {
    id?: string;
    status?: string;
    custom_id?: string;
    invoice_id?: string;
    amount?: { value?: string; currency_code?: string };
    billing_agreement_id?: string;
    billing_info?: { next_billing_time?: string };
    supplementary_data?: { related_ids?: { order_id?: string; capture_id?: string } };
  };
}

export async function handleWebhook(rawBody: string, headers: Headers): Promise<WebhookResult> {
  // 1. Verify before anything else touches the body.
  const valid = await verifyWebhookSignature(rawBody, headers);
  if (!valid) {
    console.warn('[paypal/webhook] signature verification failed');
    return json({ error: 'Unauthorized' }, 401);
  }

  let event: PayPalEvent;
  try {
    event = JSON.parse(rawBody) as PayPalEvent;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }
  if (!event?.id || !event?.event_type) return json({ error: 'Malformed event' }, 400);

  // 2. Dedupe on PayPal's event id.
  let duplicate = false;
  try {
    await dbc().webhookEvent.create({
      data: { id: event.id, type: event.event_type, payload: rawBody },
    });
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') duplicate = true;
    else console.error('[paypal/webhook] dedupe store unavailable', e);
  }
  if (duplicate) return json({ received: true, duplicate: true }, 200);

  try {
    const result = CAPTURE_EVENTS.has(event.event_type)
      ? await handleCaptureEvent(event)
      : SUBSCRIPTION_EVENTS.has(event.event_type)
        ? await handleSubscriptionEvent(event)
        : json({ received: true, ignored: event.event_type }, 200);

    await dbc().webhookEvent
      .update({ where: { id: event.id }, data: { processedAt: new Date() } })
      .catch(() => undefined);
    return result;
  } catch (err) {
    console.error('[paypal/webhook] processing failed', event.event_type, event.id, err);
    // 500 => PayPal retries; the handler is idempotent, so retrying is safe.
    return json({ error: 'Webhook failed' }, 500);
  }
}

// ---------------------------------------------------------------------------
// One-time captures
// ---------------------------------------------------------------------------
async function handleCaptureEvent(event: PayPalEvent): Promise<WebhookResult> {
  const resource = event.resource ?? {};

  if (event.event_type === 'CHECKOUT.ORDER.APPROVED') {
    const order = resource.id ? await resolveOrder({ paypalOrderId: resource.id }) : null;
    if (order) await markApproved(order.ref);
    return json({ received: true, approved: Boolean(order) }, 200);
  }

  const paypalOrderId = resource.supplementary_data?.related_ids?.order_id ?? undefined;

  const order = await resolveOrder({
    ref: resource.custom_id ?? resource.invoice_id ?? null,
    paypalOrderId: paypalOrderId ?? resource.id ?? null,
    captureId: resource.id ?? null,
  });

  if (!order) {
    // Created before PaypalOrder existed, or another integration entirely.
    console.warn('[paypal/webhook] capture for unknown order', {
      captureId: resource.id,
      ref: resource.custom_id,
      paypalOrderId,
    });
    return json({ received: true, unmatched: true }, 200);
  }

  if (event.event_type === 'PAYMENT.CAPTURE.DENIED') {
    await dbc().paypalOrder.updateMany({
      where: { ref: order.ref, status: { in: ['CREATED', 'APPROVED'] } },
      data: { status: 'FAILED', failureCode: 'CAPTURE_DENIED' },
    });
    return json({ received: true, denied: true }, 200);
  }

  if (event.event_type === 'PAYMENT.CAPTURE.REFUNDED') {
    // Record it; do NOT auto-revoke. A partial refund on a monthly plan must not
    // wipe the month — ops reviews and decides.
    await dbc().paypalOrder.updateMany({
      where: { ref: order.ref },
      data: { status: 'REVIEW', failureCode: 'REFUNDED', failureDetail: resource.id ?? null },
    });
    return json({ received: true, refunded: true }, 200);
  }

  // PAYMENT.CAPTURE.COMPLETED — the recovery path when the browser never returned.
  const fromPayPal = paypalOrderId;
  const stored = order.paypalOrderId;
  const orderId = stored ?? fromPayPal;
  if (!orderId) return json({ received: true, note: 'no paypal order id' }, 200);

  if (stored && fromPayPal && stored !== fromPayPal) {
    console.error('[paypal/webhook] order id mismatch', { ref: order.ref, stored, fromPayPal });
    return json({ received: true, rejected: 'order_mismatch' }, 200);
  }

  // Trust nothing in the payload: re-read from PayPal, then grant from that.
  const state = await getPayPalOrder(orderId);
  if (!state.ok) {
    console.error('[paypal/webhook] could not verify capture with PayPal', {
      ref: order.ref,
      status: state.status,
    });
    return json({ error: 'Verification failed' }, 500);
  }
  const view = captureViewOf(state.data);
  if (!view) return json({ received: true, note: 'no capture on order' }, 200);

  const outcome = await grantForCapture(order.ref, view);
  return json(
    {
      received: true,
      result: outcome.status,
      reason: outcome.status === 'rejected' ? outcome.reason : undefined,
    },
    200,
  );
}

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------
async function handleSubscriptionEvent(event: PayPalEvent): Promise<WebhookResult> {
  const resource = event.resource ?? {};
  const subscriptionId =
    event.event_type === 'PAYMENT.SALE.COMPLETED'
      ? (resource.billing_agreement_id ?? resource.id)
      : resource.id;

  if (!subscriptionId) return json({ received: true, note: 'no subscription ID' }, 200);

  switch (event.event_type) {
    case 'BILLING.SUBSCRIPTION.CANCELLED':
    case 'BILLING.SUBSCRIPTION.SUSPENDED':
    case 'BILLING.SUBSCRIPTION.EXPIRED': {
      const newStatus = event.event_type.split('.')[2];
      await dbc().paypalSubscription.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: { status: newStatus },
      });
      const sub = await dbc().paypalSubscription.findUnique({
        where: { paypalSubscriptionId: subscriptionId },
      });
      if (sub) {
        const activeCount = await dbc().paypalSubscription.count({
          where: { userId: sub.userId, status: 'ACTIVE' },
        });
        if (activeCount === 0) await revokeToFree(sub.userId);
      }
      return json({ received: true }, 200);
    }

    case 'BILLING.SUBSCRIPTION.ACTIVATED': {
      const sub = await dbc().paypalSubscription.findUnique({
        where: { paypalSubscriptionId: subscriptionId },
      });
      if (!sub) return json({ received: true, note: 'unknown subscription' }, 200);

      const prior = await dbc().payment.findUnique({
        where: { paypalOrderId: subscriptionId },
      });
      const decision = decideActivation({
        subscriptionStatus: sub.status,
        paymentExists: Boolean(prior),
        paypalStatus: 'ACTIVE',
      });
      const planKey = planKeyForPayPalPlanId(sub.paypalPlanId);
      if (planKey && decision === 'grant') {
        const nextBilling = resource.billing_info?.next_billing_time
          ? new Date(resource.billing_info.next_billing_time)
          : undefined;
        await grantPlan({
          userId: sub.userId,
          planKey,
          sessions: 999,
          ...(nextBilling ? { expiresAt: nextBilling } : {}),
        });
      }
      return json({ received: true }, 200);
    }

    case 'PAYMENT.SALE.COMPLETED': {
      const sub = await dbc().paypalSubscription.findUnique({
        where: { paypalSubscriptionId: subscriptionId },
      });
      if (!sub || (sub.status !== 'ACTIVE' && sub.status !== 'APPROVAL_PENDING')) {
        return json({ received: true }, 200);
      }
      const planKey = planKeyForPayPalPlanId(sub.paypalPlanId);
      if (!planKey) return json({ received: true, note: 'unknown plan id' }, 200);

      const nextBilling = resource.billing_info?.next_billing_time
        ? new Date(resource.billing_info.next_billing_time)
        : undefined;
      await grantPlan({
        userId: sub.userId,
        planKey,
        sessions: 999,
        expiresAt: nextBilling,
      });
      if (nextBilling) {
        await dbc().paypalSubscription.update({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'ACTIVE', nextBillingTime: nextBilling },
        });
      }
      return json({ received: true }, 200);
    }

    default:
      return json({ received: true }, 200);
  }
}
