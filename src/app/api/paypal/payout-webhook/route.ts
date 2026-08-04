import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { triggerInterviewerPayoutSentEmail } from '@/lib/email-triggers';

// POST /api/paypal/payout-webhook
// Handles PayPal Payouts webhooks
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const eventType: string = payload.event_type ?? '';

    // Handle payout item completed
    if (eventType === 'PAYMENT.PAYOUTS-ITEM.COMPLETED') {
      const batchId: string | undefined = payload.resource?.payout_batch_id;

      if (!batchId) return NextResponse.json({ received: true });

      const payouts = await db.interviewerPayout.findMany({
        where: { paypalBatchId: batchId, status: 'PROCESSING' },
      });

      for (const payout of payouts) {
        await db.interviewerPayout.update({
          where: { id: payout.id },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });

        // Fire and forget: send payout confirmation email
        triggerInterviewerPayoutSentEmail(payout.id, 'ar').catch(() => {});
        triggerInterviewerPayoutSentEmail(payout.id, 'en').catch(() => {});
      }

      console.log(`[Payout Webhook] Completed ${payouts.length} payouts for batch ${batchId}`);
    }

    // Handle payout item failed
    if (eventType === 'PAYMENT.PAYOUTS-ITEM.FAILED') {
      const batchId: string | undefined = payload.resource?.payout_batch_id;

      if (!batchId) return NextResponse.json({ received: true });

      await db.interviewerPayout.updateMany({
        where: { paypalBatchId: batchId, status: 'PROCESSING' },
        data: { status: 'PENDING', processedAt: null },
      });

      console.warn(`[Payout Webhook] Payout failed for batch ${batchId}, reverted to PENDING`);
    }
  } catch (error) {
    console.error('Error processing PayPal payout webhook:', error);
  }

  return NextResponse.json({ received: true });
}
