import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllowedPayPalPlanIds,
  getPayPalAccessToken,
  getPayPalApiBase,
  paypalPlanIdForCatalogPlan,
} from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const body = (await req.json().catch(() => ({}))) as { plan?: string };
    const catalogPlan = String(body.plan || 'JEANNIE').toUpperCase();

    const planId =
      paypalPlanIdForCatalogPlan(catalogPlan) ||
      process.env.PAYPAL_PLAN_ID ||
      process.env.PAYPAL_PLAN_ID_UNLIMITED ||
      process.env.PAYPAL_PLAN_ID_PRO;

    if (!planId) {
      return NextResponse.json(
        { error: 'PayPal plan not configured' },
        { status: 500 },
      );
    }

    const allowed = getAllowedPayPalPlanIds();
    if (allowed.length > 0 && !allowed.includes(planId)) {
      return NextResponse.json(
        { error: 'PayPal plan not allowed' },
        { status: 400 },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const { resolveNextAuthUrl } = await import('@/lib/env/runtime');
    const baseUrl = resolveNextAuthUrl().url || 'http://localhost:3000';

    const subRes = await fetch(
      `${getPayPalApiBase()}/v1/billing/subscriptions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `${userId}-${catalogPlan}-${Date.now()}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          custom_id: userId,
          subscriber: {
            name: {
              given_name: session.user.name?.split(' ')[0] || 'Muqabaleh',
              surname:
                session.user.name?.split(' ').slice(1).join(' ') || 'User',
            },
            email_address: session.user.email,
          },
          application_context: {
            brand_name: 'Muqabaleh مقابلة',
            locale: 'ar-SA',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${baseUrl}/payment/success`,
            cancel_url: `${baseUrl}/payment/cancel`,
          },
        }),
      },
    );

    const subData = (await subRes.json()) as Record<string, unknown>;

    if (!subRes.ok) {
      console.error('PayPal create subscription error:', subData);
      return NextResponse.json(
        { error: 'Failed to create subscription', details: subData },
        { status: subRes.status },
      );
    }

    const links = subData.links as Array<{ rel: string; href: string }> | undefined;
    const approveLink = links?.find((l) => l.rel === 'approve')?.href;

    if (!approveLink) {
      return NextResponse.json(
        { error: 'No approval link returned from PayPal' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      subscriptionId: subData.id,
      approveLink,
      plan: catalogPlan,
    });
  } catch (err) {
    console.error('PayPal create subscription error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
