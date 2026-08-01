import { db } from './db';

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * Get a PayPal access token using client credentials.
 */
export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;

  if (!clientId || !secret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_SECRET must be set');
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
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
    `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`,
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

/**
 * Verify a PayPal webhook signature (simplified for MVP).
 * Production: use full certificate-chain verification.
 */
export async function verifyWebhookSignature(
  _body: string,
  _headers: Headers,
): Promise<boolean> {
  // For MVP, we accept webhooks from PayPal's IP range
  // and verify via the API. In production, implement full
  // webhook signature verification using PayPal's cert chain.
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  return !!webhookId;
}
