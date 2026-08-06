import { db } from './db';
import { UserTier } from './enums';
import { grantPlan, revokeToFree, type PlanKey } from '@/lib/plans/entitlements';

/** Checkout plan catalog (amounts must stay in sync with create-order). */
export const PLAN_CONFIG: Record<
  string,
  {
    amount: string;
    currency: string;
    description: string;
    tier: string;
    sessions: number;
    applies: number;
    planKey: PlanKey;
  }
> = {
  JEANNIE: {
    amount: '19.00',
    currency: 'USD',
    description: 'Muqabaleh Jeannie — 10 approve-gated applies / month',
    tier: UserTier.JEANNIE,
    sessions: 999,
    applies: 10,
    planKey: 'JEANNIE',
  },
  JEANNIE_PRO: {
    amount: '39.00',
    currency: 'USD',
    description: 'Muqabaleh Jeannie Pro — 20 applies + CV studio + cover letter AI',
    tier: UserTier.JEANNIE_PRO,
    sessions: 999,
    applies: 20,
    planKey: 'JEANNIE_PRO',
  },
  // Legacy packs kept for existing checkouts / receipts
  PRO: {
    amount: '9.99',
    currency: 'USD',
    description: 'Muqabaleh Pro — 3 AI Interviews + Full Reports',
    tier: UserTier.PRO,
    sessions: 3,
    applies: 0,
    planKey: 'PRO',
  },
  UNLIMITED: {
    amount: '29.99',
    currency: 'USD',
    description: 'Muqabaleh Unlimited — Unlimited AI Interviews + All Features',
    tier: UserTier.UNLIMITED,
    sessions: 999,
    applies: 20,
    planKey: 'UNLIMITED',
  },
  HUMAN_STD: {
    amount: '29.00',
    currency: 'USD',
    description: 'Human Interview — Standard',
    tier: 'STANDARD_HUMAN',
    sessions: 0,
    applies: 0,
    planKey: 'FREE',
  },
  HUMAN_PRO: {
    amount: '49.00',
    currency: 'USD',
    description: 'Human Interview — Pro',
    tier: 'PRO_HUMAN',
    sessions: 0,
    applies: 0,
    planKey: 'FREE',
  },
};

/**
 * PayPal REST API base URL. Respects PAYPAL_MODE (sandbox | live).
 */
export function getPayPalApiBase(): string {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

function getPayPalCredentials(): { clientId: string; secret: string } {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error(
      'PAYPAL_CLIENT_ID and PAYPAL_SECRET (or PAYPAL_CLIENT_SECRET) must be set',
    );
  }

  return { clientId, secret };
}

/**
 * Get a PayPal access token using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const { clientId, secret } = getPayPalCredentials();
  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal token error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Fetch subscription details from PayPal.
 */
export async function getPayPalSubscription(
  accessToken: string,
  subscriptionId: string,
) {
  const res = await fetch(
    `${getPayPalApiBase()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal subscription fetch error ${res.status}: ${text}`);
  }

  return res.json() as Promise<Record<string, unknown>>;
}

/** Allowed PayPal billing plan IDs from environment. */
export function getAllowedPayPalPlanIds(): string[] {
  return [
    process.env.PAYPAL_PLAN_ID,
    process.env.PAYPAL_PLAN_ID_PRO,
    process.env.PAYPAL_PLAN_ID_UNLIMITED,
    process.env.PAYPAL_PLAN_ID_JEANNIE,
    process.env.PAYPAL_PLAN_ID_JEANNIE_PRO,
    process.env.PAYPAL_PLAN_ID_HUMAN_STD,
    process.env.PAYPAL_PLAN_ID_HUMAN_PRO,
  ].filter((id): id is string => typeof id === 'string' && id.length > 0);
}

export function planKeyForPayPalPlanId(planId: string): PlanKey {
  if (planId && planId === process.env.PAYPAL_PLAN_ID_JEANNIE) return 'JEANNIE';
  if (planId && planId === process.env.PAYPAL_PLAN_ID_JEANNIE_PRO) return 'JEANNIE_PRO';
  if (planId && planId === process.env.PAYPAL_PLAN_ID_UNLIMITED) return 'UNLIMITED';
  if (planId && planId === process.env.PAYPAL_PLAN_ID_PRO) return 'PRO';
  // Default legacy unlimited subscription → Jeannie Pro entitlements
  return 'JEANNIE_PRO';
}

/** Map checkout catalog plan codes to PayPal billing plan IDs. */
export function paypalPlanIdForCatalogPlan(plan: string): string | null {
  const key = plan.toUpperCase();
  const map: Record<string, string | undefined> = {
    JEANNIE: process.env.PAYPAL_PLAN_ID_JEANNIE,
    JEANNIE_PRO: process.env.PAYPAL_PLAN_ID_JEANNIE_PRO,
    UNLIMITED: process.env.PAYPAL_PLAN_ID_UNLIMITED || process.env.PAYPAL_PLAN_ID,
    PRO: process.env.PAYPAL_PLAN_ID_PRO,
  };
  const id = map[key];
  return id && id.length > 0 ? id : null;
}

/** True when Jeannie monthly billing should use PayPal Subscriptions. */
export function hasJeannieSubscriptionPlans(): boolean {
  return Boolean(
    process.env.PAYPAL_PLAN_ID_JEANNIE || process.env.PAYPAL_PLAN_ID_JEANNIE_PRO,
  );
}

/** Resolve PLAN_CONFIG entry by captured USD amount string. */
export function findPlanByAmount(amountValue: string) {
  const normalized = Number.parseFloat(amountValue).toFixed(2);
  return (
    Object.entries(PLAN_CONFIG).find(
      ([, config]) => Number.parseFloat(config.amount).toFixed(2) === normalized,
    ) ?? null
  );
}

/**
 * Refund a PayPal capture (best-effort compensating transaction).
 */
export async function refundPayPalCapture(
  accessToken: string,
  captureId: string,
  reason = 'Amount or ownership validation failed',
): Promise<boolean> {
  const res = await fetch(
    `${getPayPalApiBase()}/v2/payments/captures/${captureId}/refund`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        note_to_payer: reason,
      }),
    },
  );
  return res.ok;
}

/**
 * Verify a PayPal webhook signature via PayPal Verify Webhook Signature API.
 * Returns true only when verification_status === "SUCCESS".
 */
export async function verifyWebhookSignature(
  body: string,
  headers: Headers,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error('[PayPal] PAYPAL_WEBHOOK_ID is not configured');
    return false;
  }

  const transmissionId = headers.get('paypal-transmission-id');
  const transmissionTime = headers.get('paypal-transmission-time');
  const certUrl = headers.get('paypal-cert-url');
  const authAlgo = headers.get('paypal-auth-algo');
  const transmissionSig = headers.get('paypal-transmission-sig');

  if (
    !transmissionId ||
    !transmissionTime ||
    !certUrl ||
    !authAlgo ||
    !transmissionSig
  ) {
    console.error('[PayPal] Missing webhook signature headers');
    return false;
  }

  let webhookEvent: unknown;
  try {
    webhookEvent = JSON.parse(body);
  } catch {
    console.error('[PayPal] Invalid webhook JSON body');
    return false;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const res = await fetch(
      `${getPayPalApiBase()}/v1/notifications/verify-webhook-signature`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      console.error('[PayPal] Webhook verify API error:', res.status, text);
      return false;
    }

    const data = (await res.json()) as { verification_status?: string };
    return data.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('[PayPal] Webhook signature verification failed:', err);
    return false;
  }
}

/**
 * Downgrade a user to FREE tier when subscription ends.
 */
export async function deactivateSubscription(paypalSubscriptionId: string) {
  const sub = await db.paypalSubscription.findUnique({
    where: { paypalSubscriptionId },
  });

  if (!sub) return;

  const newStatus = 'CANCELLED';
  await db.paypalSubscription.update({
    where: { id: sub.id },
    data: { status: newStatus },
  });

  const activeCount = await db.paypalSubscription.count({
    where: { userId: sub.userId, status: 'ACTIVE' },
  });

  if (activeCount === 0) {
    await revokeToFree(sub.userId);
  }
}

/** Credit entitlements for a catalog plan key after payment. */
export async function creditPlanPurchase(userId: string, planCode: string) {
  const config = PLAN_CONFIG[planCode.toUpperCase()];
  if (!config) return null;
  if (config.sessions <= 0 && config.applies <= 0) return null;
  return grantPlan({
    userId,
    planKey: config.planKey,
    sessions: config.sessions,
  });
}
