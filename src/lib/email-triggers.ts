import { db } from './db';
import { sendEmail, queueEmail, APP_URL } from './email';
import { brandedEmailShell, sendBrevoEmail } from './brevo';
import { MUQABALEH_BRAND, localePath } from '@/lib/brand/comms';
import { paymentReceiptEmail } from '@/emails/payment-receipt';
import { bookingConfirmationEmail } from '@/emails/booking-confirmation';
import { sessionReminderEmail } from '@/emails/session-reminder';
import { sessionStartingSoonEmail } from '@/emails/session-starting-soon';
import { reviewRequestEmail } from '@/emails/review-request';
import { interviewerApplicationReceivedEmail } from '@/emails/interviewer-application-received';
import { interviewerApprovedEmail } from '@/emails/interviewer-approved';
import { interviewerNewBookingEmail } from '@/emails/interviewer-new-booking';
import { interviewerPayoutSentEmail } from '@/emails/interviewer-payout-sent';
import { adminNewApplicationEmail } from '@/emails/admin-new-application';
import { adminDailySummaryEmail } from '@/emails/admin-daily-summary';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || '';
const SYSTEM_SENDER = MUQABALEH_BRAND.senders.system;

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
      ? 'مرحباً بك في مقابلة — ابدأ مقابلتك المجانية'
      : 'Welcome to Muqabaleh. Start your free interview';
    const html = brandedEmailShell({
      locale: lang,
      eyebrow: isAr ? 'حسابك جاهز' : 'Your account is ready',
      title: isAr ? `مرحباً بك، ${name}` : `Welcome, ${name}`,
      bodyHtml: isAr
        ? `<p style="margin:0 0 12px;">مرحباً بك في <strong>مقابلة</strong>. ابدأ مقابلتك المجانية: الرابط أدناه.</p>
           <p style="margin:0;color:#64748b;font-size:14px;">جلسة صوتية مع جيني — تقييم فوري وجواز مقابلة بعد الترقية.</p>`
        : `<p style="margin:0 0 12px;">Welcome to <strong>Muqabaleh</strong>. Start your free interview with the link below.</p>
           <p style="margin:0;color:#64748b;font-size:14px;">A voice session with Jeannie — instant scoring, and a passport after you upgrade.</p>`,
      ctaHref: localePath('/interview/prep', lang),
      ctaLabel: isAr ? 'ابدأ مقابلتك المجانية' : 'Start your free interview',
    });

    const brevo = await sendBrevoEmail({
      to: user.email,
      subject,
      html,
      sender: SYSTEM_SENDER,
    });
    if (!brevo.success) {
      console.error('[EmailTrigger] Welcome email Brevo failed:', brevo.error);
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
      ? 'تم تأكيد اشتراكك في مقابلة Pro'
      : 'Your Muqabaleh Pro Subscription is Confirmed';
    const html = brandedEmailShell({
      locale: lang,
      eyebrow: isAr ? 'تأكيد الاشتراك' : 'Subscription confirmed',
      title: isAr ? 'مرحباً بك في خطتك الجديدة' : 'Welcome to your new plan',
      bodyHtml: isAr
        ? `<p style="margin:0 0 12px;">تم تأكيد اشتراكك. إليك ما يشمله:</p>
           <ul style="margin:0;padding-right:18px;color:#334155;line-height:1.75;">
             <li>مقابلات إضافية مع جيني</li>
             <li>جواز مقابلة PDF بالبريد من passport@muqabaleh.com</li>
             <li>دعم عبر support@muqabaleh.com</li>
           </ul>
           <p style="margin:12px 0 0;color:#64748b;font-size:14px;">خطتك: <strong>${planName}</strong></p>`
        : `<p style="margin:0 0 12px;">Your subscription is confirmed. Here's what's included:</p>
           <ul style="margin:0;padding-left:18px;color:#334155;line-height:1.75;">
             <li>More Jeannie interviews</li>
             <li>Passport PDF by email from passport@muqabaleh.com</li>
             <li>Support at support@muqabaleh.com</li>
           </ul>
           <p style="margin:12px 0 0;color:#64748b;font-size:14px;">Your plan: <strong>${planName}</strong></p>`,
      highlight: {
        label: isAr ? 'خطتك' : 'Your plan',
        value: planName,
        sublabel: isAr ? 'مفعّل' : 'Active',
      },
      ctaHref: localePath('/app', lang),
      ctaLabel: isAr ? 'افتح لوحة التحكم' : 'Open dashboard',
    });
    await sendBrevoEmail({
      to: user.email,
      subject,
      html,
      sender: SYSTEM_SENDER,
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
    const name = userName || (isAr ? 'مرحباً' : 'Hello');
    const subject = isAr
      ? 'إعادة تعيين كلمة المرور — مقابلة'
      : 'Reset your Muqabaleh password';
    const html = brandedEmailShell({
      locale,
      eyebrow: isAr ? 'أمان الحساب' : 'Account security',
      title: isAr
        ? `${name}، أعد تعيين كلمة المرور`
        : `${name}, reset your password`,
      bodyHtml: isAr
        ? `<p style="margin:0 0 12px;">استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك على مقابلة.</p>
           <p style="margin:0;color:#64748b;font-size:14px;">الرابط صالح لمدة ساعة واحدة. إذا لم تطلب هذا، تجاهل الرسالة — لن تتغير كلمة مرورك.</p>`
        : `<p style="margin:0 0 12px;">We received a request to reset your Muqabaleh password.</p>
           <p style="margin:0;color:#64748b;font-size:14px;">This link expires in 1 hour. If you didn't ask for this, ignore the email — your password stays the same.</p>`,
      ctaHref: resetLink,
      ctaLabel: isAr ? 'إعادة تعيين كلمة المرور' : 'Reset password',
      footnote: isAr
        ? 'لأمانك لا نشارك هذا الرابط مع أي جهة أخرى.'
        : 'For your security, we never share this link with anyone else.',
    });
    const brevo = await sendBrevoEmail({
      to: userEmail,
      subject,
      html,
      sender: SYSTEM_SENDER,
    });
    if (!brevo.success) {
      console.error('[EmailTrigger] Password reset Brevo failed:', brevo.error);
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
    if (ADMIN_EMAIL) {
      await sendEmail({ to: ADMIN_EMAIL, subject, html });
    }
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

    if (ADMIN_EMAIL) {
      await sendEmail({ to: ADMIN_EMAIL, subject, html });
    }
  } catch (err) {
    console.error('[EmailTrigger] Admin new application email failed:', err);
  }
}

/**
 * Trigger: Schedule all delayed emails for a booking after it's confirmed.
 * Call this once after capture-booking-order succeeds.
 */
export async function scheduleBookingEmails(bookingId: string) {
  // Resolve a single locale — do not double-send AR+EN to the same inbox.
  let locale: Locale = 'ar';
  try {
    const booking = await db.humanBooking.findUnique({
      where: { id: bookingId },
      select: { candidateEmail: true },
    });
    if (booking?.candidateEmail) {
      const user = await db.user.findUnique({
        where: { email: booking.candidateEmail },
        select: { language: true },
      });
      locale = localeFromUserLanguage(user?.language);
    }
  } catch {
    /* keep default ar */
  }

  triggerBookingConfirmationEmail(bookingId, locale).catch(() => {});
  triggerInterviewerNewBookingEmail(bookingId, locale).catch(() => {});

  // Queue delayed emails (processed by cron)
  triggerSessionReminderEmail(bookingId, locale).catch(() => {});
  triggerSessionStartingSoonEmail(bookingId, locale).catch(() => {});
  triggerReviewRequestEmail(bookingId, locale).catch(() => {});
}