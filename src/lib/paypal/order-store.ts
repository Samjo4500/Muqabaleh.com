import { randomUUID } from 'node:crypto';
import { paypalDb } from '@/lib/paypal/seams';
import { PLAN_CONFIG } from '@/lib/paypal';
import {
  centsToMoney,
  isSellablePlan,
  toCents,
  type SellablePlan,
} from '@/lib/paypal/order-rules';

/**
 * Creation and lookup of checkout intents.
 *
 * The defect this closes: `create-order` used to accept a plan string and call
 * PayPal directly. Nothing recorded what the server had agreed to sell, so
 * `capture-order` reverse-engineered the plan from the captured amount — and
 * $29.99 matched both JEANNIE_PRO and UNLIMITED.
 */

export interface OrderIntent {
  ref: string;
  planCode: SellablePlan;
  amountCents: number;
  currency: string;
  userId: string;
}

/** All reads and writes go through the shared client (see lib/paypal/seams.ts). */
const store = () => paypalDb<ReturnType<typeof paypalDbRef>>();
function paypalDbRef() {
  return paypalDb();
}

function newRef(): string {
  // PayPal invoice_id limit is 127 chars; this is 39.
  return `mo_${randomUUID()}`;
}

export function priceCentsFor(planCode: SellablePlan): number {
  const config = PLAN_CONFIG[planCode];
  if (!config) throw new Error(`No catalog entry for plan ${planCode}`);
  const cents = toCents(config.amount);
  if (cents === null || cents <= 0) {
    throw new Error(`Invalid catalog amount for plan ${planCode}: ${config.amount}`);
  }
  return cents;
}

export function currencyFor(planCode: SellablePlan): string {
  return PLAN_CONFIG[planCode]?.currency ?? 'USD';
}

export function descriptionFor(planCode: SellablePlan): string {
  return PLAN_CONFIG[planCode]?.description ?? `Muqabaleh ${planCode}`;
}

export function moneyFor(planCode: SellablePlan): string {
  return centsToMoney(priceCentsFor(planCode));
}

/**
 * Record the intent BEFORE contacting PayPal, so an abandoned checkout is
 * visible to reconciliation instead of vanishing without a trace.
 */
export async function createOrderIntent(
  userId: string,
  planCode: SellablePlan,
): Promise<OrderIntent> {
  const amountCents = priceCentsFor(planCode);
  const currency = currencyFor(planCode);
  const ref = newRef();

  await store().paypalOrder.create({
    data: { ref, userId, planCode, amountCents, currency, status: 'CREATED' },
  });

  return { ref, planCode, amountCents, currency, userId };
}

export async function attachPayPalOrderId(ref: string, paypalOrderId: string): Promise<void> {
  await store().paypalOrder.update({ where: { ref }, data: { paypalOrderId } });
}

export async function markApproved(ref: string): Promise<void> {
  await store().paypalOrder.updateMany({
    where: { ref, status: 'CREATED' },
    data: { status: 'APPROVED' },
  });
}

export async function markFailed(
  ref: string,
  code: string | null,
  detail: string | null,
): Promise<void> {
  await store().paypalOrder.updateMany({
    where: { ref, status: { in: ['CREATED', 'APPROVED', 'FAILED'] } },
    data: {
      status: 'FAILED',
      failureCode: code,
      failureDetail: detail ? detail.slice(0, 500) : null,
    },
  });
}

export async function findByRef(ref: string) {
  return store().paypalOrder.findUnique({ where: { ref } });
}

export async function findByPayPalOrderId(paypalOrderId: string) {
  return store().paypalOrder.findUnique({ where: { paypalOrderId } });
}

/** Resolve an order from anything a webhook or return URL may carry. */
export async function resolveOrder(input: {
  ref?: string | null;
  paypalOrderId?: string | null;
  captureId?: string | null;
}) {
  if (input.ref) {
    const byRef = await findByRef(input.ref);
    if (byRef) return byRef;
  }
  if (input.paypalOrderId) {
    const byPayPal = await findByPayPalOrderId(input.paypalOrderId);
    if (byPayPal) return byPayPal;
  }
  if (input.captureId) {
    return store().paypalOrder.findUnique({ where: { captureId: input.captureId } });
  }
  return null;
}
