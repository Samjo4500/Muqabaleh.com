import type { Bi, GuideCompany, GuideRole } from './types';

/** Stable 0..n-1 bucket from slug (for content rotation). */
export function variantIndex(slug: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % mod;
}

export function companyAboutVariant(company: GuideCompany): Bi {
  const nameEn = company.name.en;
  const nameAr = company.name.ar;
  const indEn = company.industry.en;
  const indAr = company.industry.ar;
  const countryEn = company.country.en;
  const countryAr = company.country.ar;
  const i = variantIndex(company.slug, 3);

  const variants: Bi[] = [
    {
      en: `${nameEn} is one of the leading ${indEn} employers in the region. Candidates usually prepare for structured rounds that test ownership, collaboration, and comfort with MENA-scale markets.`,
      ar: `${nameAr} هي واحدة من الشركات الرائدة في ${indAr} في المنطقة. يستعد المرشحون عادة لجولات منظمة تختبر الملكية والتعاون والراحة مع أسواق المنطقة.`,
    },
    {
      en: `${nameEn} is among the standout names in ${indEn} across the Middle East. The company is known for pace and customer impact, with roles spanning multiple functions.`,
      ar: `تُعد ${nameAr} من أبرز أسماء قطاع ${indAr} في الشرق الأوسط. تشتهر الشركة بالسرعة وأثر العميل، وتقدم فرص عمل في مجالات متنوعة.`,
    },
    {
      en: `If you are considering ${nameEn}, you are targeting a major hiring brand in ${countryEn}. Interviews reward concrete examples over buzzwords.`,
      ar: `إذا كنت تفكر في الانضمام إلى ${nameAr}، فأنت تستهدف واحدة من أكبر جهات التوظيف في ${countryAr}. المقابلات تكافئ الأمثلة الملموسة لا الشعارات.`,
    },
  ];
  return variants[i]!;
}

export function roleAboutVariant(role: GuideRole): Bi {
  const nameEn = role.name.en;
  const nameAr = role.name.ar;
  const i = variantIndex(role.slug, 3);
  const variants: Bi[] = [
    {
      en: `${nameEn} interviews in MENA mix role fundamentals, behavioral ownership stories, and regional context. Expect follow-ups that dig into measurable impact.`,
      ar: `مقابلات ${nameAr} في المنطقة تمزج أساسيات الدور وقصص الملكية السلوكية وسياق المنطقة. توقّع أسئلة متابعة تتعمق في أثر قابل للقياس.`,
    },
    {
      en: `Hiring managers looking for a ${nameEn} want clarity under pressure. Strong candidates show judgment, collaboration, and how they learn fast.`,
      ar: `مديرو التوظيف الباحثون عن ${nameAr} يريدون وضوحاً تحت الضغط. المرشحون الأقوياء يظهرون الحكم والتعاون وسرعة التعلّم.`,
    },
    {
      en: `A ${nameEn} interview is your chance to prove craft and communication. Practice bilingual answers if you expect mixed Arabic/English panels.`,
      ar: `مقابلة ${nameAr} فرصتك لإثبات الحرفة والتواصل. تدرّب على إجابات ثنائية اللغة إن توقعت لجاناً عربية/إنجليزية مختلطة.`,
    },
  ];
  return variants[i]!;
}

export function interviewProcessVariant(subject: string, slug: string, locale: string): string[] {
  const i = variantIndex(slug, 3);
  if (locale === 'en') {
    const sets = [
      [
        `Recruiter screen — motives, logistics, and fit for ${subject}.`,
        'Skills / case assessment — role depth and problem framing.',
        'Behavioral interview — ownership, conflict, and collaboration.',
        'Hiring manager final — level, team match, and offer expectations.',
      ],
      [
        `Application review and shortlist for ${subject}.`,
        'First conversation — role scope and must-have skills.',
        'Deep dive — technical or functional scenarios with follow-ups.',
        'Culture / panel round — values, stakeholders, and next steps.',
      ],
      [
        `HR introduction covering ${subject} basics and timeline.`,
        'Manager interview — day-to-day ownership examples.',
        'Cross-functional round — collaboration under ambiguity.',
        'Final calibration — compensation band and start-date logistics.',
      ],
    ];
    return sets[i]!;
  }
  const sets = [
    [
      `مقابلة موارد بشرية — الدوافع واللوجستيات والملاءمة لـ ${subject}.`,
      'تقييم مهارات / حالة عملية — عمق الدور وصياغة المشكلة.',
      'مقابلة سلوكية — الملكية والصراع والتعاون.',
      'نهائي مع مدير التوظيف — المستوى وملاءمة الفريق وتوقعات العرض.',
    ],
    [
      `مراجعة الطلب والترشيح لـ ${subject}.`,
      'أول محادثة — نطاق الدور والمهارات الأساسية.',
      'تعمّق — سيناريوهات تقنية أو وظيفية مع أسئلة متابعة.',
      'جولة ثقافة / لجنة — القيم وأصحاب المصلحة والخطوات التالية.',
    ],
    [
      `تعريف موارد بشرية بأساسيات ${subject} والجدول الزمني.`,
      'مقابلة المدير — أمثلة ملكية يومية.',
      'جولة متعددة التخصصات — التعاون تحت الغموض.',
      'معايرة نهائية — نطاق التعويض وموعد البدء.',
    ],
  ];
  return sets[i]!;
}

export function howToAnswerVariant(slug: string, extra?: Bi): Bi {
  const i = variantIndex(slug, 3);
  const bases: Bi[] = [
    {
      en: 'Lead with the situation, your action, and a measurable result. Then add what you would do next time. Keep answers under two minutes unless asked to go deeper.',
      ar: 'ابدأ بالموقف وفعلك ونتيجة قابلة للقياس. ثم أضف ما ستفعله لاحقاً. اجعل الإجابة أقل من دقيقتين ما لم يُطلب التعمق.',
    },
    {
      en: 'Use STAR, but end with a business outcome. Name the metric, the constraint, and your decision. Avoid vague “we” stories without your role.',
      ar: 'استخدم STAR، لكن اختم بنتيجة عمل. اذكر المقياس والقيد وقرارك. تجنّب قصص «نحن» العامة دون دورك.',
    },
    {
      en: 'State assumptions early, then walk through options and trade-offs. Interviewers in MENA often reward calm structure more than speed alone.',
      ar: 'اذكر الافتراضات مبكراً، ثم اعرض الخيارات والمفاضلات. المقابلون في المنطقة يكافئون الهيكل الهادئ أكثر من السرعة وحدها.',
    },
  ];
  const base = bases[i]!;
  if (!extra) return base;
  return {
    en: `${base.en} ${extra.en}`,
    ar: `${base.ar} ${extra.ar}`,
  };
}

export function cultureTipsVariant(slug: string, fallback: Bi): Bi {
  const i = variantIndex(slug, 3);
  const variants: Bi[] = [
    fallback,
    {
      en: 'Dress one notch more formal than the company photos suggest. Arrive early, bring bilingual examples, and show respect for local workplace norms.',
      ar: 'ارتدِ درجة أكثر رسمية مما توحي صور الشركة. احضر مبكراً، وأحضر أمثلة ثنائية اللغة، وأظهر احتراماً لمعايير مكان العمل المحلية.',
    },
    {
      en: 'Smart professional attire works for most tech interviews; banks and energy prefer formal. Greeting etiquette and punctuality still matter.',
      ar: 'اللباس المهني الأنيق يناسب معظم مقابلات التقنية؛ البنوك والطاقة تفضّل الرسمي. آداب التحية والالتزام بالوقت ما زالا مهمين.',
    },
  ];
  return variants[i]!;
}

const TRAITS: Bi[] = [
  { en: 'innovation', ar: 'الابتكار' },
  { en: 'customer focus', ar: 'التركيز على العميل' },
  { en: 'operational scale', ar: 'الحجم التشغيلي' },
];

export function companyHookVariant(company: GuideCompany): Bi {
  const i = variantIndex(company.slug, 3);
  const trait = TRAITS[i]!;
  return {
    en: `Prepare stories that prove ${trait.en} — that is what ${company.name.en} interviewers usually probe.`,
    ar: `حضّر قصصاً تثبت ${trait.ar} — هذا ما يختبره مقابلون في ${company.name.ar} عادة.`,
  };
}
