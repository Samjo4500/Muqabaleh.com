import type { PrepSelections } from './types';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const SENDER = { name: 'Muqabaleh', email: 'passport@muqabaleh.com' };
const REPLY_TO = { email: 'support@muqabaleh.com', name: 'Muqabaleh Support' };

export function passportEmailSubject(
  language: PrepSelections['language'],
): string {
  if (language === 'ar') {
    return 'جواز مقابلتك جاهز — شهادتك الموثقة من Muqabaleh';
  }
  if (language === 'mixed') {
    return 'Your Interview Passport is Ready / جواز مقابلتك جاهز — Muqabaleh';
  }
  return 'Your Interview Passport is Ready — Muqabaleh Verified';
}

/** Mixed defaults body to Arabic (primary MENA market). */
function bodyIsArabic(language: PrepSelections['language']): boolean {
  return language === 'ar' || language === 'mixed';
}

export function passportEmailHtml(opts: {
  language: PrepSelections['language'];
  name: string;
  overallScore: number;
  grade: string;
}): string {
  const ar = bodyIsArabic(opts.language);
  const safeName = escapeHtml(opts.name || 'Candidate');
  const heading = ar
    ? `مبروك، ${safeName}!`
    : `Congratulations, ${safeName}!`;
  const intro = ar
    ? 'أكملت محاكاة المقابلة بنجاح. جوازك الموثق مرفق مع هذا البريد.'
    : 'You completed your mock interview. Your verified passport is attached.';
  const scoreLabel = ar ? 'الدرجة الكلية' : 'Overall Score';
  const share = ar
    ? 'شارك جوازك على LinkedIn أو أرفقه مع طلبات التوظيف.'
    : 'Share your passport on LinkedIn or attach it to job applications.';
  const cta = ar ? 'عرض لوحة التحكم' : 'View Dashboard';
  const support = ar
    ? 'للدعم: support@muqabaleh.com'
    : 'Support: support@muqabaleh.com';

  return `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#1a1a1a;">
  <div style="background:#0f172a;padding:24px;text-align:center;">
    <h2 style="color:#fff;margin:0;">Muqabaleh</h2>
  </div>
  <div style="padding:32px 24px;">
    <h1>${heading}</h1>
    <p>${intro}</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin:24px 0;text-align:center;">
      <div style="font-size:14px;color:#64748b;text-transform:uppercase;">${scoreLabel}</div>
      <div style="font-size:48px;font-weight:700;color:#0f172a;margin:8px 0;">${opts.overallScore}/100</div>
      <div style="font-size:20px;color:#3b82f6;font-weight:600;">${escapeHtml(opts.grade)}</div>
    </div>
    <p>${share}</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="https://muqabaleh.com/dashboard" style="background:#0f172a;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">${cta}</a>
    </div>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />
    <p style="font-size:12px;color:#94a3b8;text-align:center;">Muqabaleh.com — AI Interview Coach<br/>${support}</p>
  </div>
</div>`;
}

export function passportPdfFilename(name: string, date = new Date()): string {
  const safe = (name || 'Candidate')
    .replace(/[^\p{L}\p{N}\-_]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  const day = date.toISOString().slice(0, 10);
  return `Muqabaleh-Interview-Passport-${safe || 'Candidate'}-${day}.pdf`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Send Interview Passport via Brevo transactional API.
 * Never throws — logs and returns success:false on failure.
 */
export async function sendPassportViaBrevo(opts: {
  to: string;
  language: PrepSelections['language'];
  name: string;
  overallScore: number;
  grade: string;
  pdf: Buffer;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    console.error('[coach/brevo-passport] BREVO_API_KEY missing');
    return { success: false, error: 'BREVO_API_KEY missing' };
  }
  if (!opts.to?.trim()) {
    console.error('[coach/brevo-passport] recipient missing');
    return { success: false, error: 'recipient missing' };
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
        sender: SENDER,
        to: [{ email: opts.to.trim() }],
        replyTo: REPLY_TO,
        subject: passportEmailSubject(opts.language),
        htmlContent: passportEmailHtml({
          language: opts.language,
          name: opts.name,
          overallScore: opts.overallScore,
          grade: opts.grade,
        }),
        attachment: [
          {
            name: passportPdfFilename(opts.name),
            content: opts.pdf.toString('base64'),
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(
        '[coach/brevo-passport] Brevo error',
        res.status,
        errText.slice(0, 300),
      );
      return { success: false, error: `brevo_${res.status}` };
    }

    return { success: true };
  } catch (err) {
    console.error('[coach/brevo-passport] send failed', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'exception',
    };
  }
}
