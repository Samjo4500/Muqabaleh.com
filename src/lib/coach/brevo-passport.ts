import type { PrepSelections } from './types';
import { MUQABALEH_BRAND, localePath } from '@/lib/brand/comms';
import { brandedEmailShell, sendBrevoEmail } from '@/lib/brevo';

const SENDER = MUQABALEH_BRAND.senders.passport;
const REPLY_TO = MUQABALEH_BRAND.replyTo;

export function passportEmailSubject(
  language: PrepSelections['language'],
): string {
  if (language === 'ar') {
    return 'جواز مقابلتك جاهز — شهادتك الموثقة من مقابلة';
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
  const locale = ar ? 'ar' : 'en';
  const name = opts.name || (ar ? 'مرشح' : 'Candidate');
  const title = ar ? `مبروك، ${name}` : `Congratulations, ${name}`;
  const intro = ar
    ? '<p style="margin:0 0 12px;">أكملت محاكاة المقابلة بنجاح. جوازك الموثّق مرفق بهذا البريد — بنفس تصميم الشهادة داخل المنصة.</p>'
    : '<p style="margin:0 0 12px;">You completed your mock interview. Your verified passport PDF is attached — matching the credential design inside Muqabaleh.</p>';
  const share = ar
    ? '<p style="margin:0;">شارك جوازك على LinkedIn أو أرفقه مع طلبات التوظيف. يمكن لأي جهة عمل مسح رمز QR للتحقق.</p>'
    : '<p style="margin:0;">Share your passport on LinkedIn or attach it to applications. Employers can scan the QR code to verify authenticity.</p>';

  return brandedEmailShell({
    locale,
    eyebrow: ar ? 'جواز المقابلة الموثّق' : 'Verified Interview Passport',
    title,
    bodyHtml: `${intro}${share}`,
    highlight: {
      label: ar ? 'الدرجة الكلية' : 'Overall score',
      value: `${opts.overallScore}/100`,
      sublabel: opts.grade,
    },
    ctaHref: localePath('/dashboard', locale),
    ctaLabel: ar ? 'عرض لوحة التحكم' : 'View dashboard',
    footnote: ar
      ? 'إذا لم يظهر المرفق، افتح لوحة التحكم وحمّل الجواز من هناك.'
      : 'If the attachment is missing, open your dashboard and download the passport there.',
  });
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
  if (!opts.to?.trim()) {
    console.error('[coach/brevo-passport] recipient missing');
    return { success: false, error: 'recipient missing' };
  }

  const result = await sendBrevoEmail({
    to: opts.to.trim(),
    subject: passportEmailSubject(opts.language),
    html: passportEmailHtml({
      language: opts.language,
      name: opts.name,
      overallScore: opts.overallScore,
      grade: opts.grade,
    }),
    sender: SENDER,
    replyTo: REPLY_TO,
    attachment: [
      {
        name: passportPdfFilename(opts.name),
        content: opts.pdf.toString('base64'),
      },
    ],
  });

  if (!result.success) {
    console.error('[coach/brevo-passport] send failed', result.error);
  }
  return { success: result.success, error: result.error };
}
