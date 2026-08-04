import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/paypal';

const SUBSCRIPTION_EVENTS = new Set([
  'BILLING.SUBSCRIPTION.CANCELLED',
  'BILLING.SUBSCRIPTION.SUSPENDED',
  'BILLING.SUBSCRIPTION.EXPIRED',
  'BILLING.SUBSCRIPTION.ACTIVATED',
  'PAYMENT.SALE.COMPLETED',
]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const valid = await verifyWebhookSignature(body, req.headers);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const event = JSON.parse(body) as {
      event_type: string;
      resource?: {
        id?: string;
        status?: string;
        billing_info?: { next_billing_time: string };
        billing_agreement_id?: string;
      };
    };

    // Only handle events we care about
    if (!SUBSCRIPTION_EVENTS.has(event.event_type)) {
      return NextResponse.json({ received: true });
    }

    // For sale events, subscription id lives on billing_agreement_id
    const subscriptionId =
      event.event_type === 'PAYMENT.SALE.COMPLETED'
        ? event.resource?.billing_agreement_id || event.resource?.id
        : event.resource?.id;

    if (!subscriptionId) {
      return NextResponse.json({ received: true, note: 'no subscription ID' });
    }

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const newStatus = event.event_type.split('.')[2]; // CANCELLED | SUSPENDED | EXPIRED
        await db.paypalSubscription.updateMany({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: newStatus },
        });

        // Downgrade user if no active subscriptions remain
        const sub = await db.paypalSubscription.findUnique({
          where: { paypalSubscriptionId: subscriptionId },
        });
        if (sub) {
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
        break;
      }

      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        await db.paypalSubscription.updateMany({
          where: { paypalSubscriptionId: subscriptionId },
          data: { status: 'ACTIVE' },
        });
        break;
      }

      case 'PAYMENT.SALE.COMPLETED': {
        // Renewal payment succeeded — extend session balance
        const sub = await db.paypalSubscription.findUnique({
          where: { paypalSubscriptionId: subscriptionId },
        });
        if (sub && sub.status === 'ACTIVE') {
          await db.user.update({
            where: { id: sub.userId },
            data: { sessionsLeft: 999 },
          });
          if (event.resource?.billing_info?.next_billing_time) {
            await db.paypalSubscription.update({
              where: { paypalSubscriptionId: subscriptionId },
              data: {
                nextBillingTime: new Date(
                  event.resource.billing_info.next_billing_time,
                ),
              },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('PayPal webhook error:', err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
