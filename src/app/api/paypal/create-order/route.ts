import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getPayPalAccessToken,
  getPayPalApiBase,
  PLAN_CONFIG,
} from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let plan = 'PRO';
    try {
      const body = (await req.json()) as { plan?: string };
      if (body?.plan) {
        plan = String(body.plan).toUpperCase();
      }
    } catch {
      // body optional — fall back to query
    }

    const { searchParams } = new URL(req.url);
    const queryPlan = searchParams.get('plan');
    if (queryPlan) {
      plan = queryPlan.toUpperCase();
    }

    const config = PLAN_CONFIG[plan];
    if (!config) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 503 });
    }

    const accessToken = await getPayPalAccessToken();
    const order = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: { currency_code: config.currency, value: config.amount },
            description: config.description,
            custom_id: userId,
          },
        ],
      }),
    });

    const data = (await order.json()) as {
      id?: string;
      error?: string | { message?: string };
      name?: string;
    };

    if (!order.ok || data.error || !data.id) {
      const msg =
        typeof data.error === 'string'
          ? data.error
          : data.error?.message || data.name || 'PayPal error';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({
      orderId: data.id,
      tier: config.tier,
      sessions: config.sessions,
    });
  } catch {
    return NextResponse.json({ error: 'PayPal error' }, { status: 500 });
  }
}
