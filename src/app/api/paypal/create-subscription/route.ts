import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getAllowedPayPalPlanIds,
  getPayPalAccessToken,
  getPayPalApiBase,
  paypalPlanIdForCatalogPlan,
} from '@/lib/paypal';
import { isSellablePlan, liveModeAllowed } from '@/lib/paypal/order-rules';

/** Plans that are billed as PayPal Subscriptions (monthly), not one-time orders. */
const SUBSCRIPTION_PLANS = ['JEANNIE', 'JEANNIE_PRO'];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    if (!liveModeAllowed(process.env.PAYPAL_MODE, process.env.PAYPAL_ALLOW_LIVE_CHARGES)) {
      console.error('[paypal/create-subscription] live charges disabled');
      return NextResponse.json({ error: 'Payments are temporarily unavailable' }, { status: 503 });
    }

    const body = (await req.json().catch(() => ({}))) as { plan?: string };
    const catalogPlan = String(body.plan || 'JEANNIE').toUpperCase();

    // Only subscription plans from the server catalog may be started. The old
    // code fell back to PAYPAL_PLAN_ID / _UNLIMITED / _PRO when the requested
    // plan had no id, silently subscribing the customer to a different plan.
    if (!isSellablePlan(catalogPlan) || !SUBSCRIPTION_PLANS.includes(catalogPlan)) {
      return NextResponse.json(
        {
          error: 'Invalid plan',
          subscriptionPlans: SUBSCRIPTION_PLANS,
        },
        { status: 400 },
      );
    }

    const planId = paypalPlanIdForCatalogPlan(catalogPlan);
    if (!planId) {
      console.error(
        `[paypal/create-subscription] no PayPal billing plan id configured for ${catalogPlan}`,
      );
      return NextResponse.json(
        { error: 'This plan is not available right now' },
        { status: 503 },
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
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

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
