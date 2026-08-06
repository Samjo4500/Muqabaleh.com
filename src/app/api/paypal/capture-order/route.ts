import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { PaymentStatus, PaymentType } from '@/lib/enums';
import {
  findPlanByAmount,
  getPayPalAccessToken,
  getPayPalApiBase,
  refundPayPalCapture,
  creditPlanPurchase,
} from '@/lib/paypal';

type CaptureUnit = {
  custom_id?: string;
  payments?: {
    captures?: Array<{
      id?: string;
      amount?: { currency_code?: string; value?: string };
      status?: string;
    }>;
  };
};

/**
 * POST /api/paypal/capture-order
 * Captures a PayPal order after user approves payment.
 * Credits sessions / upgrades tier based on PLAN_CONFIG amount mapping.
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

    // Capture the order
    const captureRes = await fetch(
      `${getPayPalApiBase()}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const captureData = (await captureRes.json()) as {
      status?: string;
      purchase_units?: CaptureUnit[];
      details?: unknown;
    };

    if (!captureRes.ok) {
      console.error('PayPal capture error:', captureData);
      return NextResponse.json(
        { error: 'Capture failed' },
        { status: captureRes.status },
      );
    }

    const purchaseUnit = captureData.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];
    const captureId = capture?.id;
    const capturedAmount = capture?.amount?.value;
    const orderCustomId = purchaseUnit?.custom_id;

    // Ownership: custom_id must match session user
    if (!orderCustomId || orderCustomId !== userId) {
      console.error(
        `Order ownership mismatch: custom_id=${orderCustomId}, userId=${userId}`,
      );
      if (captureId) {
        await refundPayPalCapture(
          accessToken,
          captureId,
          'Order ownership mismatch',
        );
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!capturedAmount) {
      console.error('Missing captured amount on PayPal capture response');
      if (captureId) {
        await refundPayPalCapture(
          accessToken,
          captureId,
          'Missing captured amount',
        );
      }
      return NextResponse.json(
        { error: 'Amount missing — payment not processed for safety' },
        { status: 400 },
      );
    }

    const matched = findPlanByAmount(capturedAmount);
    if (!matched) {
      console.error(`Amount mismatch! No plan for captured amount ${capturedAmount}`);
      if (captureId) {
        await refundPayPalCapture(
          accessToken,
          captureId,
          'Amount does not match any plan',
        );
      }
      return NextResponse.json(
        { error: 'Amount mismatch — payment not processed for safety' },
        { status: 400 },
      );
    }

    const [planCode, config] = matched;

    try {
      // Record the payment in the database
      await db.payment.create({
        data: {
          userId,
          type: PaymentType.AI_PACKAGE,
          amount: Number.parseFloat(config.amount),
          currency: 'USD',
          packageType: planCode,
          paypalOrderId: orderId,
          status: PaymentStatus.COMPLETED,
          sessionsCredited: config.sessions,
          idempotencyKey: `${userId}-${orderId}`,
          capturedAt: new Date(),
        },
      });

      // Upgrade entitlements (sessions + Jeannie apply quota + Pro tools)
      if (config.sessions > 0 || config.applies > 0) {
        await creditPlanPurchase(userId, planCode);
      }
    } catch (dbErr) {
      console.error('Post-capture DB error — initiating refund:', dbErr);
      if (captureId) {
        await refundPayPalCapture(
          accessToken,
          captureId,
          'Failed to credit purchase',
        );
      }
      return NextResponse.json(
        { error: 'Failed to credit purchase — refund initiated' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, tier: config.tier });
  } catch (err) {
    console.error('PayPal capture error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
