import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../admin/_lib';
import { z } from 'zod';

const schema = z.object({ payoutId: z.string().uuid() });

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  const baseUrl =
    process.env.PAYPAL_MODE === 'live'
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

// POST /api/paypal/send-payout
// Admin-only: triggers PayPal Payouts API for a given payout
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.authorized) return auth.response;

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { payoutId } = parsed.data;

    // Fetch payout with interviewer
    const payout = await db.interviewerPayout.findUnique({
      where: { id: payoutId },
      include: { interviewer: { select: { fullName: true, payoutEmail: true } } },
    });

    if (!payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    if (payout.status !== 'PENDING') {
      return NextResponse.json(
        { error: `Payout is already ${payout.status}` },
        { status: 400 },
      );
    }

    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_SECRET) {
      return NextResponse.json({ error: 'PayPal not configured' }, { status: 503 });
    }

    const amountUsd = (payout.amount / 100).toFixed(2);
    const senderBatchId = `payout_${payout.id}`;

    try {
      const accessToken = await getPayPalAccessToken();
      const baseUrl =
        process.env.PAYPAL_MODE === 'live'
          ? 'https://api-m.paypal.com'
          : 'https://api-m.sandbox.paypal.com';

      const paypalRes = await fetch(`${baseUrl}/v1/payments/payouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          sender_batch_header: {
            sender_batch_id: senderBatchId,
            email_subject: 'Your Muqabaleh Payout',
          },
          items: [
            {
              recipient_type: 'EMAIL',
              amount: { value: amountUsd, currency: 'USD' },
              receiver: payout.paypalEmail,
              note: 'Payout for interview sessions on Muqabaleh',
            },
          ],
        }),
      });

      const paypalData = await paypalRes.json();

      if (!paypalRes.ok) {
        console.error('PayPal Payouts API error:', paypalRes.status, JSON.stringify(paypalData));
        const message =
          paypalData?.message || paypalData?.error_description || 'Unknown PayPal error';
        return NextResponse.json({ error: message }, { status: 502 });
      }

      const batchId = paypalData?.batch_header?.payout_batch_id;

      // Update payout to PROCESSING
      await db.interviewerPayout.update({
        where: { id: payoutId },
        data: {
          status: 'PROCESSING',
          paypalBatchId: batchId || null,
          processedAt: new Date(),
        },
      });

      // Log admin action
      await db.adminLog.create({
        data: {
          action: 'PAYOUT_PROCESSED_PAYPAL',
          adminEmail: auth.adminEmail!,
          targetType: 'INTERVIEWER_PAYOUT',
          targetId: payoutId,
          metadata: JSON.stringify({ amount: payout.amount, batchId }),
        },
      });

      return NextResponse.json({
        success: true,
        batchId,
        payoutBatchStatus: paypalData?.batch_header?.batch_status,
      });
    } catch (paypalErr) {
      console.error('PayPal payout error:', paypalErr);
      return NextResponse.json(
        { error: 'Failed to process PayPal payout' },
        { status: 502 },
      );
    }
  } catch (err) {
    console.error('POST /api/paypal/send-payout error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
