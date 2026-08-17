import type { Bi } from '@/components/landing/crystal/copy';

export const HOW_SCORES_PATH = '/how-scores-work';

export const HOW_SCORES = {
  kicker: { en: 'Trust & scoring', ar: 'الثقة والتقييم' } as Bi,
  title: { en: 'How Muqabaleh Scores Work', ar: 'كيف تعمل درجات مقابلة' } as Bi,
  lead: {
    en: 'A Muqabaleh Passport is a candidate-controlled interview-readiness record. It helps you practise, improve, and — if you choose — share a clear signal. It is not a hiring decision.',
    ar: 'جواز مقابلة سجل جاهزية للمقابلة تحت سيطرة المرشّح. يساعدك على التدرّب والتحسين — وإن اخترت — مشاركة إشارة واضحة. وهو ليس قرار توظيف.',
  } as Bi,
  principles: [
    {
      title: { en: 'You control the Passport', ar: 'الجواز تحت سيطرتك' },
      body: {
        en: 'The Passport is your interview-readiness record from Jeannie practice. You decide whether anyone else sees it.',
        ar: 'الجواز سجل جاهزيتك للمقابلة من تدرّبك مع جيني. أنت تقرر إن كان أحد غيرك سيراه.',
      },
    },
    {
      title: { en: 'Private by default', ar: 'خاص افتراضياً' },
      body: {
        en: 'Scores, feedback, and the Passport stay private until you publish or share them. Practice first; share only when you are ready.',
        ar: 'الدرجات والملاحظات والجواز تبقى خاصة حتى تنشرها أو تشاركها. تدرّب أولاً؛ وشارك فقط عندما تكون جاهزاً.',
      },
    },
    {
      title: { en: 'A methodology score — not a verdict', ar: 'درجة وفق منهجية — ليست حكماً' },
      body: {
        en: 'The number reflects the interview-practice methodology and the score version in effect for that session. Versions can evolve as the product improves.',
        ar: 'يعكس الرقم منهجية التدرّب على المقابلة وإصدار التقييم المعمول به في تلك الجلسة. قد تتطور الإصدارات مع تحسين المنتج.',
      },
    },
    {
      title: { en: 'You always apply yourself', ar: 'أنت من يقدّم دائماً' },
      body: {
        en: 'Muqabaleh never submits applications for you. Practice here, then apply on the employer’s own site.',
        ar: 'مقابلة لا تقدّم نيابةً عنك. تدرّب هنا، ثم قدّم على موقع صاحب العمل.',
      },
    },
  ],
  notTitle: { en: 'What a score is not', ar: 'ما ليست عليه الدرجة' } as Bi,
  notItems: [
    {
      en: 'Not a hiring guarantee — a strong score does not mean an offer.',
      ar: 'ليست ضمان توظيف — الدرجة القوية لا تعني عرض عمل.',
    },
    {
      en: 'Not a complete measure of professional competence, character, or potential.',
      ar: 'ليست مقياساً كاملاً للكفاءة المهنية أو الشخصية أو الإمكانات.',
    },
    {
      en: 'Not an automatic employment-eligibility decision.',
      ar: 'ليست قرار أهلية للتوظيف يُتَّخذ تلقائياً.',
    },
    {
      en: 'Not a replacement for an employer’s lawful hiring process or human judgement.',
      ar: 'ليست بديلاً عن عملية التوظيف القانونية لدى صاحب العمل أو عن الحكم البشري.',
    },
  ],
  employersTitle: { en: 'For hiring teams', ar: 'لفرق التوظيف' } as Bi,
  employersBody: {
    en: 'Treat a shared Passport as one contextual signal among many. Use it to structure conversations — not to exclude people automatically. Combine it with interviews, work samples, and your own criteria, and follow applicable employment law.',
    ar: 'تعامل مع الجواز المُشارَك كإشارة سياقية واحدة ضمن إشارات كثيرة. استخدمه لتنظيم الحوار — لا لاستبعاد الناس تلقائياً. ادمجه مع المقابلات وعيّنات العمل ومعاييرك، والتزم بقوانين العمل المعمول بها.',
  } as Bi,
  dataTitle: { en: 'What others can see', ar: 'ماذا يمكن للآخرين رؤيته' } as Bi,
  dataBody: {
    en: 'Raw audio, transcripts, private coach feedback, and individual practice data are not shown to third parties unless you give explicit product consent or a permission you control. A published Passport shows only the readiness record you chose to share.',
    ar: 'الصوت الخام والنصوص والملاحظات الخاصة وبيانات التدرّب الفردية لا تُعرض لأطراف ثالثة إلا بموافقة صريحة في المنتج أو صلاحية تتحكم بها أنت. الجواز المنشور يعرض فقط سجل الجاهزية الذي اخترت مشاركته.',
  } as Bi,
  faqTitle: { en: 'Quick answers', ar: 'إجابات سريعة' } as Bi,
  faqs: [
    {
      q: {
        en: 'Is my score public after I practise?',
        ar: 'هل تصبح درجتي عامة بعد التدرّب؟',
      },
      a: {
        en: 'No. The Passport is private by default. You choose whether to publish or share it.',
        ar: 'لا. الجواز خاص افتراضياً. أنت تختار نشره أو مشاركته.',
      },
    },
    {
      q: {
        en: 'Can employers listen to my interview?',
        ar: 'هل يمكن لأصحاب العمل الاستماع إلى مقابلتي؟',
      },
      a: {
        en: 'Not unless product consent and permissions explicitly allow it. Private audio, transcripts, and coach notes stay with you by default.',
        ar: 'لا، إلا إذا سمحت موافقة المنتج والصلاحيات بذلك صراحة. الصوت والنصوص وملاحظات المدربة تبقى خاصة بك افتراضياً.',
      },
    },
    {
      q: {
        en: 'Should a company hire from the score alone?',
        ar: 'هل ينبغي للشركة التوظيف بناءً على الدرجة وحدها؟',
      },
      a: {
        en: 'No. The score is a readiness signal from a practice methodology. It should sit alongside human judgement and a lawful hiring process.',
        ar: 'لا. الدرجة إشارة جاهزية من منهجية تدرّب. ينبغي أن تُقرأ مع الحكم البشري وعملية توظيف قانونية.',
      },
    },
  ],
  privacy: { en: 'Privacy', ar: 'الخصوصية' } as Bi,
  terms: { en: 'Terms', ar: 'الشروط' } as Bi,
  cta: { en: 'Start free practice', ar: 'ابدأ تدريباً مجانياً' } as Bi,
  ctaHint: {
    en: 'No card required. Start in minutes.',
    ar: 'لا حاجة لبطاقة. ابدأ خلال دقائق.',
  } as Bi,
};
