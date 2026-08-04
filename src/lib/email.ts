import { Resend } from 'resend';
import { db } from './db';

const DEFAULT_FROM = 'Muqabaleh <noreply@muqabaleh.com>';
const REPLY_TO = 'support@muqabaleh.com';

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
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    console.error('[Email] Cannot send: RESEND_API_KEY missing');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: opts.from || DEFAULT_FROM,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo || REPLY_TO,
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
    const result = await sendEmail({
      to: email.to,
      subject: email.subject,
      html: email.html,
      from: email.from || undefined,
    });

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
    }
  }

  return { sent, failed };
}

// ─── Shared email layout helpers ───

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://muqabaleh.com';
const LOGO_URL = `${APP_URL}/logo.svg`;

export function emailBaseHtml(body: string, locale: 'en' | 'ar' = 'en'): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const fontFamily = locale === 'ar'
    ? "'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif"
    : "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${locale}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Muqabaleh</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:${fontFamily};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="padding:24px 0 16px;text-align:center;">
              <a href="${APP_URL}" target="_blank">
                <img src="${LOGO_URL}" alt="Muqabaleh" width="140" style="height:auto;" />
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:32px 40px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 0 8px;text-align:center;color:#71717a;font-size:13px;">
              <p style="margin:0 0 4px;">&copy; ${new Date().getFullYear()} Muqabaleh (مقابلة). All rights reserved.</p>
              <p style="margin:0;"><a href="${APP_URL}" style="color:#18181b;text-decoration:underline;">${APP_URL}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buttonHtml(url: string, label: string, bgColor = '#18181b'): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr>
        <td align="center" style="border-radius:8px;background-color:${bgColor};">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${label}</a>
        </td>
      </tr>
    </table>`;
}

export function dividerHtml(): string {
  return `<hr style="border:none;border-top:1px solid #e4e4e7;margin:24px 0;" />`;
}

export { APP_URL };
