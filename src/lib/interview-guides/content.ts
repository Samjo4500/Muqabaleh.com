import type { Bi, GuideCompany, GuideRole } from './types';

export function bi(locale: string, value: Bi): string {
  return locale === 'en' ? value.en : value.ar;
}

/** @deprecated prefer interviewProcessVariant from variants.ts */
export function interviewProcessSteps(subject: string, locale: string): string[] {
  if (locale === 'en') {
    return [
      `HR / recruiter screen — motives, logistics, and fit for ${subject}.`,
      'Technical or role assessment — skills, case, or work-sample discussion.',
      'Behavioral interview — ownership, conflict, and collaboration stories.',
      'Final / hiring manager — level calibration, offer expectations, and team match.',
    ];
  }
  return [
    `مقابلة موارد بشرية / مسؤّل توظيف — الدوافع واللوجستيات والملاءمة لـ ${subject}.`,
    'تقييم تقني أو حسب الدور — مهارات، حالة عملية، أو نقاش عينة عمل.',
    'مقابلة سلوكية — قصص الملكية والصراع والتعاون.',
    'المرحلة النهائية / مدير التوظيف — معايرة المستوى وتوقعات العرض وملاءمة الفريق.',
  ];
}

export function companyGuideFaqs(
  company: GuideCompany,
  opts?: { roleHint?: GuideRole | null },
): Array<{ q: Bi; a: Bi }> {
  const nameEn = company.name.en;
  const nameAr = company.name.ar;
  const roleEn = opts?.roleHint?.name.en || 'your target role';
  const roleAr = opts?.roleHint?.name.ar || 'الدور المستهدف';
  const salaryEn = opts?.roleHint?.salaryHint.en || company.salaryHint.en;
  const salaryAr = opts?.roleHint?.salaryHint.ar || company.salaryHint.ar;

  return [
    {
      q: {
        en: `What are the most important questions in a ${roleEn} interview?`,
        ar: `ما هي أهم الأسئلة في مقابلة ${roleAr}؟`,
      },
      a: {
        en: `Expect ownership stories, role fundamentals, and ${nameEn}-specific scenarios. Practice the question list on this page aloud with Jeannie.`,
        ar: `توقّع قصص ملكية وأساسيات الدور وسيناريوهات خاصة بـ ${nameAr}. تدرّب على قائمة الأسئلة في هذه الصفحة بصوت عالٍ مع جيني.`,
      },
    },
    {
      q: {
        en: `How do I prepare for a ${nameEn} interview?`,
        ar: `كيف أتأهب لمقابلة ${nameAr}؟`,
      },
      a: {
        en: `Research ${nameEn}'s market, prepare STAR stories, and run a mock with Jeannie using ${nameEn} as the company context.`,
        ar: `ابحث عن سوق ${nameAr}، حضّر قصص STAR، ونفّذ تدريباً مع جيني باستخدام ${nameAr} كسياق الشركة.`,
      },
    },
    {
      q: {
        en: `What salary should I expect for a ${roleEn} role at ${nameEn}?`,
        ar: `ما الراتب المتوقع لوظيفة ${roleAr} في ${nameAr}؟`,
      },
      a: {
        en: salaryEn,
        ar: salaryAr,
      },
    },
    {
      q: {
        en: `Are ${nameEn} interviews in Arabic or English?`,
        ar: `هل المقابلة بالعربية أم الإنجليزية في ${nameAr}؟`,
      },
      a: {
        en: `Many MENA panels mix both. Practice bilingual answers. Jeannie supports Arabic and English mocks with fair dialect scoring.`,
        ar: `كثير من اللجان في المنطقة تمزج اللغتين. تدرّب على إجابات ثنائية اللغة. جيني تدعم تدريباً بالعربية والإنجليزية مع تقييم عادل للهجات.`,
      },
    },
    {
      q: {
        en: `How many stages are in a ${nameEn} interview?`,
        ar: `كم مرحلة في مقابلة ${nameAr}؟`,
      },
      a: {
        en: `Typically 3–4 stages: recruiter screen, skills/case, behavioral, and hiring-manager final. Difficulty is often rated around ${company.difficulty}/5.`,
        ar: `عادة ٣–٤ مراحل: فحص موارد بشرية، مهارات/حالة، سلوكية، ثم نهائي مع المدير. تُقيَّم الصعوبة غالباً حوالي ${company.difficulty}/5.`,
      },
    },
  ];
}

export function roleGuideFaqs(role: GuideRole): Array<{ q: Bi; a: Bi }> {
  const nameEn = role.name.en;
  const nameAr = role.name.ar;
  return [
    {
      q: {
        en: `What are the most important questions in a ${nameEn} interview?`,
        ar: `ما هي أهم الأسئلة في مقابلة ${nameAr}؟`,
      },
      a: {
        en: `See the common questions on this page — fundamentals, ownership, and MENA scenarios.`,
        ar: `راجع الأسئلة الشائعة في هذه الصفحة — أساسيات وملكية وسيناريوهات المنطقة.`,
      },
    },
    {
      q: {
        en: `How do I prepare for a ${nameEn} interview?`,
        ar: `كيف أتأهب لمقابلة ${nameAr}؟`,
      },
      a: {
        en: 'Practice aloud with Jeannie, quantify outcomes, and prepare bilingual versions of your top stories.',
        ar: 'تدرّب بصوت عالٍ مع جيني، ورقّم النتائج، وحضّر نسخاً ثنائية اللغة لأهم قصصك.',
      },
    },
    {
      q: {
        en: `What salary should a ${nameEn} expect in MENA?`,
        ar: `ما الراتب المتوقع لوظيفة ${nameAr} في المنطقة؟`,
      },
      a: {
        en: role.salaryHint.en,
        ar: role.salaryHint.ar,
      },
    },
    {
      q: {
        en: `Are ${nameEn} interviews usually in Arabic or English?`,
        ar: `هل مقابلات ${nameAr} عادة بالعربية أم الإنجليزية؟`,
      },
      a: {
        en: 'Depends on employer and panel. Many Gulf tech interviews are English-first with Arabic rapport. Practice both.',
        ar: 'يعتمد على صاحب العمل واللجنة. كثير من مقابلات تقنية الخليج بالإنجليزية أولاً مع تواصل عربي. تدرّب على الاثنين.',
      },
    },
    {
      q: {
        en: `How many stages are typical for a ${nameEn} interview?`,
        ar: `كم مرحلة نموذجية في مقابلة ${nameAr}؟`,
      },
      a: {
        en: `Usually 3–4 rounds. Difficulty for this path is often around ${role.difficulty}/5.`,
        ar: `عادة ٣–٤ جولات. صعوبة هذا المسار غالباً حوالي ${role.difficulty}/5.`,
      },
    },
  ];
}

export const HOW_TO_ANSWER_GENERIC: Bi = {
  en: 'Lead with the situation, your action, and a measurable result. Then add what you would do next time. Keep answers under two minutes unless asked to go deeper.',
  ar: 'ابدأ بالموقف وفعلك ونتيجة قابلة للقياس. ثم أضف ما ستفعله في المرة القادمة. اجعل الإجابة أقل من دقيقتين ما لم يُطلب التعمق.',
};

export const SALARY_DISCLAIMER: Bi = {
  en: 'Ranges are indicative market guidance—not a guarantee. Always verify published pay on the employer posting.',
  ar: 'النطاقات إرشادية للسوق—وليست ضماناً. تحقّق دائماً من الراتب المعلن في إعلان صاحب العمل.',
};

export const NO_ACTIVE_JOBS: Bi = {
  en: 'No active jobs for this company right now. Browse similar guides or open roles on the jobs board.',
  ar: 'لا توجد وظائف نشطة لهذه الشركة الآن. تصفّح أدلة مشابهة أو الوظائف المفتوحة على لوحة الوظائف.',
};
