import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { adminDailySummaryEmail } from '@/emails/admin-daily-summary';
import { sendEmail } from '@/lib/email';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samjo4500@gmail.com';

// POST /api/email/daily-summary — generate and send daily summary
// Called by Vercel Cron at 9:00 AM daily
export async function POST() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate yesterday's revenue from captured payments
    const payments = await db.payment.findMany({
      where: {
        status: 'CAPTURED',
        capturedAt: {
          gte: yesterday,
          lt: today,
        },
      },
      select: { amountUsdCents: true },
    });

    const bookingPayments = await db.humanBooking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        createdAt: {
          gte: yesterday,
          lt: today,
        },
      },
      select: { priceTotal: true },
    });

    const totalRevenueCents =
      payments.reduce((sum, p) => sum + p.amountUsdCents, 0) +
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
      where: { status: 'PENDING' },
    });

    // Pending payouts
    const pendingPayouts = await db.interviewerPayout.count({
      where: { status: 'PENDING' },
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
