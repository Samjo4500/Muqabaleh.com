import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminDailySummaryEmail } from '@/emails/admin-daily-summary';
import {
  BookingStatus,
  InterviewerStatus,
  PaymentStatus,
  PayoutStatus,
} from '@/lib/enums';
import { sendEmail } from '@/lib/email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samjo4500@gmail.com';

function requireCronSecret(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'Service Unavailable — CRON_SECRET not configured' },
      { status: 503 },
    );
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

// POST /api/email/daily-summary — generate and send daily summary
// Called by Vercel Cron at 9:00 AM daily
export async function POST(req: NextRequest) {
  const authError = requireCronSecret(req);
  if (authError) return authError;

  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate yesterday's revenue from completed payments (amount in dollars)
    const payments = await db.payment.findMany({
      where: {
        status: PaymentStatus.COMPLETED,
        capturedAt: {
          gte: yesterday,
          lt: today,
        },
      },
      select: { amount: true },
    });

    const bookingPayments = await db.humanBooking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
      select: { priceTotal: true },
    });

    // Payments are dollars; bookings remain cents
    const totalRevenueCents =
      Math.round(payments.reduce((sum, p) => sum + p.amount, 0) * 100) +
      bookingPayments.reduce((sum, b) => sum + b.priceTotal, 0);

    const totalRevenue = `$${(totalRevenueCents / 100).toFixed(2)}`;

    // New signups yesterday
    const newSignups = await db.user.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // New bookings yesterday
    const newBookings = await db.humanBooking.count({
      where: {
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
    });

    // Pending applications
    const pendingApplications = await db.interviewer.count({
      where: { status: InterviewerStatus.PENDING },
    });

    // Pending payouts
    const pendingPayouts = await db.interviewerPayout.count({
      where: { status: PayoutStatus.PENDING },
    });

    const dateStr = yesterday.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { subject, html } = await adminDailySummaryEmail({
      date: dateStr,
      totalRevenue,
      newSignups,
      newBookings,
      pendingApplications,
      pendingPayouts,
    });

    await sendEmail({ to: ADMIN_EMAIL, subject, html });

    return NextResponse.json({ success: true, date: dateStr });
  } catch (err) {
    console.error('POST /api/email/daily-summary error:', err);
    return NextResponse.json(
      { error: 'Daily summary failed' },
      { status: 500 },
    );
  }
}
