import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getPayPalAccessToken } from '@/lib/paypal';

/**
 * POST /api/paypal/capture-order
 * Captures a PayPal order after user approves payment.
 * Credits 1 Pro session and upgrades user to PRO tier.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).id as string;
    const { orderId } = (await req.json()) as { orderId: string };

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const baseUrl =
      process.env.PAYPAL_MODE === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';

    // Capture the order
    const captureRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const captureData = (await captureRes.json()) as Record<string, unknown>;

    if (!captureRes.ok) {
      console.error('PayPal capture error:', captureData);
      return NextResponse.json(
        { error: 'Capture failed', details: captureData },
        { status: captureRes.status },
      );
    }

    // Verify the captured amount matches $9.99
    const purchaseUnits = captureData.purchase_units as
      | Array<{ amount: { currency_code: string; value: string } }>
      | undefined;
    const capturedAmount = purchaseUnits?.[0]?.amount?.value;
    if (capturedAmount !== '9.99') {
      console.error(`Amount mismatch! Expected 9.99, got ${capturedAmount}`);
      return NextResponse.json(
        { error: 'Amount mismatch — payment not processed for safety' },
        { status: 400 },
      );
    }

    // Record the payment in the database
    await db.payment.create({
      data: {
        userId,
        packageType: 'PRO',
        amountUsdCents: 999,
        paypalOrderId: orderId,
        status: 'CAPTURED',
        sessionsCredited: 1,
        idempotencyKey: `${userId}-${orderId}`,
        capturedAt: new Date(),
      },
    });

    // Upgrade user to PRO tier
    await db.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'PRO',
        sessionsLeft: { increment: 1 },
      },
    });

    return NextResponse.json({ success: true, tier: 'PRO' });
  } catch (err) {
    console.error('PayPal capture error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
