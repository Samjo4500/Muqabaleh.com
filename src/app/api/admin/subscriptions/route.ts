import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import {
  deactivateSubscription,
  getPayPalAccessToken,
  getPayPalApiBase,
} from '@/lib/paypal';
import { grantPlan, type PlanKey, entitlementsForTier } from '@/lib/plans/entitlements';

/**
 * POST { action: 'cancel'|'extend', subscriptionId, days? }
 * Cancel hits PayPal then local deactivate; extend bumps User.subscriptionExpiresAt.
 */
export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    action?: 'cancel' | 'extend';
    subscriptionId?: string;
    days?: number;
  };
  const subscriptionId = String(body.subscriptionId || '').trim();
  if (!subscriptionId || !body.action) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const sub = await db.paypalSubscription.findUnique({
    where: { id: subscriptionId },
  });
  if (!sub) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (body.action === 'cancel') {
    try {
      const accessToken = await getPayPalAccessToken();
      const cancelRes = await fetch(
        `${getPayPalApiBase()}/v1/billing/subscriptions/${sub.paypalSubscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: 'Cancelled by Super Admin' }),
        },
      );
      if (!cancelRes.ok && cancelRes.status !== 204) {
        const text = await cancelRes.text();
        console.error('[admin/subscriptions] PayPal cancel', text);
        // Still deactivate locally if PayPal already cancelled / sandbox quirks
        if (cancelRes.status !== 404 && cancelRes.status !== 422) {
          return NextResponse.json(
            { error: 'PayPal cancel failed', detail: text.slice(0, 200) },
            { status: 502 },
          );
        }
      }
    } catch (err) {
      console.error('[admin/subscriptions] PayPal cancel error', err);
      return NextResponse.json({ error: 'PayPal unavailable' }, { status: 502 });
    }

    await deactivateSubscription(sub.paypalSubscriptionId);

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'UPDATE',
        entity: 'paypal_subscription',
        entityId: sub.id,
        details: { action: 'cancel' },
      });
    }

    return NextResponse.json({ ok: true, status: 'CANCELLED' });
  }

  // extend — complimentary local access (does not revise PayPal billing cycle)
  const days = Math.min(Math.max(Number(body.days) || 30, 1), 365);
  const user = await db.user.findUnique({
    where: { id: sub.userId },
    select: { id: true, tier: true, subscriptionExpiresAt: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User missing' }, { status: 404 });
  }

  const base =
    user.subscriptionExpiresAt && user.subscriptionExpiresAt.getTime() > Date.now()
      ? new Date(user.subscriptionExpiresAt)
      : new Date();
  base.setDate(base.getDate() + days);

  const planKey = (entitlementsForTier(user.tier).key || 'JEANNIE') as PlanKey;
  const grantKey: PlanKey =
    planKey === 'FREE' ? 'JEANNIE' : planKey === 'PRO' ? 'JEANNIE' : planKey;

  await grantPlan({ userId: user.id, planKey: grantKey, expiresAt: base });

  await db.paypalSubscription.update({
    where: { id: sub.id },
    data: {
      status: 'ACTIVE',
      nextBillingTime: base,
    },
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'paypal_subscription',
      entityId: sub.id,
      details: { action: 'extend', days, expiresAt: base.toISOString() },
    });
  }

  return NextResponse.json({ ok: true, expiresAt: base.toISOString() });
}
