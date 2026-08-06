/** Muqabaleh landing copy — professional Arabic, not literal calques. */

export type Bi = { en: string; ar: string };

export const C = {
  brand: { en: 'Muqabaleh', ar: 'مقابلة' } as Bi,
  nav: {
    services: { en: 'Services', ar: 'الخدمات' },
    howItWorks: { en: 'How Jeannie works', ar: 'كيف تعمل جيني' },
    jeannie: { en: 'Jeannie', ar: 'جيني' },
    forCompanies: { en: 'For companies', ar: 'للشركات' },
    pricing: { en: 'Plans', ar: 'الخطط' },
    partners: { en: 'Partners', ar: 'الشركاء' },
    blog: { en: 'Blog', ar: 'المدونة' },
    login: { en: 'Log in', ar: 'تسجيل الدخول' },
    getStarted: { en: 'Get started', ar: 'ابدأ الآن' },
  },
  hero: {
    eyebrow: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
    headline: {
      en: 'Jeannie interviews you. Then she applies.',
      ar: 'جيني تُجري مقابلتك. ثم تقدّم عنك.',
    },
    sub: {
      en: 'Your bilingual career agent for MENA — she practices with you in Arabic or English, builds your verified passport, then applies only with your approval. Not spam.',
      ar: 'وكيلتك المهنية ثنائية اللغة للمنطقة — تتدرّب معك بالعربية أو الإنجليزية، تبني جوازك الموثّق، ثم تقدّم فقط بموافقتك. ليس عشوائياً.',
    },
    ctaInterview: { en: 'Practice with Jeannie', ar: 'تدرّب مع جيني' },
    ctaJeannie: { en: 'See how she works', ar: 'شاهِد كيف تعمل' },
    ctaHr: { en: "I'm hiring", ar: 'أنا أوظّف' },
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
      en: 'One agent. Interview, passport, apply — Arabic and English.',
      ar: 'وكيلة واحدة. مقابلة، جواز، تقديم — بالعربية والإنجليزية.',
    },
    cards: [
      {
        title: { en: 'Jeannie interviews you', ar: 'جيني تُجري مقابلتك' },
        body: {
          en: 'Practice with Jeannie in Arabic or English. Real-time dialogue, instant notes, and a full scorecard.',
          ar: 'تدرّب مع جيني بالعربية أو الإنجليزية. حوار فوري، ملاحظات مباشرة، وتقرير تقييم كامل.',
        },
        features: [
          { en: 'Arabic & English', ar: 'عربية وإنجليزية' },
          { en: 'Real-time dialogue', ar: 'حوار فوري' },
          { en: 'Instant scoring', ar: 'تقييم فوري' },
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
        title: { en: 'She applies — you approve', ar: 'هي تقدّم — أنت توافق' },
        body: {
          en: 'Jeannie shortlists roles, waits for your OK, then applies with your passport attached. Not spam.',
          ar: 'جيني ترشّح الأدوار، تنتظر موافقتك، ثم تقدّم مع جوازك مرفقاً. ليس عشوائياً.',
        },
        features: [
          { en: 'You approve every apply', ar: 'أنت توافق على كل تقديم' },
          { en: 'Passport attached', ar: 'الجواز مرفق' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
        ],
        cta: { en: 'See how she works', ar: 'شاهِد كيف تعمل' },
        href: '/#jeannie-magic',
      },
    ],
  },
  how: {
    // Kept for legacy references; landing now uses Jeannie Magic as the path.
    eyebrow: { en: 'How Jeannie works', ar: 'كيف تعمل جيني' },
    title: { en: 'From interview to invite', ar: 'من المقابلة إلى الدعوة' },
    subtitle: {
      en: 'Jeannie interviews you, builds your passport, then applies with your approval.',
      ar: 'جيني تُجري مقابلتك، تبني جوازك، ثم تقدّم بموافقتك.',
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
        title: { en: 'She shortlists roles', ar: 'ترشّح الأدوار' },
        desc: {
          en: 'Fits based on your passport and targets — not spam.',
          ar: 'فرص تناسب جوازك وأهدافك — لا عشوائية.',
        },
      },
      {
        scene: 'apply' as const,
        title: { en: 'You approve — she applies', ar: 'أنت توافق — وهي تقدّم' },
        desc: {
          en: 'Every application needs your OK, with passport attached.',
          ar: 'كل تقديم يحتاج موافقتك، مع الجواز مرفقاً.',
        },
      },
    ],
  },
  jeannie: {
    eyebrow: { en: 'One agent. Full path.', ar: 'وكيلة واحدة. المسار كامل.' },
    name: { en: 'Jeannie', ar: 'جيني' },
    title: {
      en: 'Meet Jeannie — interviewer and career agent',
      ar: 'تعرّف على جيني — المقابِلة والوكيلة المهنية',
    },
    body: {
      en: 'She interviews you in Arabic or English, turns your score into a Muqabaleh passport, shortlists roles, waits for your approval, then applies with proof.',
      ar: 'تُجري مقابلتك بالعربية أو الإنجليزية، تحوّل نتيجتك إلى جواز مقابلة، ترشّح الأدوار، تنتظر موافقتك، ثم تقدّم مع الدليل.',
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
        title: { en: 'Shortlists that fit', ar: 'ترشيحات مناسبة' },
        desc: {
          en: 'Roles matched to your score, path, and cities — not random sprays.',
          ar: 'أدوار تناسب نتيجتك ومسارك ومدنك — لا إرسال عشوائي.',
        },
      },
      {
        key: 'approve',
        title: { en: 'You stay in control', ar: 'القرار بيدك' },
        desc: {
          en: 'Nothing goes out until you approve. Review every opportunity first.',
          ar: 'لا يُرسل شيء قبل موافقتك. راجع كل فرصة أولاً.',
        },
      },
      {
        key: 'apply',
        title: { en: 'Applies with proof', ar: 'تقدّم مع الدليل' },
        desc: {
          en: 'Professional apply with your passport attached.',
          ar: 'تقديم احترافي مع جوازك مرفقاً.',
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
      en: 'A live sample: she interviews you, builds your passport, picks a role, asks approval, applies — then lands the interview invite.',
      ar: 'محاكاة حية: تُجري مقابلتك، تبني جوازك، تختار دوراً، تطلب موافقتك، تقدّم — ثم تصل دعوة المقابلة.',
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
        title: { en: 'Reviews & selects', ar: 'تراجع وتختار' },
        desc: {
          en: 'Scans MENA roles and picks a high-fit shortlist.',
          ar: 'تفحص أدوار المنطقة وتختار ترشيحاً عالي التطابق.',
        },
      },
      {
        title: { en: 'Asks your approval', ar: 'تطلب موافقتك' },
        desc: {
          en: 'Nothing goes out until you say yes. NOT SPAM.',
          ar: 'لا يُرسل شيء قبل موافقتك. ليس عشوائياً.',
        },
      },
      {
        title: { en: 'Applies & wins invite', ar: 'تقدّم وتفوز بالدعوة' },
        desc: {
          en: 'Passport attached — the employer invites you.',
          ar: 'الجواز مرفق — صاحب العمل يدعوك.',
        },
      },
    ],
    cta: { en: 'Request demo', ar: 'اطلب عرضاً' },
    ctaSecondary: { en: 'Get a quote', ar: 'احصل على عرض سعر' },
  },
  companies: {
    headline: { en: 'Hire with verified signal', ar: 'وظّف بإشارة موثّقة' },
    body: {
      en: 'Stop spending cycles on unqualified candidates. AI screening surfaces hire-ready talent with passport proof — without waiting on a public job board.',
      ar: 'توقّف عن إضاعة الوقت مع مرشحين غير مؤهلين. فرز الذكاء الاصطناعي يُظهر مواهب جاهزة مع دليل الجواز — دون انتظار لوحة وظائف عامة.',
    },
    bullets: [
      { en: 'Cut time-to-hire with scored shortlists', ar: 'اختصر وقت التوظيف بقوائم مقيّمة' },
      { en: 'Consistent AI scoring', ar: 'تقييم ذكي موحّد' },
      { en: 'Receive applicants with passports', ar: 'استلم متقدمين مع جوازاتهم' },
      { en: 'Real-time hiring analytics', ar: 'تحليلات توظيف فورية' },
    ],
    cta: { en: 'Talk to sales', ar: 'تحدث إلى المبيعات' },
  },
  pricing: {
    title: { en: 'Choose how far Jeannie goes', ar: 'اختر إلى أين تصل جيني' },
    subtitle: {
      en: 'Clear plans. Pricing on request — request a demo or get a quote. Approve every apply. Not spam.',
      ar: 'خطط واضحة. الأسعار عند الطلب — اطلب عرضاً أو احصل على عرض سعر. وافق على كل تقديم. ليس عشوائياً.',
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
      badge: { en: 'NOT SPAM', ar: 'ليس عشوائياً' },
      line: {
        en: 'Jeannie never spray-applies. Every application needs your approval — passport proof attached.',
        ar: 'جيني لا ترسل عشوائياً. كل تقديم يحتاج موافقتك — مع دليل الجواز مرفقاً.',
      },
    },
    compareTitle: { en: 'Compare plans', ar: 'قارن الخطط' },
    plans: [
      {
        id: 'free' as const,
        name: { en: 'Free', ar: 'مجاني' },
        price: { en: 'Free', ar: 'مجاني' },
        period: { en: '', ar: '' },
        tagline: {
          en: 'Prove the product. No applies.',
          ar: 'جرّب المنتج. بلا تقديمات.',
        },
        applies: { en: '0 applies', ar: '٠ تقديمات' },
        features: [
          { en: '1 AI interview with Jeannie', ar: 'مقابلة واحدة مع جيني' },
          { en: 'Passport preview', ar: 'معاينة الجواز' },
          { en: 'Basic scorecard', ar: 'بطاقة تقييم أساسية' },
          { en: 'No Jeannie applies', ar: 'بدون تقديمات جيني' },
        ],
        cta: { en: 'Start free', ar: 'ابدأ مجاناً' },
        href: '/interview/prequal',
        popular: false,
        concealPrice: false,
      },
      {
        id: 'jeannie' as const,
        name: { en: 'Jeannie', ar: 'جيني' },
        price: { en: 'Custom', ar: 'مخصّص' },
        period: { en: '', ar: '' },
        tagline: {
          en: 'Controlled applies. Upload your materials.',
          ar: 'تقديمات مضبوطة. ارفع موادك.',
        },
        applies: { en: '10 applies / mo', ar: '١٠ تقديمات / شهر' },
        features: [
          { en: 'Unlimited practice with Jeannie', ar: 'تدريب بلا حدود مع جيني' },
          { en: 'Full verified passport', ar: 'جواز موثّق كامل' },
          { en: 'Jeannie applies — 10 / month', ar: 'جيني تقدّم — ١٠ / شهر' },
          { en: 'You approve every apply', ar: 'أنت توافق على كل تقديم' },
          { en: 'Upload CV + cover letter', ar: 'رفع السيرة وخطاب التقديم' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
        ],
        cta: { en: 'Request demo', ar: 'اطلب عرضاً' },
        href: '/request-demo?from=landing-jeannie',
        popular: true,
        concealPrice: true,
      },
      {
        id: 'pro' as const,
        name: { en: 'Jeannie Pro', ar: 'جيني برو' },
        price: { en: 'Custom', ar: 'مخصّص' },
        period: { en: '', ar: '' },
        tagline: {
          en: 'Full CV studio. Stronger materials. More volume.',
          ar: 'استوديو سيرة كامل. مواد أقوى. حجم أكبر.',
        },
        applies: { en: '20 applies / mo', ar: '٢٠ تقديمات / شهر' },
        features: [
          { en: 'Everything in Jeannie', ar: 'كل مزايا جيني' },
          { en: 'Jeannie applies — 20 / month', ar: 'جيني تقدّم — ٢٠ / شهر' },
          { en: 'Full CV studio', ar: 'استوديو سيرة كامل' },
          { en: 'Cover letter generate + assist', ar: 'توليد ومساعدة خطاب التقديم' },
          { en: 'Full tracker + insights', ar: 'متتبّع كامل مع رؤى' },
          { en: 'Priority matching', ar: 'مطابقة ذات أولوية' },
        ],
        cta: { en: 'Get a quote', ar: 'احصل على عرض سعر' },
        href: '/request-demo?from=landing-jeannie-pro&intent=quote',
        popular: false,
        concealPrice: true,
      },
    ],
    compare: [
      {
        label: { en: 'AI interview practice', ar: 'تدريب المقابلة الذكية' },
        values: [
          { en: '1 session', ar: 'جلسة واحدة' },
          { en: 'Unlimited', ar: 'بلا حدود' },
          { en: 'Unlimited', ar: 'بلا حدود' },
        ],
      },
      {
        label: { en: 'Muqabaleh passport', ar: 'جواز مقابلة' },
        values: [
          { en: 'Preview', ar: 'معاينة' },
          { en: 'Full verified', ar: 'موثّق كامل' },
          { en: 'Full verified', ar: 'موثّق كامل' },
        ],
      },
      {
        label: { en: 'Jeannie applies / month', ar: 'تقديمات جيني / شهر' },
        values: [
          { en: '0', ar: '٠' },
          { en: '10', ar: '١٠' },
          { en: '20', ar: '٢٠' },
        ],
      },
      {
        label: { en: 'Approve every apply (NOT SPAM)', ar: 'موافقة على كل تقديم (ليس عشوائياً)' },
        values: [
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: 'Yes', ar: 'نعم' },
        ],
      },
      {
        label: { en: 'CV upload', ar: 'رفع السيرة' },
        values: [
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: 'Yes', ar: 'نعم' },
        ],
      },
      {
        label: { en: 'Cover letter upload / paste', ar: 'رفع / لصق خطاب التقديم' },
        values: [
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
          { en: 'Yes', ar: 'نعم' },
        ],
      },
      {
        label: { en: 'CV studio (build & improve)', ar: 'استوديو السيرة (بناء وتحسين)' },
        values: [
          { en: '—', ar: '—' },
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
        ],
      },
      {
        label: { en: 'Cover letter generate + assist', ar: 'توليد ومساعدة خطاب التقديم' },
        values: [
          { en: '—', ar: '—' },
          { en: '—', ar: '—' },
          { en: 'Yes', ar: 'نعم' },
        ],
      },
      {
        label: { en: 'Application tracker', ar: 'متتبّع الطلبات' },
        values: [
          { en: '—', ar: '—' },
          { en: 'Standard', ar: 'أساسي' },
          { en: 'Full + insights', ar: 'كامل + رؤى' },
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
          en: 'Jeannie is your interview-verified career agent. She shortlists fitting roles and applies only after you approve — never spam.',
          ar: 'جيني وكيلتك المهنية الموثّقة بالمقابلة. ترشّح أدواراً مناسبة وتقدّم فقط بعد موافقتك — بلا إرسال عشوائي.',
        },
      },
      {
        q: {
          en: 'What is the difference between Jeannie and Jeannie Pro?',
          ar: 'ما الفرق بين جيني وجيني برو؟',
        },
        a: {
          en: 'Jeannie includes approve-gated applies each month with CV and cover letter upload. Jeannie Pro adds more monthly applies, full CV studio, cover letter generate/assist, and richer tracking. Pricing is on request — request a demo or get a quote.',
          ar: 'جيني تشمل تقديمات بموافقتك شهرياً مع رفع السيرة وخطاب التقديم. جيني برو تضيف تقديمات أكثر واستوديو سيرة وتوليد/مساعدة الخطاب وتتبعاً أغنى. الأسعار عند الطلب — اطلب عرضاً أو احصل على عرض سعر.',
        },
      },
      {
        q: {
          en: 'Can I practice in Arabic or English?',
          ar: 'هل يمكنني التدرّب بالعربية أو الإنجليزية؟',
        },
        a: {
          en: 'Both. Jeannie interviews you in Arabic or English — choose per session.',
          ar: 'كلاهما. جيني تُجري مقابلتك بالعربية أو الإنجليزية — اختر لغة كل جلسة.',
        },
      },
      {
        q: {
          en: 'Is there a free trial?',
          ar: 'هل توجد تجربة مجانية؟',
        },
        a: {
          en: 'Yes. Start with a free practice interview and passport preview, then request a demo or get a quote when you want Jeannie applying for you.',
          ar: 'نعم. ابدأ بمقابلة تدريب مجانية ومعاينة الجواز، ثم اطلب عرضاً أو عرض سعر عندما تريد جيني تقدّم عنك.',
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
      en: 'Ready for your hire-ready passport?',
      ar: 'هل أنت مستعد لجوازك الجاهز للتوظيف؟',
    },
    startFree: { en: 'Start free', ar: 'ابدأ مجاناً' },
    hiring: { en: "I'm hiring", ar: 'أبحث عن مواهب' },
  },
  footer: {
    tagline: {
      en: 'Hire-ready passports. Interview-verified career agent.',
      ar: 'جوازات جاهزة للتوظيف. وكيلة مهنية موثّقة بالمقابلة.',
    },
    services: { en: 'Services', ar: 'الخدمات' },
    company: { en: 'Company', ar: 'الشركة' },
    legal: { en: 'Legal', ar: 'قانوني' },
    about: { en: 'About', ar: 'من نحن' },
    support: { en: 'Support', ar: 'الدعم' },
    privacy: { en: 'Privacy', ar: 'الخصوصية' },
    terms: { en: 'Terms', ar: 'الشروط' },
    refund: { en: 'Refund', ar: 'الاسترداد' },
    copyright: {
      en: '© 2026 Muqabaleh. All rights reserved.',
      ar: '© ٢٠٢٦ مقابلة. جميع الحقوق محفوظة.',
    },
  },
  portalParked: {
    kicker: { en: 'Job Portal', ar: 'بوابة الوظائف' },
    title: {
      en: 'Marketplace paused — Jeannie is live',
      ar: 'السوق متوقفة مؤقتاً — جيني تعمل',
    },
    body: {
      en: "We're building a denser network of verified passports and hiring partners before reopening public listings. Meanwhile, get your passport and let Jeannie apply professionally on your behalf.",
      ar: 'نبني شبكة أوثق من الجوازات الموثّقة وشركاء التوظيف قبل إعادة فتح الإعلانات العامة. في الأثناء، احصل على جوازك ودع جيني تقدّم عنك باحتراف.',
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
      en: 'Live human experts are paused for now so we can keep the individual offer simple: AI interview, verified passport, and Jeannie applying for you.',
      ar: 'الخبراء البشريون متوقفون مؤقتاً لنُبقي عرض الأفراد بسيطاً: مقابلة ذكية، جواز موثّق، وجيني تقدّم عنك.',
    },
    ctaPassport: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJeannie: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
  },
} as const;
