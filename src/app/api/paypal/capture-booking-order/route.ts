import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';
import { scheduleBookingEmails } from '@/lib/email-triggers';

const schema = z.object({
  bookingId: z.string().uuid(),
  orderId: z.string().min(1),
});

// POST /api/paypal/capture-booking-order — capture PayPal payment and confirm booking
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

    const { bookingId, orderId } = parsed.data;
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

    // Capture the PayPal order
    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: { ar: 'PayPal غير مهيأ', en: 'PayPal not configured' } },
        { status: 503 },
      );
    }

    const accessToken = await getPayPalAccessToken();
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = await captureRes.json();

    if (captureData.error || captureData.status !== 'COMPLETED') {
      console.error('PayPal capture error:', captureData);
      return NextResponse.json(
        { error: { ar: 'فشل في تأكيد الدفع', en: 'Payment capture failed', details: captureData.error || captureData } },
        { status: 400 },
      );
    }

    // Verify amount matches booking price
    const capturedAmount = captureData.purchase_units?.[0]?.amount?.value;
    const expectedAmount = (booking.priceTotal / 100).toFixed(2);

    if (capturedAmount && parseFloat(capturedAmount) !== parseFloat(expectedAmount)) {
      console.error(`Amount mismatch: captured ${capturedAmount}, expected ${expectedAmount}`);
      return NextResponse.json(
        { error: { ar: 'عدم تطابق المبلغ', en: 'Amount mismatch' } },
        { status: 400 },
      );
    }

    // Generate meeting link
    const meetingLink = `https://meet.jit.si/muqabaleh-${bookingId.slice(0, 8)}`;

    // Update booking: status → CONFIRMED, save paypalOrderId and meetingLink
    const updated = await db.humanBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        paypalOrderId: orderId,
        meetingLink,
      },
      include: {
        interviewer: {
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            hourlyRate: true,
          },
        },
      },
    });

    // Send booking confirmation + schedule delayed emails (fire and forget)
    scheduleBookingEmails(bookingId);

    // Create Daily.co room (fire and forget, non-blocking)
    if (process.env.DAILY_API_KEY) {
      fetch('/api/daily/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      }).catch((e) => console.warn('[Booking] Daily.co room creation skipped:', e.message));
    }

    return NextResponse.json({
      success: true,
      booking: updated,
    });
  } catch (err) {
    console.error('POST /api/paypal/capture-booking-order error:', err);
    return NextResponse.json(
      { error: { ar: 'حدث خطأ أثناء تأكيد الدفع', en: 'Error capturing payment' } },
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
