import { db } from './db';
import { sendEmail, queueEmail, APP_URL } from './email';
import { welcomeEmail } from '@/emails/welcome';
import { paymentReceiptEmail } from '@/emails/payment-receipt';
import { bookingConfirmationEmail } from '@/emails/booking-confirmation';
import { sessionReminderEmail } from '@/emails/session-reminder';
import { sessionStartingSoonEmail } from '@/emails/session-starting-soon';
import { reviewRequestEmail } from '@/emails/review-request';
import { passwordResetEmail } from '@/emails/password-reset';
import { interviewerApplicationReceivedEmail } from '@/emails/interviewer-application-received';
import { interviewerApprovedEmail } from '@/emails/interviewer-approved';
import { interviewerNewBookingEmail } from '@/emails/interviewer-new-booking';
import { interviewerPayoutSentEmail } from '@/emails/interviewer-payout-sent';
import { adminNewApplicationEmail } from '@/emails/admin-new-application';
import { adminDailySummaryEmail } from '@/emails/admin-daily-summary';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'samjo4500@gmail.com';

type Locale = 'en' | 'ar';

// ─── USER EMAILS ───

/**
 * Trigger: Immediately after user registration
 */
export async function triggerWelcomeEmail(userId: string, locale: Locale = 'en') {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const { subject, html } = await welcomeEmail({
      userName: user.name || 'User',
      locale,
    });

    await sendEmail({ to: user.email, subject, html });
  } catch (err) {
    console.error('[EmailTrigger] Welcome email failed:', err);
  }
}

/**
 * Trigger: After successful PayPal payment capture (one-time purchase)
 */
export async function triggerPaymentReceiptEmail(
  userId: string,
  planName: string,
  amountCents: number,
  transactionId: string,
  locale: Locale = 'en',
) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const amount = `$${(amountCents / 100).toFixed(2)}`;
    const date = new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const { subject, html } = await paymentReceiptEmail({
      userName: user.name || 'User',
      locale,
      planName,
      amount,
      date,
      transactionId,
    });

    await sendEmail({ to: user.email, subject, html });
  } catch (err) {
    console.error('[EmailTrigger] Payment receipt failed:', err);
  }
}

/**
 * Trigger: After booking payment captured
 */
export async function triggerBookingConfirmationEmail(
  bookingId: string,
  locale: Locale = 'en',
) {
  try {
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: {
        interviewer: { select: { fullName: true, fullNameAr: true } },
      },
    });
    if (!booking) return;

    const interviewerName = locale === 'ar' && booking.interviewer.fullNameAr
      ? booking.interviewer.fullNameAr
      : booking.interviewer.fullName;

    const scheduledDate = new Date(booking.scheduledAt);
    const date = scheduledDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = scheduledDate.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Amman',
    });
    const duration = `${booking.durationMinutes} ${locale === 'ar' ? 'دقيقة' : 'minutes'}`;
    const amount = `$${(booking.priceTotal / 100).toFixed(2)}`;

    const { subject, html } = await bookingConfirmationEmail({
      userName: booking.candidateName,
      locale,
      interviewerName,
      date,
      time,
      duration,
      meetingLink: booking.meetingLink || `${APP_URL}/app/bookings`,
      amount,
    });

    await sendEmail({ to: booking.candidateEmail, subject, html });
  } catch (err) {
    console.error('[EmailTrigger] Booking confirmation failed:', err);
  }
}

/**
 * Trigger: Schedule 24h reminder (queued for later)
 */
export async function triggerSessionReminderEmail(
  bookingId: string,
  locale: Locale = 'en',
) {
  try {
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: {
        interviewer: { select: { fullName: true, fullNameAr: true } },
      },
    });
    if (!booking) return;

    const interviewerName = locale === 'ar' && booking.interviewer.fullNameAr
      ? booking.interviewer.fullNameAr
      : booking.interviewer.fullName;

    const scheduledDate = new Date(booking.scheduledAt);
    const date = scheduledDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = scheduledDate.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Amman',
    });

    const { subject, html } = await sessionReminderEmail({
      userName: booking.candidateName,
      locale,
      interviewerName,
      date,
      time,
      meetingLink: booking.meetingLink || '',
    });

    // Send 24h before
    const sendAt = new Date(booking.scheduledAt.getTime() - 24 * 60 * 60 * 1000);
    if (sendAt > new Date()) {
      await queueEmail({ to: booking.candidateEmail, subject, html, sendAt });
    }
  } catch (err) {
    console.error('[EmailTrigger] Session reminder queue failed:', err);
  }
}

/**
 * Trigger: Schedule 15min reminder (queued for later)
 */
export async function triggerSessionStartingSoonEmail(
  bookingId: string,
  locale: Locale = 'en',
) {
  try {
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: {
        interviewer: { select: { fullName: true, fullNameAr: true } },
      },
    });
    if (!booking) return;

    const interviewerName = locale === 'ar' && booking.interviewer.fullNameAr
      ? booking.interviewer.fullNameAr
      : booking.interviewer.fullName;

    const scheduledDate = new Date(booking.scheduledAt);
    const time = scheduledDate.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Amman',
    });

    const { subject, html } = await sessionStartingSoonEmail({
      userName: booking.candidateName,
      locale,
      interviewerName,
      time,
      meetingLink: booking.meetingLink || '',
    });

    // Send 15min before
    const sendAt = new Date(booking.scheduledAt.getTime() - 15 * 60 * 1000);
    if (sendAt > new Date()) {
      await queueEmail({ to: booking.candidateEmail, subject, html, sendAt });
    }
  } catch (err) {
    console.error('[EmailTrigger] Session starting soon queue failed:', err);
  }
}

/**
 * Trigger: Schedule review request 1h after session end
 */
export async function triggerReviewRequestEmail(
  bookingId: string,
  locale: Locale = 'en',
) {
  try {
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: {
        interviewer: { select: { fullName: true, fullNameAr: true } },
      },
    });
    if (!booking) return;

    const interviewerName = locale === 'ar' && booking.interviewer.fullNameAr
      ? booking.interviewer.fullNameAr
      : booking.interviewer.fullName;

    const { subject, html } = await reviewRequestEmail({
      userName: booking.candidateName,
      locale,
      interviewerName,
      bookingId: booking.id,
    });

    // Send 1 hour after session ends
    const sendAt = new Date(
      booking.scheduledAt.getTime() + booking.durationMinutes * 60 * 1000 + 60 * 60 * 1000,
    );
    if (sendAt > new Date()) {
      await queueEmail({ to: booking.candidateEmail, subject, html, sendAt });
    }
  } catch (err) {
    console.error('[EmailTrigger] Review request queue failed:', err);
  }
}

/**
 * Trigger: Password reset requested
 */
export async function triggerPasswordResetEmail(
  userEmail: string,
  userName: string,
  resetLink: string,
  locale: Locale = 'en',
) {
  try {
    const { subject, html } = await passwordResetEmail({
      userName,
      resetLink,
      locale,
    });

    await sendEmail({ to: userEmail, subject, html });
  } catch (err) {
    console.error('[EmailTrigger] Password reset email failed:', err);
  }
}

// ─── INTERVIEWER EMAILS ───

/**
 * Trigger: Immediately after interviewer application submitted
 */
export async function triggerInterviewerApplicationReceivedEmail(
  interviewerId: string,
  locale: Locale = 'en',
) {
  try {
    const interviewer = await db.interviewer.findUnique({ where: { id: interviewerId } });
    if (!interviewer) return;

    const { subject, html } = await interviewerApplicationReceivedEmail({
      interviewerName: interviewer.fullName,
      locale,
    });

    // The interviewer may not have a User account yet (userId is 'pending')
    // The email was provided in the application form - we'll send to the admin
    // and also try the interviewer email from application data
    // For now, we primarily notify the admin. The interviewer email notification
    // happens through the apply route where we have the raw email.
    await sendEmail({ to: ADMIN_EMAIL, subject: html ? '' : subject, html: html });
  } catch (err) {
    console.error('[EmailTrigger] Application received email failed:', err);
  }
}

/**
 * Trigger: Admin approves interviewer
 */
export async function triggerInterviewerApprovedEmail(
  interviewerId: string,
  locale: Locale = 'en',
) {
  try {
    const interviewer = await db.interviewer.findUnique({ where: { id: interviewerId } });
    if (!interviewer) return;

    const { subject, html } = await interviewerApprovedEmail({
      interviewerName: interviewer.fullName,
      locale,
    });

    // Send to the interviewer's linked user email, or use a stored email if available
    // Since Interviewer model doesn't have a direct email field, we look up by userId
    if (interviewer.userId && interviewer.userId !== 'pending') {
      const user = await db.user.findUnique({ where: { id: interviewer.userId } });
      if (user) {
        await sendEmail({ to: user.email, subject, html });
      }
    }
  } catch (err) {
    console.error('[EmailTrigger] Interviewer approved email failed:', err);
  }
}

/**
 * Trigger: After booking payment captured - notify interviewer
 */
export async function triggerInterviewerNewBookingEmail(
  bookingId: string,
  locale: Locale = 'en',
) {
  try {
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      include: {
        interviewer: { select: { id: true, fullName: true, fullNameAr: true, userId: true } },
      },
    });
    if (!booking) return;

    const interviewerName = locale === 'ar' && booking.interviewer.fullNameAr
      ? booking.interviewer.fullNameAr
      : booking.interviewer.fullName;

    const scheduledDate = new Date(booking.scheduledAt);
    const date = scheduledDate.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = scheduledDate.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Amman',
    });
    const duration = `${booking.durationMinutes} ${locale === 'ar' ? 'دقيقة' : 'minutes'}`;
    const amountEarned = `$${(booking.interviewerPayout / 100).toFixed(2)}`;

    const { subject, html } = await interviewerNewBookingEmail({
      interviewerName,
      locale,
      userName: booking.candidateName,
      date,
      time,
      duration,
      amountEarned,
      meetingLink: booking.meetingLink || '',
    });

    // Get interviewer user email
    if (booking.interviewer.userId && booking.interviewer.userId !== 'pending') {
      const user = await db.user.findUnique({ where: { id: booking.interviewer.userId } });
      if (user) {
        await sendEmail({ to: user.email, subject, html });
      }
    }
  } catch (err) {
    console.error('[EmailTrigger] Interviewer new booking email failed:', err);
  }
}

/**
 * Trigger: Admin marks payout as paid
 */
export async function triggerInterviewerPayoutSentEmail(
  payoutId: string,
  locale: Locale = 'en',
) {
  try {
    const payout = await db.interviewerPayout.findUnique({
      where: { id: payoutId },
      include: {
        interviewer: { select: { id: true, fullName: true, userId: true } },
      },
    });
    if (!payout) return;

    const amount = `$${(payout.amount / 100).toFixed(2)}`;
    const date = new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const periodStart = payout.periodStart ? new Date(payout.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A';
    const periodEnd = payout.periodEnd ? new Date(payout.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    const { subject, html } = await interviewerPayoutSentEmail({
      interviewerName: payout.interviewer.fullName,
      locale,
      amount,
      date,
      paypalTransactionId: (payout as Record<string, unknown>).paypalTransactionId as string | undefined,
      periodStart,
      periodEnd,
    });

    // Get interviewer user email
    if (payout.interviewer.userId && payout.interviewer.userId !== 'pending') {
      const user = await db.user.findUnique({ where: { id: payout.interviewer.userId } });
      if (user) {
        await sendEmail({ to: user.email, subject, html });
      }
    }
  } catch (err) {
    console.error('[EmailTrigger] Payout sent email failed:', err);
  }
}

// ─── ADMIN EMAILS ───

/**
 * Trigger: Immediately after interviewer application submitted
 */
export async function triggerAdminNewApplicationEmail(interviewerId: string) {
  try {
    const interviewer = await db.interviewer.findUnique({ where: { id: interviewerId } });
    if (!interviewer) return;

    const { subject, html } = await adminNewApplicationEmail({
      interviewerName: interviewer.fullName,
      email: 'N/A', // Email not stored on Interviewer model directly
      experience: `${interviewer.yearsExperience} years`,
      proposedPrice: `$${(interviewer.hourlyRate / 100).toFixed(2)}/hr`,
    });

    await sendEmail({ to: ADMIN_EMAIL, subject, html });
  } catch (err) {
    console.error('[EmailTrigger] Admin new application email failed:', err);
  }
}

/**
 * Trigger: Schedule all delayed emails for a booking after it's confirmed.
 * Call this once after capture-booking-order succeeds.
 */
export async function scheduleBookingEmails(bookingId: string) {
  // Fire immediately
  triggerBookingConfirmationEmail(bookingId, 'ar').catch(() => {});
  triggerBookingConfirmationEmail(bookingId, 'en').catch(() => {});
  triggerInterviewerNewBookingEmail(bookingId, 'ar').catch(() => {});
  triggerInterviewerNewBookingEmail(bookingId, 'en').catch(() => {});

  // Queue delayed emails (fire and forget, they'll be processed by cron)
  triggerSessionReminderEmail(bookingId, 'ar').catch(() => {});
  triggerSessionReminderEmail(bookingId, 'en').catch(() => {});
  triggerSessionStartingSoonEmail(bookingId, 'ar').catch(() => {});
  triggerSessionStartingSoonEmail(bookingId, 'en').catch(() => {});
  triggerReviewRequestEmail(bookingId, 'ar').catch(() => {});
  triggerReviewRequestEmail(bookingId, 'en').catch(() => {});
}