import type { Bi, GuideCompany, GuideRole } from './types';

export function bi(locale: string, value: Bi): string {
  return locale === 'en' ? value.en : value.ar;
}

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

export function companyGuideFaqs(company: GuideCompany): Array<{ q: Bi; a: Bi }> {
  const nameEn = company.name.en;
  const nameAr = company.name.ar;
  return [
    {
      q: {
        en: `How hard is a ${nameEn} interview?`,
        ar: `ما مدى صعوبة مقابلة ${nameAr}؟`,
      },
      a: {
        en: `Most candidates rate ${nameEn} around ${company.difficulty}/5. Expect structured rounds and concrete examples—not only polished buzzwords.`,
        ar: `معظم المرشحين يقيّمون ${nameAr} حوالي ${company.difficulty}/5. توقّع جولات منظمة وأمثلة ملموسة—لا شعارات فقط.`,
      },
    },
    {
      q: {
        en: `How should I practice for ${nameEn}?`,
        ar: `كيف أتدرّب لمقابلة ${nameAr}؟`,
      },
      a: {
        en: `Practice aloud with Jeannie using ${nameEn} as the company context, then review STAR stories for ownership and impact.`,
        ar: `تدرّب بصوت عالٍ مع جيني باستخدام ${nameAr} كسياق الشركة، ثم راجع قصص STAR للملكية والأثر.`,
      },
    },
    {
      q: {
        en: `Does Muqabaleh apply to ${nameEn} for me?`,
        ar: `هل تقدّم مقابلة إلى ${nameAr} نيابةً عني؟`,
      },
      a: {
        en: 'No. Muqabaleh helps you prepare and practice. You always apply yourself on the employer site.',
        ar: 'لا. مقابلة تساعدك على التحضير والتدريب. أنت تقدّم بنفسك دائماً على موقع صاحب العمل.',
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
        en: `What are the most common ${nameEn} interview questions?`,
        ar: `ما أكثر أسئلة مقابلة ${nameAr} شيوعاً؟`,
      },
      a: {
        en: `Expect a mix of role fundamentals, behavioral ownership stories, and MENA-context scenarios. See the question list on this page.`,
        ar: `توقّع مزيجاً من أساسيات الدور وقصص الملكية السلوكية وسيناريوهات سياق المنطقة. راجع قائمة الأسئلة في هذه الصفحة.`,
      },
    },
    {
      q: {
        en: `How do I prepare for a ${nameEn} interview in Arabic or English?`,
        ar: `كيف أتحضّر لمقابلة ${nameAr} بالعربية أو الإنجليزية؟`,
      },
      a: {
        en: 'Practice the same stories in both languages. Jeannie supports Arabic and English mock interviews with instant scoring.',
        ar: 'تدرّب على نفس القصص باللغتين. جيني تدعم مقابلات تجريبية بالعربية والإنجليزية مع تقييم فوري.',
      },
    },
    {
      q: {
        en: `What salary should a ${nameEn} expect in MENA?`,
        ar: `ما الراتب المتوقع لـ ${nameAr} في الشرق الأوسط؟`,
      },
      a: {
        en: role.salaryHint.en,
        ar: role.salaryHint.ar,
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
