export type Bi = { ar: string; en: string };

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

export const S100 = {
  kicker: { ar: 'باقة مقابلة للطلاب', en: 'Muqabaleh Student Interview Pack' },
  h1: { ar: 'من بغداد إلى الدار البيضاء.', en: 'From Baghdad to Casablanca.' },
  sub: {
    ar: 'كل طالب في المنطقة يستحق أن يدخل أول مقابلة عمل حقيقية وهو مستعد. نقدّم لأول 100 طالب أو خريج حديث مؤهلين باقة جاهزية مجانية — ليست اشتراك جيني برو.',
    en: 'Every MENA student deserves to walk into their first real interview ready. The first 100 verified students and recent graduates get a free Interview Pack — not a Jeannie Pro subscription.',
  },
  bulletsTitle: { ar: 'ماذا تتضمن الباقة؟', en: 'What is in the pack?' },
  bullets: [
    { ar: '3 مقابلات تجريبية بالذكاء الاصطناعي مخصصة للدور', en: '3 role-specific AI mock interviews' },
    { ar: 'تدريب بالعربية أو الإنجليزية', en: 'Practice in Arabic or English' },
    { ar: 'تغذية راجعة منظمة بعد كل محاولة', en: 'Structured feedback after every attempt' },
    { ar: 'صالحة 30 يوماً بعد التفعيل', en: 'Valid for 30 days after activation' },
  ],
  remaining: { ar: 'الباقات المتبقية', en: 'Packs remaining' },
  claimed: { ar: 'اكتملت الباقات', en: 'All packs claimed' },
  startLabel: { ar: 'بداية الحملة', en: 'Campaign start' },
  eligibilityTitle: { ar: 'من يمكنه التقديم؟', en: 'Who can apply?' },
  eligibilityBody: {
    ar: 'طلاب جامعيون حاليون أو خريجون أكملوا برنامجهم خلال آخر 12 شهراً، في منطقة الشرق الأوسط وشمال أفريقيا.',
    en: 'Current university students or graduates who completed their programme within the previous 12 months, across MENA.',
  },
  formTitle: { ar: 'قدّم الآن', en: 'Apply now' },
  needAccount: {
    ar: 'أنشئ حساباً مجانياً أو سجّل الدخول أولاً — الباقة تُفعَّل على حسابك في مقابلة.',
    en: 'Create a free account or sign in first — the pack is activated on your Muqabaleh account.',
  },
  register: { ar: 'إنشاء حساب', en: 'Create account' },
  signin: { ar: 'تسجيل الدخول', en: 'Sign in' },
  name: { ar: 'الاسم الكامل', en: 'Full name' },
  country: { ar: 'الدولة', en: 'Country' },
  university: { ar: 'الجامعة', en: 'University' },
  major: { ar: 'التخصص', en: 'Major / programme' },
  eligibility: { ar: 'الحالة الدراسية', en: 'Student status' },
  current: { ar: 'طالب حالي', en: 'Current student' },
  graduate: { ar: 'خريج خلال آخر 12 شهراً', en: 'Graduated in the last 12 months' },
  uniEmail: { ar: 'بريد الجامعة (إن وُجد)', en: 'University email (if you have one)' },
  proof: {
    ar: 'إثبات بسيط إن لم يتوفر بريد جامعي (مثال: رقم الطالب أو صفحة الكلية)',
    en: 'Short proof if you have no university email (e.g. student ID number or faculty page)',
  },
  submit: { ar: 'تقديم الطلب', en: 'Submit application' },
  termsTitle: { ar: 'شروط الحملة', en: 'Campaign terms' },
  terms: [
    { ar: 'مقصورة على أول 100 متقدم مؤهل يتم التحقق منهم.', en: 'Limited to the first 100 verified eligible applicants.' },
    { ar: 'الأهلية: طالب حالي أو خريج خلال آخر 12 شهراً في المنطقة.', en: 'Eligibility: current student or graduate from the previous 12 months in MENA.' },
    { ar: 'التحقق عبر بريد الجامعة عند توفره، أو إثبات يدوي بسيط. نجمع الحد الأدنى من البيانات.', en: 'Verification: university email where available, or a simple manual proof process. We collect only the minimum required data.' },
    { ar: 'باقة واحدة لكل شخص، غير قابلة للتحويل، ولا يوجد بديل نقدي.', en: 'One pack per eligible person, non-transferable, no cash alternative.' },
    { ar: 'الباقة تشمل 3 أرصدة تدرّب على المقابلة وتغذية راجعة منظمة. ليست ضمان توظيف أو عرض عمل.', en: 'The pack includes 3 interview-practice credits and structured feedback. It is not an employment guarantee, job offer, or promise of hiring.' },
    { ar: 'تنتهي صلاحية الباقة بعد 30 يوماً من التفعيل.', en: 'The pack expires 30 days after activation.' },
    { ar: 'يجوز لمقابلة إغلاق الحملة أو إيقافها أو تعديلها عند الاقتضاء القانوني أو في حال الاحتيال/إساءة الاستخدام.', en: 'Muqabaleh may close, pause, or amend the campaign only where legally required or in the event of fraud/abuse.' },
  ],
  notPro: {
    ar: 'هذه باقة مقابلات لمرة واحدة — ليست حساب جيني برو.',
    en: 'This is a one-time Interview Pack — not a Jeannie Pro account.',
  },
  practiceCta: { ar: 'ابدأ التدرّب', en: 'Start practicing' },
  pending: {
    ar: 'تم استلام طلبك. سنفعّل الباقة بعد التحقق. لا تشارك وثائق شخصية في التعليقات العامة.',
    en: 'Application received. If eligible, we will activate the pack after verification. Do not share personal documents in public replies.',
  },
  activated: {
    ar: 'تم تفعيل باقة الطلاب: 3 مقابلات تجريبية صالحة 30 يوماً.',
    en: 'Student Interview Pack activated: 3 mock interviews, valid for 30 days.',
  },
  rejected: { ar: 'لم يتم قبول هذا الطلب.', en: 'This application was not approved.' },
  expired: { ar: 'انتهت صلاحية الباقة.', en: 'This pack has expired.' },
  soldOut: {
    ar: 'اكتملت الـ 100 باقة. شكراً لاهتمامك.',
    en: 'All 100 packs have been claimed. Thank you for your interest.',
  },
  error: { ar: 'تعذّر إرسال الطلب. حاول مرة أخرى.', en: 'Could not submit. Please try again.' },
  already: { ar: 'لديك طلب مسجّل مسبقاً لهذه الحملة.', en: 'You already have an application for this campaign.' },
} as const;

export function t100(key: keyof typeof S100, locale: string): string {
  const value = S100[key];
  if (Array.isArray(value)) return '';
  return pick(value as Bi, locale);
}
