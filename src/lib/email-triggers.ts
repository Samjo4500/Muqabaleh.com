import { db } from './db';
import { sendEmail, queueEmail, APP_URL } from './email';
import { brandedEmailShell, sendBrevoEmail } from './brevo';
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

function localeFromUserLanguage(language?: string | null): Locale {
  return String(language || '').toUpperCase().startsWith('AR') ? 'ar' : 'en';
}

// ─── USER EMAILS ───

/**
 * Trigger: Immediately after user registration (Brevo).
 */
export async function triggerWelcomeEmail(userId: string, locale?: Locale) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const lang = locale || localeFromUserLanguage(user.language);
    const isAr = lang === 'ar';
    const name = user.name || (isAr ? 'مرحباً' : 'there');
    const subject = isAr
      ? 'مرحباً بك في مقابلة — مقابلتك الأولى مجانية'
      : 'Welcome to Muqabaleh — Your first interview is free';
    const html = brandedEmailShell({
      locale: lang,
      title: isAr ? `مرحباً بك، ${name}` : `Welcome, ${name}`,
      bodyHtml: isAr
        ? `<p>حسابك في Muqabaleh جاهز. مقابلتك الأولى مع جيني مجانية — ابدأ الآن وحسّن فرصك المهنية.</p>
           <p style="color:#64748b;font-size:14px;">يمكنك أيضاً مراجعة الباقات للترقية لاحقاً.</p>`
        : `<p>Your Muqabaleh account is ready. Your first interview with Jeannie is free — start now and sharpen your interview edge.</p>
           <p style="color:#64748b;font-size:14px;">You can also review pricing plans when you are ready to upgrade.</p>`,
      ctaHref: `${APP_URL}/${isAr ? '' : 'en/'}interview/prep`.replace('com//', 'com/'),
      ctaLabel: isAr ? 'ابدأ مقابلتك المجانية' : 'Start your free interview',
    });

    const brevo = await sendBrevoEmail({
      to: user.email,
      subject,
      html,
      sender: { name: 'Muqabaleh', email: 'noreply@muqabaleh.com' },
    });
    if (!brevo.success) {
      // Fallback to legacy Resend path if configured
      const legacy = await welcomeEmail({ userName: user.name || 'User', locale: lang });
      await sendEmail({ to: user.email, subject: legacy.subject, html: legacy.html });
    }
  } catch (err) {
    console.error('[EmailTrigger] Welcome email failed:', err);
  }
}

/**
 * Trigger: User upgrades to Pro/Premium (Brevo).
 */
export async function triggerSubscriptionConfirmationEmail(
  userId: string,
  planName: string,
  locale?: Locale,
) {
  try {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) return;
    const lang = locale || localeFromUserLanguage(user.language);
    const isAr = lang === 'ar';
    const subject = isAr
      ? 'أصبحت الآن مشترك Pro في مقابلة'
      : "You're now a Muqabaleh Pro — here's what's next";
    const html = brandedEmailShell({
      locale: lang,
      title: isAr
        ? `تم تفعيل ${planName}`
        : `You're on ${planName}`,
      bodyHtml: isAr
        ? `<p>شكراً لترقيتك. يمكنك الآن تحميل جواز المقابلة بالبريد، وإجراء مقابلات إضافية مع جيني.</p>
           <ul style="color:#334155;line-height:1.7;">
             <li>جواز PDF بالبريد</li>
             <li>مقابلات أكثر هذا الشهر</li>
             <li>دعم عبر support@muqabaleh.com</li>
           </ul>`
        : `<p>Thanks for upgrading. You can now receive passport PDFs by email and run more Jeannie interviews.</p>
           <ul style="color:#334155;line-height:1.7;">
             <li>Passport PDF by email</li>
             <li>More interviews this month</li>
             <li>Support at support@muqabaleh.com</li>
           </ul>`,
      ctaHref: `${APP_URL}/${isAr ? '' : 'en/'}interview/prep`.replace('com//', 'com/'),
      ctaLabel: isAr ? 'افتح لوحة التحكم' : 'Open dashboard',
    });
    await sendBrevoEmail({
      to: user.email,
      subject,
      html,
      sender: { name: 'Muqabaleh', email: 'noreply@muqabaleh.com' },
    });
  } catch (err) {
    console.error('[EmailTrigger] Subscription confirmation failed:', err);
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
    if (!booking || !booking.interviewer) return;

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
    if (!booking || !booking.interviewer) return;

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
    if (!booking || !booking.interviewer) return;

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
    if (!booking || !booking.interviewer) return;

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
    const isAr = locale === 'ar';
    const subject = isAr
      ? 'إعادة تعيين كلمة المرور'
      : 'Reset your Muqabaleh password';
    const html = brandedEmailShell({
      locale,
      title: isAr
        ? `${userName}، أعد تعيين كلمة المرور`
        : `${userName}, reset your password`,
      bodyHtml: isAr
        ? `<p>استلمنا طلباً لإعادة تعيين كلمة المرور. الرابط صالح لمدة ساعة واحدة.</p>`
        : `<p>We received a password reset request. This link expires in 1 hour.</p>`,
      ctaHref: resetLink,
      ctaLabel: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password',
    });
    const brevo = await sendBrevoEmail({
      to: userEmail,
      subject,
      html,
      sender: { name: 'Muqabaleh', email: 'noreply@muqabaleh.com' },
    });
    if (!brevo.success) {
      const legacy = await passwordResetEmail({ userName, resetLink, locale });
      await sendEmail({ to: userEmail, subject: legacy.subject, html: legacy.html });
    }
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

    // Notify admin; interviewer confirmation goes via linked User email when available
    await sendEmail({ to: ADMIN_EMAIL, subject: html ? '' : subject, html: html });
    if (interviewer.userId) {
      const user = await db.user.findUnique({ where: { id: interviewer.userId } });
      if (user) {
        await sendEmail({ to: user.email, subject, html });
      }
    }
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

    // Send to the interviewer's linked user email
    if (interviewer.userId) {
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
    if (!booking || !booking.interviewer) return;

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
    if (booking.interviewer.userId) {
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

    // InterviewerPayout.amount is USD dollars
    const amount = `$${payout.amount.toFixed(2)}`;
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
      paypalTransactionId: payout.batchId ?? undefined,
      periodStart,
      periodEnd,
    });

    // Get interviewer user email
    if (payout.interviewer.userId) {
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