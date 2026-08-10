/** Muqabaleh landing copy — professional Arabic, not literal calques. */

export type Bi = { en: string; ar: string };

export const C = {
  brand: { en: 'Muqabaleh', ar: 'مقابلة' } as Bi,
  nav: {
    services: { en: 'Services', ar: 'الخدمات' },
    howItWorks: { en: 'How Jeannie works', ar: 'كيف تعمل جيني' },
    jeannie: { en: 'Jeannie', ar: 'جيني' },
    forCompanies: { en: 'For companies', ar: 'للشركات' },
    pricing: { en: 'Pricing', ar: 'الأسعار' },
    partners: { en: 'Partners', ar: 'الشركاء' },
    blog: { en: 'Blog', ar: 'المدونة' },
    faq: { en: 'FAQ', ar: 'الأسئلة' },
    login: { en: 'Log in', ar: 'تسجيل الدخول' },
    getStarted: { en: 'Get started', ar: 'ابدأ الآن' },
  },
  hero: {
    eyebrow: { en: 'Jeannie · Muqabaleh', ar: 'جيني · مقابلة' },
    headline: {
      en: 'Train with Jeannie. Walk into the interview ready.',
      ar: 'تدرّب مع جيني. ادخل المقابلة وأنت جاهز.',
    },
    sub: {
      en: 'Train in Arabic or English, get a verified score, and apply to any job with confidence.',
      ar: 'تدرّب بالعربية أو الإنجليزية، احصل على درجة موثّقة، وقدّم بثقة لأي وظيفة.',
    },
    dialectNote: {
      en: 'Jeannie understands and fairly scores Arabic regional dialects (Gulf, Levantine, Egyptian), professional English with local accents, and natural bilingual code-switching — accent is not a penalty.',
      ar: 'جيني تفهم اللهجات العربية الإقليمية (خليجية، شامية، مصرية) والإنجليزية المهنية بلهجات محلية والتبديل الطبيعي بين اللغتين — وتقيّمك بعدل دون معاقبة اللهجة.',
    },
    privacyNote: {
      en: 'Your interview scores stay private until you choose to publish or share your passport. Practice and retake anytime to improve before locking a public score.',
      ar: 'درجات مقابلتك تبقى خاصة حتى تختار نشر جوازك أو مشاركته. تدرّب وأعد المقابلة في أي وقت لتحسين نتيجتك قبل تثبيت درجة عامة.',
    },
    ctaInterview: { en: 'Start free practice', ar: 'ابدأ تدريباً مجانياً' },
    ctaJeannie: { en: 'Browse jobs', ar: 'تصفّح الوظائف' },
    ctaHr: { en: "I'm hiring", ar: 'أنا أوظّف' },
  },
  path: {
    eyebrow: { en: 'Simple path', ar: 'مسار بسيط' },
    title: { en: 'Three steps. Jeannie in the middle.', ar: 'ثلاث خطوات. جيني في الوسط.' },
    sub: {
      en: 'No auto-apply. No spam. Practice, verify, then you apply.',
      ar: 'بلا تقديم تلقائي. بلا عشوائية. تدرّب، وثّق، ثم قدّم أنت.',
    },
    ctaJobs: { en: 'Browse jobs', ar: 'تصفّح الوظائف' },
    steps: [
      {
        title: { en: 'Practice with Jeannie', ar: 'تدرّب مع جيني' },
        body: {
          en: 'Company-specific or general mocks in Arabic or English. Dialects welcome.',
          ar: 'مقابلات خاصة بشركات أو عامة بالعربية أو الإنجليزية. اللهجات مرحّب بها.',
        },
      },
      {
        title: { en: 'Get your passport', ar: 'احصل على جوازك' },
        body: {
          en: 'A verified score you can share — private until you decide to publish.',
          ar: 'درجة موثّقة يمكنك مشاركتها — خاصة حتى تقرر النشر.',
        },
      },
      {
        title: { en: 'Apply yourself', ar: 'قدّم بنفسك' },
        body: {
          en: 'Open the company site from our jobs board. You always send the application.',
          ar: 'افتح موقع الشركة من لوحة وظائفنا. أنت ترسل التقديم دائماً.',
        },
      },
    ],
  },
  passport: {
    eyebrow: { en: 'Your passport', ar: 'جوازك' },
    title: { en: 'Proof employers can trust', ar: 'دليل يثق به أصحاب العمل' },
    sub: {
      en: 'Not a gimmick score — a clear, verifiable readiness credential from your Jeannie interview.',
      ar: 'ليست درجة شكلية — اعتماد جاهزية واضح وقابل للتحقق من مقابلتك مع جيني.',
    },
    cta: { en: 'Earn your passport free', ar: 'احصل على جوازك مجاناً' },
    bullets: [
      { en: '0–100 interview-verified score', ar: 'درجة ٠–١٠٠ موثّقة بالمقابلة' },
      { en: 'Clarity, confidence, structure, bilingual signal', ar: 'وضوح، ثقة، هيكل، إشارة ثنائية اللغة' },
      { en: 'Public verify link + QR when you choose to share', ar: 'رابط تحقق عام + QR عندما تختار المشاركة' },
    ],
  },
  trust: {
    text: {
      en: 'Built for candidates and hiring teams across MENA',
      ar: 'مصمّمة للمرشحين وفرق التوظيف في الشرق الأوسط وشمال أفريقيا',
    },
  },
  services: {
    title: { en: 'Jeannie, end to end', ar: 'جيني من البداية للنهاية' },
    subtitle: {
      en: 'One agent. Interview, passport, apply — Arabic and English. Dialects and accents welcome; scores stay private until you share.',
      ar: 'وكيلة واحدة. مقابلة، جواز، تقديم — بالعربية والإنجليزية. اللهجات مرحّب بها؛ الدرجات خاصة حتى تشارك.',
    },
    cards: [
      {
        title: { en: 'Jeannie interviews you', ar: 'جيني تُجري مقابلتك' },
        body: {
          en: 'Practice with Jeannie in Arabic or English. Dialects and accents welcome. Real-time dialogue, instant notes, and a full scorecard — private until you share.',
          ar: 'تدرّب مع جيني بالعربية أو الإنجليزية. اللهجات مرحّب بها. حوار فوري، ملاحظات مباشرة، وتقرير تقييم كامل — خاص حتى تشارك.',
        },
        features: [
          { en: 'Dialects welcome', ar: 'اللهجات مرحّب بها' },
          { en: 'Real-time dialogue', ar: 'حوار فوري' },
          { en: 'Private until you share', ar: 'خاص حتى تشارك' },
        ],
        cta: { en: 'Practice with Jeannie', ar: 'تدرّب مع جيني' },
        href: '/interview/prequal',
      },
      {
        title: { en: 'She builds your passport', ar: 'تبني جوازك' },
        body: {
          en: 'Your score becomes a shareable, verifiable hire-ready passport — proof employers can trust.',
          ar: 'تتحول نتيجتك إلى جواز جاهزية قابل للمشاركة والتحقق — دليل يثق به أصحاب العمل.',
        },
        features: [
          { en: 'Verified score', ar: 'نتيجة موثّقة' },
          { en: 'Public verify link', ar: 'رابط تحقق عام' },
          { en: 'Share anywhere', ar: 'شارك في أي مكان' },
        ],
        cta: { en: 'View passport', ar: 'عرض الجواز' },
        href: '/app/passport',
      },
      {
        title: { en: 'You apply with confidence', ar: 'تقدّم بثقة' },
        body: {
          en: 'Browse roles, practice for the company, then apply yourself on their site — passport ready to share.',
          ar: 'تصفّح الأدوار، تدرّب للشركة، ثم قدّم بنفسك على موقعها — وجوازك جاهز للمشاركة.',
        },
        features: [
          { en: 'Apply on company site', ar: 'قدّم على موقع الشركة' },
          { en: 'Passport ready to share', ar: 'جواز جاهز للمشاركة' },
          { en: 'Manual tracker', ar: 'متتبّع يدوي' },
        ],
        cta: { en: 'Browse jobs', ar: 'تصفّح الوظائف' },
        href: '/jobs',
      },
    ],
  },
  how: {
    // Kept for legacy references; landing now uses Prepare-and-Verify path.
    eyebrow: { en: 'How Jeannie works', ar: 'كيف تعمل جيني' },
    title: { en: 'Prepare. Verify. Apply yourself.', ar: 'تجهيز. توثيق. تقديم بنفسك.' },
    subtitle: {
      en: 'Jeannie interviews you, builds your passport, and helps you prep — you always apply on the company site.',
      ar: 'جيني تُجري مقابلتك، تبني جوازك، وتساعدك على التحضير — وأنت تقدّم دائماً على موقع الشركة.',
    },
    ctaInterview: { en: 'Practice with Jeannie', ar: 'تدرّب مع جيني' },
    ctaJeannie: { en: 'See the live sample', ar: 'شاهِد المحاكاة الحية' },
    steps: [
      {
        scene: 'interview' as const,
        title: { en: 'Jeannie interviews you', ar: 'جيني تُجري مقابلتك' },
        desc: {
          en: 'Arabic or English. Timed questions with instant feedback.',
          ar: 'عربية أو إنجليزية. أسئلة موقوتة مع ملاحظات فورية.',
        },
      },
      {
        scene: 'passport' as const,
        title: { en: 'She earns your passport', ar: 'تكسب لك جوازك' },
        desc: {
          en: 'Your score becomes a shareable, verifiable hire-ready passport.',
          ar: 'تتحول نتيجتك إلى جواز جاهزية قابل للمشاركة والتحقق.',
        },
      },
      {
        scene: 'jeannie' as const,
        title: { en: 'Browse real roles', ar: 'تصفّح أدواراً حقيقية' },
        desc: {
          en: 'Employer-posted and legal public ATS listings — practice for the ones you want.',
          ar: 'إعلانات أصحاب العمل وواجهات ATS العامة القانونية — تدرّب لما تريده.',
        },
      },
      {
        scene: 'apply' as const,
        title: { en: 'You apply yourself', ar: 'أنت تقدّم بنفسك' },
        desc: {
          en: 'Click “Apply on company site.” Muqabaleh never applies for you.',
          ar: 'اضغط «قدّم على موقع الشركة». مقابلة لا تقدّم نيابةً عنك.',
        },
      },
    ],
  },
  jeannie: {
    eyebrow: { en: 'One coach. Clear path.', ar: 'مدربة واحدة. مسار واضح.' },
    name: { en: 'Jeannie', ar: 'جيني' },
    title: {
      en: 'Meet Jeannie — interviewer and career coach',
      ar: 'تعرّف على جيني — المقابِلة والمدربة المهنية',
    },
    body: {
      en: 'She interviews you in Arabic or English, turns your score into a Muqabaleh passport, and helps you prep materials — then you apply yourself on the employer’s site.',
      ar: 'تُجري مقابلتك بالعربية أو الإنجليزية، تحوّل نتيجتك إلى جواز مقابلة، وتساعدك على تجهيز موادك — ثم تقدّم بنفسك على موقع صاحب العمل.',
    },
    offers: [
      {
        key: 'interview',
        title: { en: 'Interviews you', ar: 'تُجري مقابلتك' },
        desc: {
          en: 'Bilingual practice with instant scoring — Arabic and English.',
          ar: 'تدريب ثنائي اللغة مع تقييم فوري — عربية وإنجليزية.',
        },
      },
      {
        key: 'passport',
        title: { en: 'Builds your passport', ar: 'تبني جوازك' },
        desc: {
          en: 'Verified hire-ready proof employers can check.',
          ar: 'دليل جاهزية موثّق يمكن لأصحاب العمل التحقق منه.',
        },
      },
      {
        key: 'shortlist',
        title: { en: 'Company-specific mocks', ar: 'مقابلات خاصة بالشركة' },
        desc: {
          en: 'Practice for a listed role before you click apply on their site.',
          ar: 'تدرّب لدور معلن قبل أن تضغط تقديم على موقعهم.',
        },
      },
      {
        key: 'approve',
        title: { en: 'Career prep tools', ar: 'أدوات تحضير مهني' },
        desc: {
          en: 'Cover letters, salary context, and a personal tracker — you send everything.',
          ar: 'خطابات، سياق رواتب، ومتتبّع شخصي — وأنت ترسل كل شيء.',
        },
      },
      {
        key: 'apply',
        title: { en: 'You apply with proof', ar: 'أنت تقدّم بالدليل' },
        desc: {
          en: 'Take your passport to the company site and submit yourself.',
          ar: 'خذ جوازك إلى موقع الشركة وقدّم بنفسك.',
        },
      },
    ],
    cta: { en: 'Practice with Jeannie — free', ar: 'تدرّب مع جيني — مجاناً' },
    ctaSecondary: { en: 'Request demo', ar: 'اطلب عرضاً' },
  },
  jeannieMagic: {
    eyebrow: { en: "Sample of Jeannie's magic", ar: 'عيّنة من سحر جيني' },
    title: { en: 'See how Jeannie works', ar: 'شاهِد كيف تعمل جيني' },
    body: {
      en: 'Live sample: she interviews you, builds your passport, helps you prep for a role — then you apply on the company site.',
      ar: 'محاكاة حية: تُجري مقابلتك، تبني جوازك، تساعدك على التحضير لدور — ثم تقدّم على موقع الشركة.',
    },
    steps: [
      {
        title: { en: 'Interviews you', ar: 'تُجري مقابلتك' },
        desc: {
          en: 'Arabic or English practice with instant scoring.',
          ar: 'تدريب بالعربية أو الإنجليزية مع تقييم فوري.',
        },
      },
      {
        title: { en: 'Builds your passport', ar: 'تبني جوازك' },
        desc: {
          en: 'Turns your score into verified hire-ready proof.',
          ar: 'تحوّل نتيجتك إلى دليل جاهزية موثّق.',
        },
      },
      {
        title: { en: 'Company mock', ar: 'مقابلة خاصة بالشركة' },
        desc: {
          en: 'Practice for a real listing with role-aware feedback.',
          ar: 'تدرّب لإعلان حقيقي مع ملاحظات تراعي الدور.',
        },
      },
      {
        title: { en: 'You stay in control', ar: 'القرار بيدك' },
        desc: {
          en: 'Muqabaleh never applies for you. YOU APPLY.',
          ar: 'مقابلة لا تقدّم نيابةً عنك. أنت تقدّم.',
        },
      },
      {
        title: { en: 'Apply on company site', ar: 'قدّم على موقع الشركة' },
        desc: {
          en: 'Take your passport and submit yourself.',
          ar: 'خذ جوازك وقدّم بنفسك.',
        },
      },
    ],
    cta: { en: 'Request demo', ar: 'اطلب عرضاً' },
    ctaSecondary: { en: 'Get a quote', ar: 'احصل على عرض سعر' },
  },
  companies: {
    headline: { en: 'Hire with verified passports', ar: 'وظّف بجوازات موثّقة' },
    body: {
      en: 'Screen candidates with AI interviews and shareable passport proof. Muqabaleh is a screening desk — not a job board that applies for people.',
      ar: 'افرز المرشحين بمقابلات ذكية وجواز قابل للمشاركة. مقابلة مكتب فرز — وليست لوحة وظائف تقدّم عن أحد.',
    },
    bullets: [
      { en: 'Cut first-round time with scored shortlists', ar: 'اختصر الجولة الأولى بقوائم مقيّمة' },
      { en: 'Consistent AI scoring', ar: 'تقييم ذكي موحّد' },
      { en: 'Invite by link — review passports', ar: 'ادعُ برابط — وراجع الجوازات' },
      { en: 'Real-time hiring analytics', ar: 'تحليلات توظيف فورية' },
    ],
    cta: { en: 'Talk to sales', ar: 'تحدث إلى المبيعات' },
  },
  pricing: {
    title: { en: 'Prepare. Get verified. Apply yourself.', ar: 'تدرّب. احصل على توثيق. قدّم بنفسك.' },
    subtitle: {
      en: 'Mock interviews, verified passports, and career prep — you always apply on the company site.',
      ar: 'مقابلات تجريبية، جوازات موثّقة، وتحضير مهني — وأنت تقدّم دائماً على موقع الشركة.',
    },
    priceHidden: {
      en: 'Custom pricing',
      ar: 'تسعير مخصّص',
    },
    priceHint: {
      en: 'Tell us your goals — we’ll tailor access.',
      ar: 'أخبرنا بأهدافك — نجهّز لك الوصول المناسب.',
    },
    ctaDemo: { en: 'Request demo', ar: 'اطلب عرضاً' },
    ctaQuote: { en: 'Get a quote', ar: 'احصل على عرض سعر' },
    notSpam: {
      badge: { en: 'YOU APPLY', ar: 'أنت تقدّم' },
      line: {
        en: 'Muqabaleh never applies on your behalf. Practice, verify, then apply yourself on the employer’s site.',
        ar: 'مقابلة لا تقدّم نيابةً عنك. تدرّب، وثّق، ثم قدّم بنفسك على موقع صاحب العمل.',
      },
    },
    applyHow: {
      title: { en: 'How Prepare-and-Verify works', ar: 'كيف يعمل التجهيز والتوثيق' },
      body: {
        en: 'Browse roles, practice a company-specific mock with Jeannie, earn a verified passport, then click “Apply on Company Site.” Cover letters and trackers help you prepare — you send everything yourself.',
        ar: 'تصفّح الأدوار، تدرّب مقابلة خاصة بالشركة مع جيني، احصل على جواز موثّق، ثم اضغط «قدّم على موقع الشركة». الخطابات والمتتبّع يساعدانك على التحضير — وأنت ترسل كل شيء بنفسك.',
      },
      steps: [
        {
          en: 'Practice role-specific mocks with Jeannie',
          ar: 'تدرّب مقابلات خاصة بالدور مع جيني',
        },
        {
          en: 'Lock a verified, shareable passport',
          ar: 'ثبّت جوازاً موثّقاً قابلاً للمشاركة',
        },
        {
          en: 'Apply yourself on the company site',
          ar: 'قدّم بنفسك على موقع الشركة',
        },
      ],
    },
    compareTitle: { en: 'Compare plans', ar: 'قارن الخطط' },
    plans: [
      {
        id: 'free' as const,
        name: { en: 'Basic', ar: 'أساسي' },
        price: { en: 'FREE', ar: 'مجاني' },
        period: { en: '', ar: '' },
        tagline: {
          en: 'Start practicing. Preview your passport.',
          ar: 'ابدأ التدريب. عاين جوازك.',
        },
        applies: { en: '1 mock / mo', ar: 'مقابلة واحدة / شهر' },
        features: [
          { en: '1 mock interview / month', ar: 'مقابلة تجريبية واحدة / شهر' },
          { en: 'Basic score preview', ar: 'معاينة درجة أساسية' },
          { en: 'Basic passport preview', ar: 'معاينة جواز أساسية' },
          { en: 'Browse jobs', ar: 'تصفّح الوظائف' },
        ],
        cta: { en: 'Start free', ar: 'ابدأ مجاناً' },
        href: '/interview/prequal',
        popular: false,
        concealPrice: false,
      },
      {
        id: 'jeannie' as const,
        name: { en: 'Jeannie', ar: 'جيني' },
        price: { en: '$14.99', ar: '$14.99' },
        period: { en: '/mo', ar: '/شهر' },
        tagline: {
          en: 'Unlimited mocks. Full passport. Prep tools.',
          ar: 'مقابلات بلا حدود. جواز كامل. أدوات تحضير.',
        },
        applies: { en: 'Unlimited mocks', ar: 'مقابلات بلا حدود' },
        features: [
          { en: 'Unlimited mock interviews', ar: 'مقابلات تجريبية بلا حدود' },
          { en: 'Full verified passport', ar: 'جواز موثّق كامل' },
          { en: 'Manual application tracker', ar: 'متتبّع تقديمات يدوي' },
          { en: 'Cover letter generator', ar: 'مولّد خطاب التقديم' },
          { en: 'Salary benchmark access', ar: 'الوصول لمؤشرات الرواتب' },
        ],
        cta: { en: 'Unlock Jeannie', ar: 'فعّل جيني' },
        href: '/app/packages',
        popular: true,
        concealPrice: false,
      },
      {
        id: 'pro' as const,
        name: { en: 'Jeannie Pro', ar: 'جيني برو' },
        price: { en: '$29.99', ar: '$29.99' },
        period: { en: '/mo', ar: '/شهر' },
        tagline: {
          en: 'CV studio, negotiation scripts, priority ranking.',
          ar: 'استوديو سيرة، سكربتات تفاوض، ترتيب أولوية.',
        },
        applies: { en: 'Pro prep suite', ar: 'حزمة تحضير برو' },
        features: [
          { en: 'Everything in Jeannie', ar: 'كل مزايا جيني' },
          { en: 'Full CV studio', ar: 'استوديو سيرة كامل' },
          { en: 'AI negotiation scripts', ar: 'سكربتات تفاوض بالذكاء الاصطناعي' },
          { en: 'Priority ranking in employer search', ar: 'ترتيب أولوية في بحث أصحاب العمل' },
          { en: '“Top 10%” badge', ar: 'شارة «أعلى ١٠٪»' },
        ],
        cta: { en: 'Go Jeannie Pro', ar: 'اشترك في جيني برو' },
        href: '/app/packages',
        popular: false,
        concealPrice: false,
      },
      {
        id: 'mastery' as const,
        name: { en: 'Mastery Pack', ar: 'باقة الإتقان' },
        price: { en: '$44.99', ar: '$44.99' },
        period: { en: ' once', ar: ' مرة واحدة' },
        tagline: {
          en: '5 company-specific mocks + negotiation pack. No subscription.',
          ar: '٥ مقابلات خاصة بشركات + باقة تفاوض. بلا اشتراك.',
        },
        applies: { en: 'One-time pack', ar: 'باقة لمرة واحدة' },
        features: [
          { en: '5 company-specific mock interviews', ar: '٥ مقابلات تجريبية خاصة بشركات' },
          { en: 'Negotiation script pack', ar: 'باقة سكربتات التفاوض' },
          { en: 'No monthly subscription', ar: 'بلا اشتراك شهري' },
          { en: 'Keep your free Basic practice too', ar: 'تحتفظ بتدريب الأساسي المجاني' },
        ],
        cta: { en: 'Get Mastery Pack', ar: 'احصل على باقة الإتقان' },
        href: '/app/packages',
        popular: false,
        concealPrice: false,
      },
    ],
    compare: [
      {
        label: { en: 'AI mock interviews', ar: 'مقابلات تجريبية ذكية' },
        values: [
          { en: '1 / mo', ar: '١ / شهر' },
          { en: 'Unlimited', ar: 'بلا حدود' },
          { en: 'Unlimited', ar: 'بلا حدود' },
          { en: '5 company mocks', ar: '٥ مقابلات شركات' },
        ],
      },
      {
        label: { en: 'Muqabaleh passport', ar: 'جواز مقابلة' },
        values: [
          { en: 'Preview', ar: 'معاينة' },
          { en: 'Full verified', ar: 'موثّق كامل' },
          { en: 'Full verified', ar: 'موثّق كامل' },
          { en: 'Full verified', ar: 'موثّق كامل' },
        ],
      },
      {
        label: { en: 'Manual application tracker', ar: 'متتبّع تقديمات يدوي' },
        values: [
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: 'Yes', ar: 'نعم' },
          { en: '—', ar: '—' },
        ],
      },
      {
        label: { en: 'Cover letter generator', ar: 'مولّد خطاب التقديم' },
        values: [
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: 'Yes', ar: 'نعم' },
          { en: '—', ar: '—' },
        ],
      },
      {
        label: { en: 'CV studio', ar: 'استوديو السيرة' },
        values: [
          { en: '—', ar: '—' },
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: '—', ar: '—' },
        ],
      },
      {
        label: { en: 'Negotiation scripts', ar: 'سكربتات التفاوض' },
        values: [
          { en: '—', ar: '—' },
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: 'Pack included', ar: 'الباقة مشمولة' },
        ],
      },
      {
        label: { en: 'We apply for you', ar: 'نقدّم عنك' },
        values: [
          { en: 'Never', ar: 'أبداً' },
          { en: 'Never', ar: 'أبداً' },
          { en: 'Never', ar: 'أبداً' },
          { en: 'Never', ar: 'أبداً' },
        ],
      },
    ],
    companyNote: {
      en: 'Hiring team or partner? Separate paths — employers get a demo; partners get a quote for white-label.',
      ar: 'فريق توظيف أو شريك؟ مساران منفصلان — أصحاب العمل يطلبون عرضاً؛ الشركاء يطلبون عرض سعر للعلامة البيضاء.',
    },
    companyCta: { en: 'Request demo', ar: 'اطلب عرضاً' },
    partnerCta: { en: 'Partner with us', ar: 'كن شريكاً' },
  },
  testimonials: {
    title: { en: 'Stories from people who got ready', ar: 'قصص ممن استعدّوا معنا' },
    items: [
      {
        name: { en: 'Sara Al-Mansouri', ar: 'سارة المنصوري' },
        role: { en: 'Product Manager — Dubai', ar: 'مديرة منتجات — دبي' },
        quote: {
          en: 'A few AI sessions and a clear passport — I walked into final rounds ready.',
          ar: 'بضع جلسات ذكاء اصطناعي وجواز واضح — دخلت الجولات النهائية وأنا جاهزة.',
        },
      },
      {
        name: { en: 'Omar Al-Shamri', ar: 'عمر الشمري' },
        role: { en: 'HR Director — Riyadh', ar: 'مدير موارد بشرية — الرياض' },
        quote: {
          en: 'We cut screening time dramatically and still got richer candidate signal.',
          ar: 'اختصرنا وقت الفرز بشكل كبير، وحصلنا على صورة أوضح عن المرشحين.',
        },
      },
      {
        name: { en: 'Lina Haddad', ar: 'لينا حداد' },
        role: { en: 'Software Engineer — Amman', ar: 'مهندسة برمجيات — عمّان' },
        quote: {
          en: 'Bilingual practice made English interviews feel natural — not intimidating.',
          ar: 'التدرّب بلغتين جعل مقابلات الإنجليزية طبيعية، لا مخيفة.',
        },
      },
    ],
  },
  faq: {
    title: { en: 'Common questions', ar: 'أسئلة شائعة' },
    items: [
      {
        q: {
          en: 'What is a Muqabaleh passport?',
          ar: 'ما هو جواز مقابلة؟',
        },
        a: {
          en: 'A shareable, verifiable hire-ready profile built from your AI interview score — proof employers can trust.',
          ar: 'ملف جاهزية قابل للمشاركة والتحقق مبني على نتيجة مقابلتك الذكية — دليل يثق به أصحاب العمل.',
        },
      },
      {
        q: {
          en: 'Who is Jeannie?',
          ar: 'من هي جيني؟',
        },
        a: {
          en: 'Jeannie is your AI interview coach. She runs mock interviews, helps build your verified passport, and preps materials — you always apply yourself on the company site.',
          ar: 'جيني مدربة مقابلاتك بالذكاء الاصطناعي. تُجري مقابلات تجريبية، تساعد في بناء جوازك الموثّق، وتجهّز المواد — وأنت تقدّم دائماً بنفسك على موقع الشركة.',
        },
      },
      {
        q: {
          en: 'What is the difference between Jeannie and Jeannie Pro?',
          ar: 'ما الفرق بين جيني وجيني برو؟',
        },
        a: {
          en: 'Basic is FREE. Jeannie is $14.99/mo for unlimited mocks, full passport, manual tracker, cover letters, and salary benchmarks. Jeannie Pro is $29.99/mo with CV studio, negotiation scripts, and priority ranking. Mastery Pack is $44.99 one-time for 5 company-specific mocks.',
          ar: 'الأساسي مجاني. جيني بـ $14.99/شهر لمقابلات بلا حدود وجواز كامل ومتتبّع يدوي وخطابات ومؤشرات رواتب. جيني برو بـ $29.99/شهر مع استوديو سيرة وسكربتات تفاوض وترتيب أولوية. باقة الإتقان بـ $44.99 مرة واحدة لـ ٥ مقابلات خاصة بشركات.',
        },
      },
      {
        q: {
          en: 'Can I practice in Arabic or English?',
          ar: 'هل يمكنني التدرّب بالعربية أو الإنجليزية؟',
        },
        a: {
          en: 'Both. Jeannie interviews you in Arabic or English — including Gulf, Levantine, and Egyptian dialects, professional English with local accents, and natural code-switching. Accent is not a penalty.',
          ar: 'كلاهما. جيني تُجري مقابلتك بالعربية أو الإنجليزية — بما في ذلك اللهجات الخليجية والشامية والمصرية، والإنجليزية المهنية بلهجات محلية، والتبديل الطبيعي بين اللغتين. اللهجة ليست عقوبة.',
        },
      },
      {
        q: {
          en: 'Is my passport score public after one interview?',
          ar: 'هل تصبح درجة الجواز عامة بعد مقابلة واحدة؟',
        },
        a: {
          en: 'No. Scores stay private until you decide to lock, publish, or share your passport. You can practice and retake to improve first.',
          ar: 'لا. الدرجات تبقى خاصة حتى تقرر تثبيت جوازك أو نشره أو مشاركته. يمكنك التدرّب وإعادة المقابلة لتحسين نتيجتك أولاً.',
        },
      },
      {
        q: {
          en: 'Does Jeannie apply to jobs for me?',
          ar: 'هل تقدّم جيني للوظائف عني؟',
        },
        a: {
          en: 'She doesn’t. Muqabaleh never applies on your behalf. You practice for the role, prep materials, then click “Apply on Company Site” and submit yourself.',
          ar: 'لا تفعل. مقابلة لا تقدّم نيابةً عنك. تتدرّب للدور، تجهّز موادك، ثم تضغط «قدّم على موقع الشركة» وتقدّم بنفسك.',
        },
      },
      {
        q: {
          en: 'Is there a free trial?',
          ar: 'هل توجد تجربة مجانية؟',
        },
        a: {
          en: 'Yes. Basic is FREE — one mock interview and passport preview. Upgrade to Jeannie ($14.99/mo) or Jeannie Pro ($29.99/mo) for unlimited practice and prep tools — you still apply yourself.',
          ar: 'نعم. الأساسي مجاني — مقابلة تجريبية واحدة ومعاينة الجواز. رقِّ إلى جيني ($14.99/شهر) أو جيني برو ($29.99/شهر) لتدريب بلا حدود وأدوات تحضير — وأنت تقدّم بنفسك.',
        },
      },
      {
        q: {
          en: 'Where are human interviewers and the Job Portal?',
          ar: 'أين المحاورون البشريون وبوابة الوظائف؟',
        },
        a: {
          en: 'Both are paused while we focus on passports and Jeannie. They return later once the network is denser.',
          ar: 'كلاهما متوقف مؤقتاً بينما نركّز على الجوازات وجيني. يعودان لاحقاً عندما تصبح الشبكة أوثق.',
        },
      },
    ],
  },
  finalCta: {
    headline: {
      en: 'Ready to practice with Jeannie?',
      ar: 'هل أنت مستعد للتدرّب مع جيني؟',
    },
    startFree: { en: 'Start free practice', ar: 'ابدأ تدريباً مجانياً' },
    hiring: { en: "I'm hiring", ar: 'أبحث عن مواهب' },
  },
  footer: {
    tagline: {
      en: 'Hire-ready passports. Interview-verified career agent.',
      ar: 'جوازات جاهزة للتوظيف. وكيلة مهنية موثّقة بالمقابلة.',
    },
    product: { en: 'Product', ar: 'المنتج' },
    services: { en: 'Services', ar: 'الخدمات' },
    company: { en: 'Company', ar: 'الشركة' },
    supportCol: { en: 'Support', ar: 'الدعم' },
    legal: { en: 'Legal', ar: 'قانوني' },
    about: { en: 'About', ar: 'من نحن' },
    support: { en: 'Help center', ar: 'مركز المساعدة' },
    contact: { en: 'Contact', ar: 'تواصل معنا' },
    faq: { en: 'FAQ', ar: 'الأسئلة الشائعة' },
    practice: { en: 'Practice with Jeannie', ar: 'تدرّب مع جيني' },
    requestDemo: { en: 'Request a demo', ar: 'اطلب عرضاً' },
    verify: { en: 'Verify a passport', ar: 'تحقق من جواز' },
    privacy: { en: 'Privacy', ar: 'الخصوصية' },
    terms: { en: 'Terms', ar: 'الشروط' },
    refund: { en: 'Refund', ar: 'الاسترداد' },
    email: { en: 'hello@muqabaleh.com', ar: 'hello@muqabaleh.com' },
    copyright: {
      en: '© 2026 Muqabaleh. All rights reserved.',
      ar: '© ٢٠٢٦ مقابلة. جميع الحقوق محفوظة.',
    },
  },
  portalParked: {
    kicker: { en: 'Job Portal', ar: 'بوابة الوظائف' },
    title: {
      en: 'Jobs are live — apply yourself',
      ar: 'الوظائف متاحة — وقدّم بنفسك',
    },
    body: {
      en: "Browse employer and legal ATS listings, practice with Jeannie, earn your passport, then apply on the company site. Muqabaleh never applies for you.",
      ar: 'تصفّح إعلانات أصحاب العمل وواجهات ATS القانونية، تدرّب مع جيني، احصل على جوازك، ثم قدّم على موقع الشركة. مقابلة لا تقدّم نيابةً عنك.',
    },
    ctaPassport: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJeannie: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
    ctaHire: { en: 'Hire with screening', ar: 'وظّف بالفرز' },
  },
  humansParked: {
    kicker: { en: 'Human interviewers', ar: 'محاورون بشريون' },
    title: {
      en: 'Human interviews — coming later',
      ar: 'المقابلات البشرية — قريباً لاحقاً',
    },
    body: {
      en: 'Live human experts are paused for now so we can keep the individual offer simple: AI interview, verified passport, and you apply yourself.',
      ar: 'الخبراء البشريون متوقفون مؤقتاً لنُبقي عرض الأفراد بسيطاً: مقابلة ذكية، جواز موثّق، وأنت تقدّم بنفسك.',
    },
    ctaPassport: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJeannie: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
  },
} as const;
