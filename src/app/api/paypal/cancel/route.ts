import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPayPalAccessToken, deactivateSubscription } from '@/lib/paypal';
import { db } from '@/lib/db';

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

/**
 * POST /api/paypal/cancel — cancel user's PayPal subscription server-side
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Find active subscription
    const sub = await db.paypalSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
    });

    if (!sub) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 },
      );
    }

    // Cancel via PayPal API
    const accessToken = await getPayPalAccessToken();
    const cancelRes = await fetch(
      `${PAYPAL_BASE_URL}/v1/billing/subscriptions/${sub.paypalSubscriptionId}/cancel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'User requested cancellation' }),
      },
    );

    if (!cancelRes.ok && cancelRes.status !== 204) {
      const text = await cancelRes.text();
      console.error('PayPal cancel error:', text);
      return NextResponse.json(
        { error: 'Failed to cancel subscription with PayPal' },
        { status: 500 },
      );
    }

    // Update local DB
    await deactivateSubscription(sub.paypalSubscriptionId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PayPal cancel error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
