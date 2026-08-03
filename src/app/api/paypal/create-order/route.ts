import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPayPalAccessToken } from '@/lib/paypal';

/**
 * POST /api/paypal/create-order
 * Creates a PayPal order for a one-time payment (Pro plan $9.99).
 * Returns the order ID so the frontend can render the PayPal button.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Read the plan from the request body (default: pro)
    const body = (await req.json()) as { plan?: string };
    const plan = body.plan || 'pro';

    if (plan !== 'pro') {
      return NextResponse.json(
        { error: 'Only one-time payment for Pro plan is supported via this endpoint. Use /create-subscription for Unlimited.' },
        { status: 400 },
      );
    }

    // Price in USD — hardcoded to match the UI promise
    const priceUsd = '9.99';

    const accessToken = await getPayPalAccessToken();
    const baseUrl =
      process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: priceUsd,
            },
            description: `Muqabaleh Pro Plan — ${userId}`,
            custom_id: `${userId}:pro`,
          },
        ],
        application_context: {
          brand_name: 'Muqabaleh مقابلة',
          locale: 'ar_SA',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
        },
      }),
    });

    const orderData = (await orderRes.json()) as Record<string, unknown>;

    if (!orderRes.ok) {
      console.error('PayPal create order error:', orderData);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderData },
        { status: orderRes.status },
      );
    }

    return NextResponse.json({
      orderId: orderData.id,
    });
  } catch (err) {
    console.error('PayPal create order error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
