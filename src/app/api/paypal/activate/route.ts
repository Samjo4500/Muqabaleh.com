import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPayPalAccessToken, getPayPalSubscription } from '@/lib/paypal';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { subscriptionId } = (await req.json()) as { subscriptionId: string };

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscriptionId is required' },
        { status: 400 },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const subData = await getPayPalSubscription(accessToken, subscriptionId);

    if (subData.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Subscription is not active', paypalStatus: subData.status },
        { status: 400 },
      );
    }

    // Upsert subscription record
    const billingInfo = subData.billing_info as
      | Record<string, unknown>
      | undefined;
    const subscriber = subData.subscriber as
      | Record<string, unknown>
      | undefined;

    await db.paypalSubscription.upsert({
      where: { paypalSubscriptionId: subscriptionId },
      create: {
        userId,
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: process.env.PAYPAL_PLAN_ID || 'unknown',
        status: 'ACTIVE',
        startTime: subData.start_time
          ? new Date(subData.start_time as string)
          : new Date(),
        nextBillingTime: billingInfo?.next_billing_time
          ? new Date(billingInfo.next_billing_time as string)
          : null,
        payerEmail: (subscriber?.email_address as string) || session.user.email,
      },
      update: {
        status: 'ACTIVE',
        nextBillingTime: billingInfo?.next_billing_time
          ? new Date(billingInfo.next_billing_time as string)
          : null,
      },
    });

    // Upgrade user to PREMIUM
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'PREMIUM',
        sessionsLeft: 999,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PayPal activation error:', err);
    return NextResponse.json(
      { error: 'Activation failed' },
      { status: 500 },
    );
  }
}
