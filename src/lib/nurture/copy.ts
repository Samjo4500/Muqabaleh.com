import {
  NURTURE_CITIES,
  NURTURE_EXPERIENCE,
  type NurtureCity,
  type NurtureExperience,
} from './constants';

export const CITY_LABELS: Record<NurtureCity, { en: string; ar: string }> = {
  Dubai: { en: 'Dubai', ar: 'دبي' },
  'Abu Dhabi': { en: 'Abu Dhabi', ar: 'أبوظبي' },
  Riyadh: { en: 'Riyadh', ar: 'الرياض' },
  Jeddah: { en: 'Jeddah', ar: 'جدة' },
  Cairo: { en: 'Cairo', ar: 'القاهرة' },
  Amman: { en: 'Amman', ar: 'عمّان' },
  Other: { en: 'Other', ar: 'أخرى' },
};

export const EXPERIENCE_LABELS: Record<
  NurtureExperience,
  { en: string; ar: string }
> = {
  '0-2': { en: '0-2 years', ar: '0–2 سنوات' },
  '3-5': { en: '3-5 years', ar: '3–5 سنوات' },
  '5+': { en: '5+ years', ar: 'أكثر من 5 سنوات' },
};

export const LANGUAGE_LABELS = {
  EN: { en: 'English', ar: 'الإنجليزية' },
  AR: { en: 'Arabic', ar: 'العربية' },
  BOTH: { en: 'Both', ar: 'كلاهما' },
} as const;

export const GATE1 = {
  en: {
    headline: 'Unlock Your Muqabaleh Passport',
    subhead:
      'See your scores, strengths, and exactly what to improve before your real interview.',
    name: 'Full Name',
    namePh: 'Your full name',
    email: 'Email',
    emailPh: 'you@example.com',
    city: 'Current City',
    company: 'Company (optional)',
    companyPh: 'e.g., Careem, self-employed, or between roles',
    phone: 'Phone / WhatsApp (optional)',
    phonePh: '+971 50 000 0000',
    cta: 'UNLOCK MY RESULTS →',
    skip: 'Skip for now — I just want to browse jobs',
    trust: 'No spam. We only send interview tips and relevant MENA roles.',
    successHeadline: 'Thank you — we received your details',
    successBody:
      'Your score is on its way to your inbox. Check email (and spam) in the next few minutes.',
    seeScorecard: 'SEE MY RESULTS →',
    viewDashboard: 'Check your dashboard',
    practiceAgain: 'PRACTICE AGAIN',
    browseRoles: 'BROWSE ROLES',
    seeResults: 'See My Results',
    completeTitle: 'Interview complete',
    completeSub: 'Unlock your passport to see scores, strengths, and what to fix.',
    required: 'This field is required.',
    invalidEmail: 'Enter a valid email.',
    sending: 'Unlocking…',
    sendFailed: 'Could not save your details. Please try again.',
    emailedNote: 'We emailed your score to',
  },
  ar: {
    headline: 'افتح جواز مقابلة',
    subhead:
      'اطّلع على درجاتك ونقاط قوتك وما يجب تحسينه قبل مقابلتك الحقيقية.',
    name: 'الاسم الكامل',
    namePh: 'اسمك الكامل',
    email: 'البريد الإلكتروني',
    emailPh: 'you@example.com',
    city: 'المدينة الحالية',
    company: 'الشركة (اختياري)',
    companyPh: 'مثال: كريم، عمل حر، أو بين وظيفتين',
    phone: 'الهاتف / واتساب (اختياري)',
    phonePh: '+971 50 000 0000',
    cta: 'افتح نتائجي ←',
    skip: 'تخطَّ الآن — أريد تصفّح الوظائف فقط',
    trust: 'بلا رسائل مزعجة. نرسل فقط نصائح المقابلات ووظائف مناسبة في المنطقة.',
    successHeadline: 'شكراً — استلمنا بياناتك',
    successBody:
      'درجتك في طريقها إلى بريدك. راجع صندوق الوارد (والبريد المزعج) خلال دقائق.',
    seeScorecard: 'عرض نتائجي ←',
    viewDashboard: 'تحقق من لوحة التحكم',
    practiceAgain: 'تدرّب مرة أخرى',
    browseRoles: 'تصفّح الوظائف',
    seeResults: 'عرض نتائجي',
    completeTitle: 'انتهت المقابلة',
    completeSub: 'افتح جوازك لترى الدرجات ونقاط القوة وما يجب تحسينه.',
    required: 'هذا الحقل مطلوب.',
    invalidEmail: 'أدخل بريداً إلكترونياً صحيحاً.',
    sending: 'جارٍ الفتح…',
    sendFailed: 'تعذّر حفظ بياناتك. حاول مرة أخرى.',
    emailedNote: 'أرسلنا درجتك إلى',
  },
} as const;

export const GATE2 = {
  en: {
    badge: 'ROLE-SPECIFIC PRACTICE',
    headline: (role: string, company: string) =>
      company
        ? `Practice for ${role} at ${company}`
        : `Practice for ${role}`,
    subhead:
      'Jeannie will ask questions tailored to this role. Get scored. Walk in ready.',
    email: 'Email',
    emailPh: 'you@example.com',
    name: 'Full Name',
    namePh: 'Your full name',
    experience: 'Years of Experience',
    language: 'Preferred Language',
    city: 'Current City',
    cta: 'START PRACTICE →',
    save: 'Not ready? Save this role for later',
    saved: 'Saved. We will email you when you are ready.',
    saveNeedsEmail: 'Add your email to save this role.',
    sending: 'Starting…',
    required: 'This field is required.',
    invalidEmail: 'Enter a valid email.',
  },
  ar: {
    badge: 'تدريب مخصّص للوظيفة',
    headline: (role: string, company: string) =>
      company ? `تدرّب على ${role} لدى ${company}` : `تدرّب على ${role}`,
    subhead:
      'جيني ستطرح أسئلة مخصّصة لهذه الوظيفة. ستحصل على تقييم. تدخل المقابلة جاهزاً.',
    email: 'البريد الإلكتروني',
    emailPh: 'you@example.com',
    name: 'الاسم الكامل',
    namePh: 'اسمك الكامل',
    experience: 'سنوات الخبرة',
    language: 'اللغة المفضّلة',
    city: 'المدينة الحالية',
    cta: 'ابدأ التدريب ←',
    save: 'لست جاهزاً؟ احفظ هذه الوظيفة للاحقاً',
    saved: 'تم الحفظ. سنراسلك عندما تكون جاهزاً.',
    saveNeedsEmail: 'أضف بريدك لحفظ هذه الوظيفة.',
    sending: 'جارٍ البدء…',
    required: 'هذا الحقل مطلوب.',
    invalidEmail: 'أدخل بريداً إلكترونياً صحيحاً.',
  },
} as const;

export const PREFS_COPY = {
  en: {
    title: 'Email preferences',
    sub: 'Choose how often Jeannie writes to you.',
    less: 'Email me less often',
    pause: 'Pause for 30 days',
    unsub: 'Unsubscribe completely',
    resume: 'Resume normal emails',
    saved: 'Preferences saved.',
    missing: 'This link is invalid or expired.',
    unsubTitle: 'Unsubscribed',
    unsubBody:
      'You will no longer receive nurture emails from Muqabaleh. You can change this anytime from the preference center.',
    manage: 'Manage preferences',
  },
  ar: {
    title: 'تفضيلات البريد',
    sub: 'اختر كم مرة تراسلك جيني.',
    less: 'راسلني أقل',
    pause: 'إيقاف لمدة 30 يوماً',
    unsub: 'إلغاء الاشتراك بالكامل',
    resume: 'استئناف الرسائل العادية',
    saved: 'تم حفظ التفضيلات.',
    missing: 'هذا الرابط غير صالح أو منتهٍ.',
    unsubTitle: 'تم إلغاء الاشتراك',
    unsubBody:
      'لن تصلك رسائل التغذية من مقابلة. يمكنك تغيير ذلك في أي وقت من مركز التفضيلات.',
    manage: 'إدارة التفضيلات',
  },
} as const;

export function cityOptions(isAr: boolean) {
  return NURTURE_CITIES.map((id) => ({
    id,
    label: isAr ? CITY_LABELS[id].ar : CITY_LABELS[id].en,
  }));
}

export function experienceOptions(isAr: boolean) {
  return NURTURE_EXPERIENCE.map((id) => ({
    id,
    label: isAr ? EXPERIENCE_LABELS[id].ar : EXPERIENCE_LABELS[id].en,
  }));
}

export function languageOptions(isAr: boolean) {
  return (['EN', 'AR', 'BOTH'] as const).map((id) => ({
    id,
    label: isAr ? LANGUAGE_LABELS[id].ar : LANGUAGE_LABELS[id].en,
  }));
}
