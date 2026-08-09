/**
 * Brevo transactional email helper for muqabaleh.com.
 * Reads BREVO_API_KEY from env only. Never throws to callers that catch.
 */

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER = { name: 'Muqabaleh', email: 'noreply@muqabaleh.com' };
const DEFAULT_REPLY_TO = { email: 'support@muqabaleh.com', name: 'Muqabaleh Support' };

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

export function brandedEmailShell(opts: {
  title: string;
  bodyHtml: string;
  ctaHref?: string;
  ctaLabel?: string;
  locale?: 'ar' | 'en';
}): string {
  const isAr = opts.locale === 'ar';
  const support = isAr
    ? 'للدعم: support@muqabaleh.com'
    : 'Support: support@muqabaleh.com';
  const cta =
    opts.ctaHref && opts.ctaLabel
      ? `<div style="text-align:center;margin:32px 0;">
  <a href="${opts.ctaHref}" style="background:#0f172a;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${opts.ctaLabel}</a>
</div>`
      : '';

  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#1a1a1a;" dir="${isAr ? 'rtl' : 'ltr'}">
  <div style="background:#0f172a;padding:24px;text-align:center;">
    <h2 style="color:#fff;margin:0;">Muqabaleh</h2>
  </div>
  <div style="padding:32px 24px;">
    <h1 style="font-size:24px;margin:0 0 16px;">${opts.title}</h1>
    ${opts.bodyHtml}
    ${cta}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="font-size:12px;color:#94a3b8;text-align:center;">Muqabaleh.com — AI Interview Coach<br/>${support}</p>
  </div>
</div>`;
}
