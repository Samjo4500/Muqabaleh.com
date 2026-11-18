import { paypalDb } from '@/lib/paypal/seams';
import { captureViewOf, getPayPalOrder } from '@/lib/paypal/client';
import { grantForCapture } from '@/lib/paypal/grant';
import { captureFlow } from '@/lib/paypal/capture-flow';

/**
 * Sweeps checkout intents that never resolved themselves.
 *
 * Nothing here can take money or refund it: it only finishes orders the buyer
 * already approved, and closes ones that were abandoned. Grants go through
 * `grantForCapture`, which is idempotent — a reconciliation run that races the
 * webhook cannot grant twice.
 *
 * Three cases exist in production:
 *
 *   APPROVED + a capture on PayPal  -> the capture succeeded but the buyer
 *                                      closed the tab before the redirect, and
 *                                      the webhook never arrived. Grant it.
 *   APPROVED + no capture           -> the buyer approved, we never captured.
 *                                      Capture now (the flow is idempotent).
 *   CREATED / unpaid                -> abandoned. Close it so it stops
 *                                      polluting the "pending" numbers.
 *   PENDING capture (e-cheque)      -> ask PayPal again; grant if it settled.
 */

export interface ReconcileOptions {
  /** Only touch orders older than this. Default 90 minutes. */
  olderThanMinutes?: number;
  /** Hard cap per run so a cron tick stays inside its time limit. */
  limit?: number;
  /** Only report, do not write. */
  dryRun?: boolean;
}

export interface ReconcileReport {
  looked: number;
  granted: number;
  stillPending: number;
  closed: number;
  failed: { ref: string; reason: string }[];
}

const STALE_STATUSES = ['CREATED', 'APPROVED'];

export async function reconcilePayPalOrders(
  opts: ReconcileOptions = {},
): Promise<ReconcileReport> {
  const olderThanMinutes = opts.olderThanMinutes ?? 90;
  const limit = opts.limit ?? 50;
  const dryRun = opts.dryRun ?? false;
  const db = paypalDb();
  const cutoff = new Date(Date.now() - olderThanMinutes * 60_000);

  const stale = await db.paypalOrder.findMany({
    where: {
      status: { in: STALE_STATUSES },
      grantedAt: null,
      createdAt: { lt: cutoff },
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  const report: ReconcileReport = {
    looked: stale.length,
    granted: 0,
    stillPending: 0,
    closed: 0,
    failed: [],
  };

  for (const order of stale) {
    try {
      const outcome = await settleOne(order, dryRun);
      if (outcome === 'granted') report.granted += 1;
      else if (outcome === 'pending') report.stillPending += 1;
      else if (outcome === 'closed') report.closed += 1;
    } catch (e) {
      console.error('[paypal/reconcile] failed for', order.ref, e);
      report.failed.push({ ref: order.ref, reason: (e as Error).message });
    }
  }

  return report;
}

type Outcome = 'granted' | 'pending' | 'closed' | 'none';

async function settleOne(
  order: { ref: string; paypalOrderId: string | null; captureStatus: string | null },
  dryRun: boolean,
): Promise<Outcome> {
  const db = paypalDb();

  // A capture PayPal is still clearing (e-cheque). Ask again.
  if (order.captureStatus === 'PENDING' && order.paypalOrderId) {
    const state = await getPayPalOrder(order.paypalOrderId);
    if (!state.ok) return 'pending';
    const view = captureViewOf(state.data);
    if (!view || view.captureStatus === 'PENDING') return 'pending';
    if (dryRun) return 'pending';
    const result = await grantForCapture(order.ref, view);
    return result.status === 'granted' || result.status === 'already_granted'
      ? 'granted'
      : 'none';
  }

  if (!order.paypalOrderId) {
    // Never reached PayPal, or the id was never stored. Nothing to settle.
    if (dryRun) return 'closed';
    await db.paypalOrder.updateMany({
      where: { ref: order.ref, grantedAt: null, status: { in: STALE_STATUSES } },
      data: { status: 'VOIDED', failureCode: 'ABANDONED_NO_PAYPAL_ORDER' },
    });
    return 'closed';
  }

  const state = await getPayPalOrder(order.paypalOrderId);
  if (!state.ok) {
    if (state.status === 404) {
      // PayPal has forgotten it (expired ~6h). Close.
      if (dryRun) return 'closed';
      await db.paypalOrder.updateMany({
        where: { ref: order.ref, grantedAt: null, status: { in: STALE_STATUSES } },
        data: { status: 'VOIDED', failureCode: 'EXPIRED_AT_PAYPAL' },
      });
      return 'closed';
    }
    return 'pending'; // transient — try again next run
  }

  const paypalStatus = state.data.status;

  if (paypalStatus === 'COMPLETED') {
    const view = captureViewOf(state.data);
    if (!view) return 'pending';
    if (dryRun) return 'pending';
    const result = await grantForCapture(order.ref, view);
    return result.status === 'granted' || result.status === 'already_granted'
      ? 'granted'
      : 'none';
  }

  if (paypalStatus === 'APPROVED') {
    // The buyer approved and is owed the plan. captureFlow captures and grants,
    // and is safe to call concurrently with a returning browser tab.
    if (dryRun) return 'pending';
    const result = await captureFlow({ paypalOrderId: order.paypalOrderId, ref: order.ref });
    if (result.http === 200) return 'granted';
    if (result.http === 202) return 'pending';
    return 'none';
  }

  // CREATED / SAVED / VOIDED / PAYER_ACTION_REQUIRED: never approved.
  if (dryRun) return 'closed';
  await db.paypalOrder.updateMany({
    where: { ref: order.ref, grantedAt: null, status: { in: STALE_STATUSES } },
    data: { status: 'VOIDED', failureCode: 'ABANDONED_UNPAID', failureDetail: paypalStatus },
  });
  return 'closed';
}
