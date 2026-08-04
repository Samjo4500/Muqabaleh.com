import { db } from './db';

/** One-time checkout plan catalog (amounts must stay in sync with create-order). */
export const PLAN_CONFIG: Record<
  string,
  { amount: string; currency: string; description: string; tier: string; sessions: number }
> = {
  PRO: {
    amount: '9.99',
    currency: 'USD',
    description: 'Muqabaleh Pro — 3 AI Interviews + Full Reports',
    tier: 'PRO',
    sessions: 3,
  },
  UNLIMITED: {
    amount: '29.99',
    currency: 'USD',
    description: 'Muqabaleh Unlimited — Unlimited AI Interviews + All Features',
    tier: 'UNLIMITED',
    sessions: 999,
  },
  HUMAN_STD: {
    amount: '29.00',
    currency: 'USD',
    description: 'Human Interview — Standard',
    tier: 'STANDARD_HUMAN',
    sessions: 0,
  },
  HUMAN_PRO: {
    amount: '49.00',
    currency: 'USD',
    description: 'Human Interview — Pro',
    tier: 'PRO_HUMAN',
    sessions: 0,
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
    process.env.PAYPAL_PLAN_ID_HUMAN_STD,
    process.env.PAYPAL_PLAN_ID_HUMAN_PRO,
  ].filter((id): id is string => typeof id === 'string' && id.length > 0);
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

  // Only downgrade if user has no other ACTIVE subscriptions
  const activeCount = await db.paypalSubscription.count({
    where: { userId: sub.userId, status: 'ACTIVE' },
  });

  if (activeCount === 0) {
    await db.user.update({
      where: { id: sub.userId },
      data: { subscriptionTier: 'FREE', sessionsLeft: 1 },
    });
  }
}
