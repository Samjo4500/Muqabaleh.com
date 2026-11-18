/**
 * Pure decision logic for PayPal orders and captures.
 *
 * No Prisma, no network, no Next.js — so it is unit-testable and reviewable on
 * its own. The route handlers ask these functions "what may I do?", then act.
 */

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

/**
 * Plans the storefront may sell right now.
 *
 * The legacy SKUs PRO ($9.99) and UNLIMITED ($29.99) are deliberately excluded:
 * they are still in PLAN_CONFIG for receipts, but `?plan=PRO` must no longer
 * produce a live $9.99 order.
 */
export const SELLABLE_PLANS = ['JEANNIE', 'JEANNIE_PRO', 'MASTERY_PACK'] as const;
export type SellablePlan = (typeof SELLABLE_PLANS)[number];

export function isSellablePlan(value: unknown): value is SellablePlan {
  return (
    typeof value === 'string' &&
    (SELLABLE_PLANS as readonly string[]).includes(value.toUpperCase())
  );
}

/** "29.99" | 29.99 -> 2999. Never produces 29.989999. */
export function toCents(amount: string | number): number | null {
  const n = typeof amount === 'number' ? amount : Number.parseFloat(amount);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function centsToMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ---------------------------------------------------------------------------
// Capture decision
// ---------------------------------------------------------------------------

export interface OrderSnapshot {
  ref: string;
  userId: string;
  planCode: string;
  amountCents: number;
  currency: string;
  /** CREATED|APPROVED|COMPLETED|FAILED|VOIDED|REVIEW */
  status: string;
  grantedAt: Date | null;
  paypalOrderId: string | null;
}

export interface CaptureFacts {
  paypalOrderId: string;
  captureId: string;
  /** COMPLETED | PENDING | DECLINED … */
  captureStatus: string;
  amountCents: number;
  currency: string;
  merchantId: string | null;
  payerId: string | null;
}

export type Rejection =
  | 'order_not_found'
  | 'order_not_owned'
  | 'order_voided'
  | 'order_mismatch'
  | 'amount_mismatch'
  | 'currency_mismatch'
  | 'merchant_mismatch'
  | 'not_completed'
  | 'plan_not_sellable';

export type Decision =
  | { action: 'grant' }
  | { action: 'already_granted' }
  | { action: 'reject'; reason: Rejection; detail?: string };

export interface DecideOptions {
  /** Present when a signed-in user is driving the capture (HTTP request). */
  userId?: string;
  /** The merchant that must receive the money, from env. */
  expectedMerchantId?: string | null;
}

/**
 * Decide whether a capture may activate this order.
 *
 * Check order matters:
 *   1. already granted  → success, touch nothing (this is the bug being fixed:
 *                         the old code threw P2002 here, then refunded)
 *   2. ownership        → an order id in a URL is not authorisation
 *   3. order identity   → a capture from a different PayPal order is not this one
 *   4. money            → compared to the price the server agreed to, as integers
 *   5. settlement       → PENDING (e-cheque) grants nothing until COMPLETED
 */
export function decideCapture(
  order: OrderSnapshot | null,
  facts: CaptureFacts,
  opts: DecideOptions = {},
): Decision {
  if (!order) return { action: 'reject', reason: 'order_not_found' };

  if (order.grantedAt) return { action: 'already_granted' };

  if (opts.userId && order.userId !== opts.userId) {
    return { action: 'reject', reason: 'order_not_owned' };
  }

  if (order.status === 'VOIDED') return { action: 'reject', reason: 'order_voided' };

  if (!isSellablePlan(order.planCode)) {
    return { action: 'reject', reason: 'plan_not_sellable', detail: order.planCode };
  }

  if (order.paypalOrderId && facts.paypalOrderId && order.paypalOrderId !== facts.paypalOrderId) {
    return { action: 'reject', reason: 'order_mismatch', detail: 'capture belongs to another order' };
  }

  if (!Number.isInteger(facts.amountCents) || facts.amountCents !== order.amountCents) {
    return {
      action: 'reject',
      reason: 'amount_mismatch',
      detail: `${facts.amountCents} != ${order.amountCents}`,
    };
  }

  if (String(facts.currency).toUpperCase() !== String(order.currency).toUpperCase()) {
    return {
      action: 'reject',
      reason: 'currency_mismatch',
      detail: `${facts.currency} != ${order.currency}`,
    };
  }

  const expected = opts.expectedMerchantId;
  if (expected && facts.merchantId && facts.merchantId !== expected) {
    return { action: 'reject', reason: 'merchant_mismatch', detail: facts.merchantId };
  }

  if (facts.captureStatus !== 'COMPLETED') {
    return { action: 'reject', reason: 'not_completed', detail: facts.captureStatus };
  }

  return { action: 'grant' };
}

// ---------------------------------------------------------------------------
// Legacy amount lookup
// ---------------------------------------------------------------------------

/**
 * Resolve a plan from a captured amount for orders that predate PaypalOrder.
 *
 * Returns null when zero OR MORE THAN ONE sellable plan matches. The old
 * `findPlanByAmount` returned the first match, so $29.99 always resolved to
 * JEANNIE_PRO and UNLIMITED was unreachable.
 */
export function resolveLegacyPlan(
  amountValue: string,
  catalog: Record<string, { amount: string }>,
  sellable: readonly string[] = SELLABLE_PLANS,
): string | null {
  const normalized = Number.parseFloat(amountValue).toFixed(2);
  if (!Number.isFinite(Number.parseFloat(normalized))) return null;
  const matches = Object.entries(catalog).filter(
    ([code, config]) =>
      sellable.includes(code) &&
      Number.parseFloat(config.amount).toFixed(2) === normalized,
  );
  return matches.length === 1 ? matches[0][0] : null;
}

// ---------------------------------------------------------------------------
// Live-mode guard
// ---------------------------------------------------------------------------

/**
 * Real money is refused unless it has been switched on deliberately.
 * Fails closed: a missing flag in production means no charges.
 */
export function liveModeAllowed(
  mode: string | undefined,
  allowFlag: string | undefined,
): boolean {
  if (mode !== 'live') return true; // sandbox is always fine
  return allowFlag === 'true';
}

/**
 * Should `POST /api/paypal/activate` grant?
 *
 * The old code granted unconditionally, so every extra click (back button,
 * double submit, a re-opened tab) pushed `subscriptionExpiresAt` another month
 * into the future — a free month per click. A subscription grants once:
 * when it is first seen ACTIVE and has no completed payment on record.
 */
export function decideActivation(input: {
  subscriptionStatus: string | null;
  paymentExists: boolean;
  paypalStatus: string;
}): 'grant' | 'already_active' | 'not_active' {
  if (input.paypalStatus !== 'ACTIVE') return 'not_active';
  if (input.paymentExists) return 'already_active';
  if (input.subscriptionStatus === 'ACTIVE') return 'already_active';
  return 'grant';
}
