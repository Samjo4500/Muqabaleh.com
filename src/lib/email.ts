import { Resend } from 'resend';
import { db } from './db';
import { MUQABALEH_BRAND } from '@/lib/brand/comms';

const DEFAULT_FROM = `Muqabaleh <${MUQABALEH_BRAND.senders.system.email}>`;
const REPLY_TO = MUQABALEH_BRAND.supportEmail;
const C = MUQABALEH_BRAND.colors;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured');
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Send an email immediately via Resend.
 * Returns { success: true, id } or { success: false, error }.
 */
export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
};

export type PartnerEmailBrand = {
  /** Display name in From header (sending domain stays Muqabaleh-verified). */
  fromName?: string | null;
  replyTo?: string | null;
};

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  attachments?: EmailAttachment[];
  /** Optional white-label display / reply-to overrides. */
  partnerBrand?: PartnerEmailBrand;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.error('[Email] Cannot send: RESEND_API_KEY missing');
    return { success: false, error: 'Email service not configured' };
  }

  const partnerFrom =
    opts.partnerBrand?.fromName?.trim()
      ? `${opts.partnerBrand.fromName.trim()} <${MUQABALEH_BRAND.senders.system.email}>`
      : null;
  const partnerReply = opts.partnerBrand?.replyTo?.trim() || null;

  try {
    const { data, error } = await resend.emails.send({
      from: opts.from || partnerFrom || DEFAULT_FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo || partnerReply || REPLY_TO,
      cc: opts.cc
        ? Array.isArray(opts.cc)
          ? opts.cc
          : [opts.cc]
        : undefined,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
        contentType: a.contentType,
      })),
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Email] Exception:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Queue an email to be sent later (via cron).
 * Returns the queue record id.
 */
export async function queueEmail(opts: {
  to: string;
  subject: string;
  html: string;
  sendAt: Date;
  from?: string;
}) {
  const record = await db.emailQueue.create({
    data: {
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      from: opts.from || DEFAULT_FROM,
      sendAt: opts.sendAt,
    },
  });
  return record.id;
}

/**
 * Process all due queued emails (called by /api/email/cron).
 * Returns count of sent and failed.
 */
export async function processEmailQueue(): Promise<{ sent: number; failed: number }> {
  const dueEmails = await db.emailQueue.findMany({
    where: {
      sent: false,
      sendAt: { lte: new Date() },
    },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const email of dueEmails) {
    // Skip free-only drip nudges if the user already upgraded / deleted.
    if (email.subject.includes('[mq-drip:')) {
      const { shouldSendDripEmail, sendDripViaBrevo } = await import('@/lib/email-drip');
      const ok = await shouldSendDripEmail(email.to, email.subject);
      if (!ok) {
        await db.emailQueue.update({
          where: { id: email.id },
          data: { sent: true, sentAt: new Date(), error: 'skipped_upgraded_or_inactive' },
        });
        sent++;
        continue;
      }
      const drip = await sendDripViaBrevo({
        to: email.to,
        subject: email.subject,
        html: email.html,
      });
      if (drip.success) {
        await db.emailQueue.update({
          where: { id: email.id },
          data: { sent: true, sentAt: new Date() },
        });
        sent++;
        continue;
      }
      await db.emailQueue.update({
        where: { id: email.id },
        data: { error: drip.error || 'brevo_failed' },
      });
      failed++;
      continue;
    }

    // Prefer Brevo for all queued mail when configured.
    let result: { success: boolean; error?: string } = { success: false };
    const { hasBrevoApiKey } = await import('@/lib/env/runtime');
    if (hasBrevoApiKey()) {
      const { sendBrevoEmail } = await import('@/lib/brevo');
      result = await sendBrevoEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
      });
    }
    if (!result.success) {
      result = await sendEmail({
        to: email.to,
        subject: email.subject,
        html: email.html,
        from: email.from || undefined,
      });
    }

    if (result.success) {
      await db.emailQueue.update({
        where: { id: email.id },
        data: { sent: true, sentAt: new Date() },
      });
      sent++;
    } else {
      await db.emailQueue.update({
        where: { id: email.id },
        data: { error: result.error },
      });
      failed++;
      try {
        const { writeAdminNotification } = await import('@/lib/admin/notify');
        await writeAdminNotification({
          channel: 'EMAIL',
          recipient: email.to,
          subject: `Queue failed: ${email.subject}`,
          body: result.error || 'Send failed',
          status: 'FAILED',
          href: '/admin/content/email-queue',
          kind: 'queue',
          severity: 'critical',
        });
      } catch {
        /* ignore notify failures */
      }
    }
  }

  return { sent, failed };
}

// ─── Shared email layout helpers (aligned with Brevo brandedEmailShell) ───

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || MUQABALEH_BRAND.siteUrl;

export function emailBaseHtml(body: string, locale: 'en' | 'ar' = 'en'): string {
  const isAr = locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const brand = isAr ? MUQABALEH_BRAND.nameAr : MUQABALEH_BRAND.name;
  const tagline = isAr ? MUQABALEH_BRAND.taglineAr : MUQABALEH_BRAND.taglineEn;
  const fontFamily = isAr
    ? "'Noto Naskh Arabic','Segoe UI',Tahoma,Arial,sans-serif"
    : "'Segoe UI','Helvetica Neue',Arial,sans-serif";

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Muqabaleh</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${fontFamily};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.white};border-radius:14px;overflow:hidden;border:1px solid ${C.line};">
          <tr><td style="height:4px;background:${C.teal};font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:${C.navy};padding:22px 28px;text-align:${align};">
              <div style="font-size:22px;font-weight:700;color:${C.white};">${brand}</div>
              <div style="margin-top:4px;font-size:12px;color:${C.tealSoft};font-weight:600;">${tagline}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 18px;text-align:${align};color:${C.ink};">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 26px;border-top:1px solid ${C.line};text-align:center;color:${C.muted};font-size:12px;">
              <p style="margin:0 0 4px;">&copy; ${new Date().getFullYear()} Muqabaleh (مقابلة)</p>
              <p style="margin:0;"><a href="${APP_URL}" style="color:${C.navy};text-decoration:none;font-weight:600;">${APP_URL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buttonHtml(url: string, label: string, bgColor: string = C.teal): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr>
        <td align="center" style="border-radius:8px;background-color:${bgColor};">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:${C.navyDeep};font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

export function dividerHtml(): string {
  return `<hr style="border:none;border-top:1px solid ${C.line};margin:24px 0;" />`;
}

export { APP_URL };
