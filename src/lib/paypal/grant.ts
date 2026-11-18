import 'server-only';
import { paypalDb } from '@/lib/paypal/seams';
import { PaymentStatus, PaymentType } from '@/lib/enums';
import { PLAN_CONFIG } from '@/lib/paypal';
import { grantPlan } from '@/lib/plans/entitlements';
import {
  decideCapture,
  type CaptureFacts,
  type OrderSnapshot,
  type Rejection,
} from '@/lib/paypal/order-rules';

/**
 * The single place a PayPal capture becomes an entitlement.
 *
 * Capture endpoint, webhook and reconciliation all call this. It is idempotent
 * at the database level (Payment.paypalOrderId @unique) and returns an outcome
 * instead of throwing, so callers never have to guess whether a failure means
 * "retry" or "the customer already has it".
 */

/**
 * The database surface this module needs. Typed loosely on purpose: it lets the
 * same code run against Prisma in production and against a SQL test double,
 * while keeping the call sites honest. Passed explicitly so tests can inject.
 */
export interface GrantDb {
  user: {
    update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  };
  paypalOrder: {
    findUnique(args: { where: { ref: string } }): Promise<OrderRow | null>;
    updateMany(args: {
      where: { ref: string; grantedAt?: null; status?: unknown };
      data: Record<string, unknown>;
    }): Promise<{ count: number }>;
    update(args: { where: { ref: string }; data: Record<string, unknown> }): Promise<unknown>;
  };
  payment: {
    create(args: { data: Record<string, unknown> }): Promise<{ id: string }>;
    findUnique(args: { where: { paypalOrderId: string } }): Promise<{ id: string } | null>;
  };
  $transaction<T>(fn: (tx: GrantDb) => Promise<T>): Promise<T>;
}

interface OrderRow {
  ref: string;
  userId: string;
  planCode: string;
  amountCents: number;
  currency: string;
  status: string;
  grantedAt: Date | null;
  paypalOrderId: string | null;
}

export type GrantOutcome =
  | { status: 'granted'; paymentId: string }
  | { status: 'already_granted'; paymentId: string | null }
  | { status: 'rejected'; reason: Rejection; detail?: string };

function snapshot(order: OrderRow | null): OrderSnapshot | null {
  if (!order) return null;
  return {
    ref: order.ref,
    userId: order.userId,
    planCode: order.planCode,
    amountCents: order.amountCents,
    currency: order.currency,
    status: order.status,
    grantedAt: order.grantedAt,
    paypalOrderId: order.paypalOrderId,
  };
}

/**
 * Grant exactly one entitlement for one captured PayPal order.
 *
 * @param ref   PaypalOrder.ref
 * @param facts values read from PayPal's response — never from the client
 * @param opts  userId: pass for HTTP callers (ownership); omit for webhook/cron
 *              db: pass a transaction-scoped or test client
 */
export async function grantForCapture(
  ref: string,
  facts: CaptureFacts,
  opts: { userId?: string; db?: GrantDb } = {},
): Promise<GrantOutcome> {
  const client = opts.db ?? (paypalDb() as unknown as GrantDb);
  const order = await client.paypalOrder.findUnique({ where: { ref } });

  const decision = decideCapture(snapshot(order), facts, {
    userId: opts.userId,
    expectedMerchantId: process.env.PAYPAL_MERCHANT_ID ?? null,
  });

  if (decision.action === 'already_granted') {
    const existing = order?.paypalOrderId
      ? await client.payment.findUnique({ where: { paypalOrderId: order.paypalOrderId } })
      : null;
    return { status: 'already_granted', paymentId: existing?.id ?? null };
  }

  if (decision.action === 'reject') {
    if (order) {
      if (decision.reason === 'not_completed') {
        // PENDING / DECLINED: record what PayPal said. No grant, no refund.
        await client.paypalOrder.updateMany({
          where: { ref, grantedAt: null },
          data: {
            captureId: facts.captureId,
            captureStatus: facts.captureStatus,
            status: 'APPROVED',
          },
        });
      } else {
        await client.paypalOrder.updateMany({
          where: { ref, grantedAt: null },
          data: {
            status: 'REVIEW',
            failureCode: decision.reason,
            failureDetail: decision.detail ? decision.detail.slice(0, 500) : null,
          },
        });
      }
    }
    return { status: 'rejected', reason: decision.reason, detail: decision.detail };
  }

  // ---- decision.action === 'grant' --------------------------------------
  const row = order as OrderRow;
  const config = PLAN_CONFIG[row.planCode];
  if (!config) {
    return { status: 'rejected', reason: 'plan_not_sellable', detail: row.planCode };
  }

  try {
    // One transaction: ledger row + entitlement + order state, or none of it.
    const paymentId = await client.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: row.userId,
          type: PaymentType.AI_PACKAGE,
          amount: row.amountCents / 100,
          currency: row.currency,
          packageType: row.planCode,
          paypalOrderId: facts.paypalOrderId,
          status: PaymentStatus.COMPLETED,
          sessionsCredited: config.sessions,
          idempotencyKey: `${row.userId}-${facts.paypalOrderId}`,
          capturedAt: new Date(),
        },
      });

      // Entitlements exactly as before — same function, same arguments. It now
      // joins this transaction instead of opening its own write.
      await grantPlan({
        userId: row.userId,
        planKey: config.planKey,
        sessions: config.sessions,
        tx: tx as never,
      });

      await tx.paypalOrder.update({
        where: { ref },
        data: {
          status: 'COMPLETED',
          grantedAt: new Date(),
          captureId: facts.captureId,
          captureStatus: facts.captureStatus,
          payerId: facts.payerId,
          merchantId: facts.merchantId,
          paypalOrderId: facts.paypalOrderId,
        },
      });

      return payment.id;
    });

    return { status: 'granted', paymentId };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      // A concurrent caller won the race on Payment.paypalOrderId. That is
      // success, not failure — and never a reason to refund.
      const existing = await client.payment.findUnique({
        where: { paypalOrderId: facts.paypalOrderId },
      });
      await client.paypalOrder.updateMany({
        where: { ref, grantedAt: null },
        data: { status: 'COMPLETED', grantedAt: new Date() },
      });
      return { status: 'already_granted', paymentId: existing?.id ?? null };
    }
    throw e;
  }
}

/**
 * Grant for a legacy order (created before PaypalOrder existed, so no row to
 * match). The plan must be unambiguous; ownership comes from PayPal's custom_id.
 */
export async function grantLegacy(
  input: {
    userId: string;
    paypalOrderId: string;
    planCode: string;
    facts: CaptureFacts;
  },
  opts: { db?: GrantDb } = {},
): Promise<GrantOutcome> {
  const client = opts.db ?? (paypalDb() as unknown as GrantDb);
  const config = PLAN_CONFIG[input.planCode];
  if (!config) {
    return { status: 'rejected', reason: 'plan_not_sellable', detail: input.planCode };
  }

  try {
    const paymentId = await client.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          userId: input.userId,
          type: PaymentType.AI_PACKAGE,
          amount: input.facts.amountCents / 100,
          currency: input.facts.currency,
          packageType: input.planCode,
          paypalOrderId: input.paypalOrderId,
          status: PaymentStatus.COMPLETED,
          sessionsCredited: config.sessions,
          idempotencyKey: `${input.userId}-${input.paypalOrderId}`,
          capturedAt: new Date(),
        },
      });
      await grantPlan({
        userId: input.userId,
        planKey: config.planKey,
        sessions: config.sessions,
        tx: tx as never,
      });
      return payment.id;
    });
    return { status: 'granted', paymentId };
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'P2002') {
      const existing = await client.payment.findUnique({
        where: { paypalOrderId: input.paypalOrderId },
      });
      return { status: 'already_granted', paymentId: existing?.id ?? null };
    }
    throw e;
  }
}
