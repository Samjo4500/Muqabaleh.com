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
import { assertCronAuthorized } from '@/lib/cron-auth';
import { writeAdminNotification } from '@/lib/admin/notify';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();

// POST /api/email/daily-summary — generate and send daily summary
// Called by Vercel Cron at 9:00 AM daily
export async function POST(req: NextRequest) {
  const authError = assertCronAuthorized(req);
  if (authError) return authError;
  if (!ADMIN_EMAIL) {
    return NextResponse.json(
      { error: 'ADMIN_EMAIL not configured' },
      { status: 503 },
    );
  }

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

    const sent = await sendEmail({ to: ADMIN_EMAIL, subject, html });

    await writeAdminNotification({
      channel: 'EMAIL',
      recipient: ADMIN_EMAIL,
      subject,
      body: `Daily summary for ${dateStr}: revenue ${totalRevenue}, signups ${newSignups}, bookings ${newBookings}.`,
      status: sent.success ? 'SENT' : 'FAILED',
      href: '/admin/dashboard',
      kind: 'email',
      severity: sent.success ? 'info' : 'critical',
      meta: { date: dateStr, totalRevenue, newSignups, newBookings },
    });

    return NextResponse.json({ success: true, date: dateStr });
  } catch (err) {
    console.error('POST /api/email/daily-summary error:', err);
    return NextResponse.json(
      { error: 'Daily summary failed' },
      { status: 500 },
    );
  }
}

/** Vercel Cron uses GET — mirror POST. */
export async function GET(req: NextRequest) {
  return POST(req);
}
