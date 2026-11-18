import { NextRequest, NextResponse } from 'next/server';
import { reconcilePayPalOrders } from '@/lib/paypal/reconcile';

/**
 * GET|POST /api/paypal/reconcile
 *
 * Settles checkout intents that never resolved: buyers who approved and closed
 * the tab before the redirect, e-cheques that have since cleared, and abandoned
 * carts that should stop counting as pending.
 *
 * Auth: `Authorization: Bearer $CRON_SECRET` (Vercel Cron sends this
 * automatically when CRON_SECRET is set) or `?secret=`.
 *
 * Vercel's Hobby plan allows one run per day, so the schedule in vercel.json is
 * daily (03:23 UTC) and sweeps anything older than 3 hours. A buyer who closes
 * the tab is normally covered by the webhook within seconds; this is the
 * backstop for the few that are not. On Pro, switch the cron to hourly.
 *
 * Configurable: ?olderThanMinutes=180&limit=100&dryRun=1
 */
export const dynamic = 'force-dynamic';

function authorised(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('[paypal/reconcile] CRON_SECRET is not configured — refusing to run');
    return false;
  }
  const header = req.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;
  return new URL(req.url).searchParams.get('secret') === secret;
}

async function run(req: NextRequest) {
  if (!authorised(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = new URL(req.url).searchParams;
  const olderThanMinutes = Number(params.get('olderThanMinutes') ?? 180);
  const limit = Math.min(Number(params.get('limit') ?? 100), 200);
  const dryRun = params.get('dryRun') === '1' || params.get('dryRun') === 'true';

  if (!Number.isFinite(olderThanMinutes) || !Number.isFinite(limit)) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  try {
    const report = await reconcilePayPalOrders({ olderThanMinutes, limit, dryRun });
    console.log('[paypal/reconcile]', JSON.stringify({ ...report, dryRun }));
    return NextResponse.json({ ok: true, dryRun, ...report });
  } catch (err) {
    console.error('[paypal/reconcile] crashed', err);
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 });
  }
}

export const GET = run;
export const POST = run;
