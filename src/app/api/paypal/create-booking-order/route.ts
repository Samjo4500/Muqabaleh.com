import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  bookingId: z.string().uuid(),
});

// POST /api/paypal/create-booking-order — create PayPal order for a booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 401 },
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { ar: 'بيانات غير صالحة', en: 'Invalid input', details: parsed.error.issues } },
        { status: 400 },
      );
    }

    const { bookingId } = parsed.data;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Verify booking belongs to user and is PENDING
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: { ar: 'الحجز غير موجود', en: 'Booking not found' } },
        { status: 404 },
      );
    }

    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح', en: 'Unauthorized' } },
        { status: 403 },
      );
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json(
        { error: { ar: 'الحجز ليس في حالة انتظار', en: 'Booking is not in PENDING status' } },
        { status: 400 },
      );
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: { ar: 'PayPal غير مهيأ', en: 'PayPal not configured' } },
        { status: 503 },
      );
    }

    // Convert cents to dollars for PayPal
    const amountUsd = (booking.priceTotal / 100).toFixed(2);

    const accessToken = await getPayPalAccessToken();
    const order = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amountUsd,
            },
            description: `Muqabaleh — Interview Booking ${bookingId.slice(0, 8)}`,
          },
        ],
      }),
    });

    const data = await order.json();

    if (data.error) {
      console.error('PayPal create order error:', data.error);
      return NextResponse.json(
        { error: { ar: 'خطأ في PayPal', en: 'PayPal error', details: data.error } },
        { status: 400 },
      );
    }

    return NextResponse.json({ orderId: data.id });
  } catch (err) {
    console.error('POST /api/paypal/create-booking-order error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء إنشاء طلب الدفع', en: 'Error creating payment order' } },
      { status: 500 },
    );
  }
}

async function getPayPalAccessToken() {
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
