import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PaymentStatus, PaymentType } from '@prisma/client';
import {
  getAllowedPayPalPlanIds,
  getPayPalAccessToken,
  getPayPalSubscription,
  PLAN_CONFIG,
  planKeyForPayPalPlanId,
} from '@/lib/paypal';
import { grantPlan } from '@/lib/plans/entitlements';
import {
  triggerPaymentReceiptEmail,
  triggerSubscriptionConfirmationEmail,
} from '@/lib/email-triggers';

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

    // Ownership: custom_id must match the authenticated user
    const customId =
      typeof subData.custom_id === 'string' ? subData.custom_id : null;
    const subscriber = subData.subscriber as
      | Record<string, unknown>
      | undefined;
    const payerId =
      typeof subscriber?.payer_id === 'string'
        ? (subscriber.payer_id as string)
        : null;

    const existing = await db.paypalSubscription.findUnique({
      where: { paypalSubscriptionId: subscriptionId },
    });

    const ownsByCustomId = customId === userId;
    const ownsByDbRecord = existing?.userId === userId;
    // payer_id is a PayPal identifier — only accept when we already bound this sub to the user
    const ownsByPayer =
      !!payerId && existing?.userId === userId && !!existing;

    if (!ownsByCustomId && !ownsByDbRecord && !ownsByPayer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Plan must be one of the configured plan IDs
    const planId = typeof subData.plan_id === 'string' ? subData.plan_id : '';
    const allowedPlans = getAllowedPayPalPlanIds();
    if (!planId || !allowedPlans.includes(planId)) {
      return NextResponse.json(
        { error: 'Unknown or disallowed plan' },
        { status: 400 },
      );
    }

    const billingInfo = subData.billing_info as
      | Record<string, unknown>
      | undefined;

    await db.paypalSubscription.upsert({
      where: { paypalSubscriptionId: subscriptionId },
      create: {
        userId,
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: planId,
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
        paypalPlanId: planId,
        nextBillingTime: billingInfo?.next_billing_time
          ? new Date(billingInfo.next_billing_time as string)
          : null,
      },
    });

    const planKey = planKeyForPayPalPlanId(planId);
    if (!planKey) {
      return NextResponse.json(
        { error: 'Unrecognized PayPal plan id' },
        { status: 400 },
      );
    }

    const plan = PLAN_CONFIG[planKey];
    const amountDollars = Number.parseFloat(plan.amount);
    const amountCents = Math.round(amountDollars * 100);
    await grantPlan({
      userId,
      planKey,
      sessions: plan.sessions ?? 999,
    });

    // Record subscription payment once (idempotent on paypalOrderId)
    try {
      await db.payment.upsert({
        where: { paypalOrderId: subscriptionId },
        create: {
          userId,
          amount: amountDollars,
          currency: plan.currency || 'USD',
          type: PaymentType.SUBSCRIPTION,
          status: PaymentStatus.COMPLETED,
          paypalOrderId: subscriptionId,
          paypalSubscriptionId: subscriptionId,
          packageType: planKey,
          sessionsCredited: plan.sessions ?? 999,
          capturedAt: new Date(),
        },
        update: {
          status: PaymentStatus.COMPLETED,
          capturedAt: new Date(),
          packageType: planKey,
          sessionsCredited: plan.sessions ?? 999,
        },
      });
    } catch (err) {
      console.error('[paypal/activate] payment upsert failed', err);
    }

    const planName =
      planKey === 'JEANNIE'
        ? 'Jeannie'
        : planKey === 'JEANNIE_PRO'
          ? 'Jeannie Pro'
          : planKey === 'PRO'
            ? 'Pro'
            : planKey;
    triggerPaymentReceiptEmail(
      userId,
      planName,
      amountCents,
      subscriptionId,
    ).catch(() => {});
    triggerSubscriptionConfirmationEmail(userId, planName).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PayPal activation error:', err);
    return NextResponse.json(
      { error: 'Activation failed' },
      { status: 500 },
    );
  }
}
