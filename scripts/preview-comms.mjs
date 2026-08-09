/**
 * Generate EN/AR passport PDF samples + email HTML previews for visual QA.
 * Run: node --import tsx scripts/preview-comms.mjs
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const outDir = path.join(process.cwd(), '/tmp/cursor/artifacts/comms-preview');
fs.mkdirSync(outDir, { recursive: true });

async function loadTs(rel) {
  const abs = path.join(process.cwd(), rel);
  return import(pathToFileURL(abs).href);
}

const score = {
  overallScore: 87,
  grade: 'A',
  competencyBreakdown: [
    { name: 'Communication', score: 90 },
    { name: 'Problem Solving', score: 85 },
    { name: 'Technical Depth', score: 88 },
    { name: 'Leadership', score: 80 },
    { name: 'Culture Fit', score: 86 },
    { name: 'Ownership', score: 84 },
  ],
  strengths: [
    'Clear structured answers with strong STAR examples',
    'Confident technical trade-off explanations',
    'Calm presence under follow-up pressure',
  ],
  improvements: [
    'Quantify impact with sharper metrics',
    'Tighten closing statements',
    'Ask one stronger clarifying question early',
  ],
  summary: 'Strong candidate ready for mid-level interviews.',
};

const scoreAr = {
  ...score,
  competencyBreakdown: [
    { name: 'التواصل', score: 90 },
    { name: 'حل المشكلات', score: 85 },
    { name: 'العمق التقني', score: 88 },
    { name: 'القيادة', score: 80 },
    { name: 'الملاءمة الثقافية', score: 86 },
    { name: 'الملكية', score: 84 },
  ],
  strengths: [
    'إجابات منظمة بأمثلة واضحة وفق نموذج STAR',
    'شرح واثق لموازنات تقنية معقدة',
    'حضور هادئ تحت ضغط الأسئلة المتابعة',
  ],
  improvements: [
    'تعزيز قياس الأثر بأرقام أدق',
    'اختصار خاتمة الإجابات',
    'طرح سؤال توضيحي أقوى في البداية',
  ],
};

const { buildPassportPdfBuffer } = await loadTs('src/lib/coach/passport-pdf.tsx');
const { passportEmailHtml } = await loadTs('src/lib/coach/brevo-passport.ts');
const { brandedEmailShell } = await loadTs('src/lib/brevo.ts');

const enPdf = await buildPassportPdfBuffer({
  candidateName: 'Sam Jordan',
  role: 'Software Engineer',
  industry: 'Technology / SaaS',
  seniority: 'Mid-level',
  language: 'English',
  interviewDate: '2026-08-09',
  score,
  verificationId: 'MQB-EN-DEMO-001',
  verifyUrl: 'https://muqabaleh.com/verify/MQB-EN-DEMO-001',
  rtl: false,
});

const arPdf = await buildPassportPdfBuffer({
  candidateName: 'سام جوردان',
  role: 'مهندس برمجيات',
  industry: 'التقنية / SaaS',
  seniority: 'متوسط',
  language: 'العربية',
  interviewDate: '2026-08-09',
  score: scoreAr,
  verificationId: 'MQB-AR-DEMO-001',
  verifyUrl: 'https://muqabaleh.com/verify/MQB-AR-DEMO-001',
  rtl: true,
});

fs.writeFileSync(path.join(outDir, 'passport-en.pdf'), enPdf);
fs.writeFileSync(path.join(outDir, 'passport-ar.pdf'), arPdf);

const emails = {
  'passport-en.html': passportEmailHtml({
    language: 'en',
    name: 'Sam Jordan',
    overallScore: 87,
    grade: 'A',
  }),
  'passport-ar.html': passportEmailHtml({
    language: 'ar',
    name: 'سام جوردان',
    overallScore: 87,
    grade: 'A',
  }),
  'welcome-en.html': brandedEmailShell({
    locale: 'en',
    eyebrow: 'Your account is ready',
    title: 'Welcome, Sam',
    bodyHtml:
      '<p style="margin:0 0 12px;">Your <strong>Muqabaleh</strong> account is ready. Your first interview with Jeannie is free.</p>',
    ctaHref: 'https://muqabaleh.com/en/interview/prep',
    ctaLabel: 'Start your free interview',
  }),
  'welcome-ar.html': brandedEmailShell({
    locale: 'ar',
    eyebrow: 'حسابك جاهز',
    title: 'مرحباً بك، سام',
    bodyHtml:
      '<p style="margin:0 0 12px;">حسابك في <strong>مقابلة</strong> جاهز. مقابلتك الأولى مع جيني مجانية.</p>',
    ctaHref: 'https://muqabaleh.com/interview/prep',
    ctaLabel: 'ابدأ مقابلتك المجانية',
  }),
  'reset-en.html': brandedEmailShell({
    locale: 'en',
    eyebrow: 'Account security',
    title: 'Sam, reset your password',
    bodyHtml:
      '<p style="margin:0;">We received a request to reset your Muqabaleh password.</p>',
    ctaHref: 'https://muqabaleh.com/en/auth/reset-password?token=demo',
    ctaLabel: 'Reset password',
  }),
  'reset-ar.html': brandedEmailShell({
    locale: 'ar',
    eyebrow: 'أمان الحساب',
    title: 'سام، أعد تعيين كلمة المرور',
    bodyHtml:
      '<p style="margin:0;">استلمنا طلباً لإعادة تعيين كلمة المرور لحسابك على مقابلة.</p>',
    ctaHref: 'https://muqabaleh.com/auth/reset-password?token=demo',
    ctaLabel: 'إعادة تعيين كلمة المرور',
  }),
  'subscription-en.html': brandedEmailShell({
    locale: 'en',
    eyebrow: 'Subscription confirmed',
    title: "You're on Pro",
    bodyHtml: '<p style="margin:0;">Thanks for upgrading. Passport PDFs now arrive by email.</p>',
    highlight: { label: 'Your plan', value: 'Pro', sublabel: 'Active' },
    ctaHref: 'https://muqabaleh.com/en/dashboard',
    ctaLabel: 'Open dashboard',
  }),
  'subscription-ar.html': brandedEmailShell({
    locale: 'ar',
    eyebrow: 'تأكيد الاشتراك',
    title: 'تم تفعيل Pro',
    bodyHtml: '<p style="margin:0;">شكراً لترقيتك. جواز المقابلة يصل الآن بالبريد.</p>',
    highlight: { label: 'خطتك', value: 'Pro', sublabel: 'مفعّل' },
    ctaHref: 'https://muqabaleh.com/dashboard',
    ctaLabel: 'افتح لوحة التحكم',
  }),
};

for (const [name, html] of Object.entries(emails)) {
  fs.writeFileSync(path.join(outDir, name), html);
}

console.log(
  JSON.stringify(
    {
      outDir,
      pdf: {
        enBytes: enPdf.length,
        arBytes: arPdf.length,
      },
      emails: Object.keys(emails),
    },
    null,
    2,
  ),
);
