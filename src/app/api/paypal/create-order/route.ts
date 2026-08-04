import { NextRequest, NextResponse } from 'next/server';

const PLAN_CONFIG: Record<string, { amount: string; currency: string; description: string; tier: string; sessions: number }> = {
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

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const plan = searchParams.get('plan') || 'PRO';
  const config = PLAN_CONFIG[plan];

  if (!config) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'PayPal not configured' }, { status: 503 });
  }

  // Create PayPal order
  try {
    const accessToken = await getPayPalAccessToken();
    const baseUrl = process.env.PAYPAL_MODE === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
    const order = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: { currency_code: config.currency, value: config.amount },
          description: config.description,
        }],
      }),
    });
    const data = await order.json();
    if (data.error) {
      const msg = typeof data.error === 'string' ? data.error : (data.error.message || data.name || 'PayPal error');
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({
      orderId: data.id,
      tier: config.tier,
      sessions: config.sessions,
    });
  } catch (err) {
    return NextResponse.json({ error: 'PayPal error' }, { status: 500 });
  }
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  const baseUrl = process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}
