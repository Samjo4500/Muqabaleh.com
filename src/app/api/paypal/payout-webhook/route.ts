import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhookSignature } from '@/lib/paypal';
import { triggerInterviewerPayoutSentEmail } from '@/lib/email-triggers';

// POST /api/paypal/payout-webhook
// Handles PayPal Payouts webhooks
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const valid = await verifyWebhookSignature(body, req.headers);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(body) as {
      event_type?: string;
      resource?: { payout_batch_id?: string };
    };
    const eventType: string = payload.event_type ?? '';

    // Handle payout item completed
    if (eventType === 'PAYMENT.PAYOUTS-ITEM.COMPLETED') {
      const batchId: string | undefined = payload.resource?.payout_batch_id;

      if (!batchId) return NextResponse.json({ received: true });

      const payouts = await db.interviewerPayout.findMany({
        where: { batchId, status: 'PROCESSING' },
      });

      for (const payout of payouts) {
        // COMPLETED requires batchId (already present from PROCESSING)
        if (!payout.batchId) continue;

        await db.interviewerPayout.update({
          where: { id: payout.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        // Fire and forget: send payout confirmation email
        triggerInterviewerPayoutSentEmail(payout.id, 'ar').catch(() => {});
        triggerInterviewerPayoutSentEmail(payout.id, 'en').catch(() => {});
      }
    }

    // Handle payout item failed
    if (eventType === 'PAYMENT.PAYOUTS-ITEM.FAILED') {
      const batchId: string | undefined = payload.resource?.payout_batch_id;

      if (!batchId) return NextResponse.json({ received: true });

      await db.interviewerPayout.updateMany({
        where: { batchId, status: 'PROCESSING' },
        data: { status: 'FAILED', processedAt: null },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing PayPal payout webhook:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
