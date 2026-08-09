/**
 * Brevo transactional email helper for muqabaleh.com.
 * Reads BREVO_API_KEY from env only. Never throws to callers that catch.
 */

import {
  MUQABALEH_BRAND,
  escapeHtml,
  appBaseUrl,
} from '@/lib/brand/comms';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER = MUQABALEH_BRAND.senders.system;
const DEFAULT_REPLY_TO = MUQABALEH_BRAND.replyTo;
const C = MUQABALEH_BRAND.colors;

export type BrevoAttachment = {
  name: string;
  content: string; // base64
};

export async function sendBrevoEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  sender?: { name: string; email: string };
  replyTo?: { name?: string; email: string };
  attachment?: BrevoAttachment[];
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.error('[brevo] BREVO_API_KEY missing');
    return { success: false, error: 'BREVO_API_KEY missing' };
  }

  const recipients = (Array.isArray(opts.to) ? opts.to : [opts.to])
    .map((e) => e.trim())
    .filter(Boolean)
    .map((email) => ({ email }));

  if (!recipients.length) {
    console.error('[brevo] no recipients');
    return { success: false, error: 'no recipients' };
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: opts.sender || DEFAULT_SENDER,
        to: recipients,
        replyTo: opts.replyTo || DEFAULT_REPLY_TO,
        subject: opts.subject,
        htmlContent: opts.html,
        attachment: opts.attachment,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error('[brevo] send failed', res.status, errText.slice(0, 300));
      return { success: false, error: `brevo_${res.status}` };
    }

    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return { success: true, messageId: data.messageId };
  } catch (err) {
    console.error('[brevo] exception', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'exception',
    };
  }
}

export type BrandedEmailHighlight = {
  label: string;
  value: string;
  sublabel?: string;
};

/**
 * Shared Muqabaleh email chrome — navy/teal passport language for all transactional mail.
 */
export function brandedEmailShell(opts: {
  title: string;
  bodyHtml: string;
  ctaHref?: string;
  ctaLabel?: string;
  locale?: 'ar' | 'en';
  eyebrow?: string;
  highlight?: BrandedEmailHighlight;
  footnote?: string;
}): string {
  const isAr = opts.locale === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const brand = isAr ? MUQABALEH_BRAND.nameAr : MUQABALEH_BRAND.name;
  const tagline = isAr ? MUQABALEH_BRAND.taglineAr : MUQABALEH_BRAND.taglineEn;
  const support = isAr
    ? `للدعم: ${MUQABALEH_BRAND.supportEmail}`
    : `Support: ${MUQABALEH_BRAND.supportEmail}`;
  const eyebrow =
    opts.eyebrow ||
    (isAr ? 'مقابلة — AI Interview Coach' : 'Muqabaleh — AI Interview Coach');
  const align = isAr ? 'right' : 'left';
  const fontStack = isAr
    ? "'Noto Naskh Arabic','Segoe UI',Tahoma,Arial,sans-serif"
    : "'Segoe UI','Helvetica Neue',Arial,sans-serif";

  const highlight = opts.highlight
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:${C.navy};border-radius:12px;padding:22px 20px;text-align:center;">
      <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.65);margin-bottom:8px;">${escapeHtml(opts.highlight.label)}</div>
      <div style="font-size:40px;line-height:1;font-weight:700;color:${C.white};margin:0 0 6px;">${escapeHtml(opts.highlight.value)}</div>
      ${
        opts.highlight.sublabel
          ? `<div style="display:inline-block;margin-top:8px;padding:6px 14px;border:1px solid ${C.teal};border-radius:999px;color:${C.tealSoft};font-size:14px;font-weight:700;">${escapeHtml(opts.highlight.sublabel)}</div>`
          : ''
      }
    </td>
  </tr>
</table>`
    : '';

  const cta =
    opts.ctaHref && opts.ctaLabel
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 8px;">
  <tr>
    <td style="background:${C.teal};border-radius:8px;">
      <a href="${opts.ctaHref}" style="display:inline-block;padding:14px 28px;color:${C.navyDeep};font-size:15px;font-weight:700;text-decoration:none;border-radius:8px;">${escapeHtml(opts.ctaLabel)}</a>
    </td>
  </tr>
</table>`
      : '';

  const footnote = opts.footnote
    ? `<p style="margin:16px 0 0;font-size:13px;color:${C.muted};line-height:1.55;text-align:${align};">${opts.footnote}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:${C.paper};font-family:${fontStack};-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.white};border-radius:14px;overflow:hidden;border:1px solid ${C.line};">
          <tr><td style="height:4px;background:${C.teal};font-size:0;line-height:0;">&nbsp;</td></tr>
          <tr>
            <td style="background:${C.navy};padding:22px 28px;text-align:${align};">
              <div style="font-size:22px;font-weight:700;color:${C.white};letter-spacing:0.02em;">${escapeHtml(brand)}</div>
              <div style="margin-top:4px;font-size:12px;color:${C.tealSoft};font-weight:600;">${escapeHtml(tagline)}</div>
              <div style="margin-top:10px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.55);">${escapeHtml(eyebrow)}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px 18px;text-align:${align};color:${C.ink};">
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:${C.navy};font-weight:700;">${escapeHtml(opts.title)}</h1>
              <div style="font-size:15px;line-height:1.65;color:${C.body};">
                ${opts.bodyHtml}
              </div>
              ${highlight}
              ${cta}
              ${footnote}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 26px;border-top:1px solid ${C.line};text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:${C.muted};">
                <a href="${appBaseUrl()}" style="color:${C.navy};text-decoration:none;font-weight:600;">Muqabaleh.com</a>
                — ${escapeHtml(tagline)}
              </p>
              <p style="margin:0;font-size:12px;color:${C.muted};">${escapeHtml(support)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
