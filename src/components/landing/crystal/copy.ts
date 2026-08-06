/** Muqabaleh landing copy — professional Arabic, not literal calques. */

export type Bi = { en: string; ar: string };

export const C = {
  brand: { en: 'Muqabaleh', ar: 'مقابلة' } as Bi,
  nav: {
    services: { en: 'Services', ar: 'الخدمات' },
    howItWorks: { en: 'For job seekers', ar: 'للباحثين عن عمل' },
    forCompanies: { en: 'For companies', ar: 'للشركات' },
    pricing: { en: 'Pricing', ar: 'الأسعار' },
    partners: { en: 'Partners', ar: 'الشركاء' },
    blog: { en: 'Blog', ar: 'المدونة' },
    login: { en: 'Log in', ar: 'تسجيل الدخول' },
    getStarted: { en: 'Get started', ar: 'ابدأ الآن' },
  },
  hero: {
    headline: {
      en: 'Get scored. Get proven. Jeannie applies.',
      ar: 'احصل على تقييمك. أثبت جاهزيتك. جيني تقدّم عنك.',
    },
    sub: {
      en: "MENA's hire-ready interview passport — practice with AI, verify with humans, then let Jeannie apply professionally on your behalf.",
      ar: 'جواز مقابلة جاهز للتوظيف في المنطقة — تدرّب مع الذكاء الاصطناعي، وثّق مع خبراء بشريين، ثم دع جيني تقدّم عنك باحتراف.',
    },
    ctaInterview: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJeannie: { en: 'See how Jeannie works', ar: 'تعرّف على جيني' },
    ctaHr: { en: "I'm hiring", ar: 'أنا أوظّف' },
    statInterviews: { en: '10,000+ interviews', ar: '+١٠٬٠٠٠ مقابلة' },
    statPartners: { en: '500+ HR partners', ar: '+٥٠٠ شريك موارد بشرية' },
    statSuccess: { en: '95% success rate', ar: '٩٥٪ نسبة نجاح' },
  },
  trust: {
    text: {
      en: 'Built for candidates and hiring teams across MENA',
      ar: 'مصمّمة للمرشحين وفرق التوظيف في الشرق الأوسط وشمال أفريقيا',
    },
  },
  services: {
    title: { en: 'From practice to professional apply', ar: 'من التدريب إلى التقديم الاحترافي' },
    subtitle: {
      en: 'Four ways Muqabaleh gets you hire-ready — then puts Jeannie to work.',
      ar: 'أربع طرق تجعلك مقابلة جاهزاً للتوظيف — ثم تطلق جيني للعمل.',
    },
    cards: [
      {
        title: { en: 'AI mock interview', ar: 'مقابلة تجريبية بالذكاء الاصطناعي' },
        body: {
          en: 'Practice with an interactive AI interviewer. Instant notes on your answers, confidence cues, and a full scorecard in about 30 seconds.',
          ar: 'تدرّب مع مقابل ذكاء اصطناعي تفاعلي. ملاحظات فورية على إجاباتك وإشارات الثقة، وتقرير تقييم كامل خلال نحو ٣٠ ثانية.',
        },
        features: [
          { en: 'Real-time dialogue', ar: 'حوار فوري' },
          { en: 'Instant scoring', ar: 'تقييم فوري' },
          { en: 'Industry questions', ar: 'أسئلة حسب التخصص' },
          { en: 'Arabic & English', ar: 'عربية وإنجليزية' },
          { en: 'Available 24/7', ar: 'متاح على مدار الساعة' },
        ],
        cta: { en: 'Try AI interview', ar: 'جرّب المقابلة الذكية' },
        href: '/demo',
      },
      {
        title: { en: 'Muqabaleh passport', ar: 'جواز مقابلة' },
        body: {
          en: 'Turn your score into a shareable, verifiable hire-ready passport. Employers see proof — not just a CV claim.',
          ar: 'حوّل نتيجتك إلى جواز جاهزية قابل للمشاركة والتحقق. يرى أصحاب العمل دليلاً — لا ادّعاءً في سيرة ذاتية.',
        },
        features: [
          { en: 'Verified Muqabaleh score', ar: 'نتيجة مقابلة موثّقة' },
          { en: 'Public verify link', ar: 'رابط تحقق عام' },
          { en: 'Certificates attached', ar: 'شهادات مرفقة' },
          { en: 'Arabic & English', ar: 'عربية وإنجليزية' },
          { en: 'Share anywhere', ar: 'شارك في أي مكان' },
        ],
        cta: { en: 'View passport', ar: 'عرض الجواز' },
        href: '/app/passport',
      },
      {
        title: { en: 'Jeannie — career agent', ar: 'جيني — وكيلة مهنية' },
        body: {
          en: 'Your interview-verified career agent. Jeannie shortlists roles that fit your passport, then applies professionally after you approve.',
          ar: 'وكيلتك المهنية الموثّقة بالمقابلة. جيني ترشّح أدواراً تناسب جوازك، ثم تقدّم باحتراف بعد موافقتك.',
        },
        features: [
          { en: 'Passport-gated matching', ar: 'مطابقة مشروطة بالجواز' },
          { en: 'You approve every apply', ar: 'أنت توافق على كل تقديم' },
          { en: 'Professional outreach', ar: 'تواصل احترافي' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
          { en: 'Proof attached', ar: 'الدليل مرفق' },
        ],
        cta: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
        href: '/#how-it-works',
      },
      {
        title: { en: 'Company screening', ar: 'فرز للشركات' },
        body: {
          en: 'Screen candidates with AI, run human panels, and receive hire-ready passports — without waiting on a public job board.',
          ar: 'افرز المرشحين بالذكاء الاصطناعي، أدِر لجاناً بشرية، واستلم جوازات جاهزة — دون انتظار لوحة وظائف عامة.',
        },
        features: [
          { en: 'AI screening credits', ar: 'رصيد فرز ذكي' },
          { en: 'Human interview panels', ar: 'لجان مقابلات بشرية' },
          { en: 'Verified scorecards', ar: 'بطاقات تقييم موثّقة' },
          { en: 'Branded experience', ar: 'تجربة بعلامتك' },
          { en: 'Team analytics', ar: 'تحليلات للفريق' },
        ],
        cta: { en: 'Talk to sales', ar: 'تحدث إلى المبيعات' },
        href: '/request-demo',
      },
    ],
  },
  how: {
    eyebrow: { en: 'For job seekers', ar: 'للباحثين عن عمل' },
    title: { en: 'Your path to the offer', ar: 'مسارك إلى العرض الوظيفي' },
    subtitle: {
      en: 'Get hire-ready with AI, earn a verified passport, then let Jeannie apply with proof employers trust.',
      ar: 'كن جاهزاً للتوظيف مع الذكاء الاصطناعي، احصل على جواز موثّق، ثم دع جيني تقدّم بدليل يثق به أصحاب العمل.',
    },
    ctaInterview: { en: 'Start AI interview', ar: 'ابدأ المقابلة الذكية' },
    ctaJeannie: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
    acts: [
      {
        label: { en: 'Act I · Get hire-ready', ar: 'الفصل ١ · كن جاهزاً' },
        beats: [
          {
            scene: 'setup' as const,
            title: { en: 'Shape your AI interview', ar: 'شكّل مقابلتك الذكية' },
            desc: {
              en: 'Choose role, seniority, language, and focus. Under a minute — then your plan is ready.',
              ar: 'اختر الدور والمستوى واللغة والتركيز. في أقل من دقيقة — وتكون خطتك جاهزة.',
            },
          },
          {
            scene: 'interview' as const,
            title: { en: 'Practice like it is real', ar: 'تدرّب كأنها حقيقية' },
            desc: {
              en: 'Timed questions with instant feedback on content, structure, and confidence after every answer.',
              ar: 'أسئلة موقوتة مع ملاحظات فورية على المحتوى والبنية والثقة بعد كل إجابة.',
            },
          },
          {
            scene: 'passport' as const,
            title: { en: 'Earn your Muqabaleh passport', ar: 'احصل على جواز مقابلة' },
            desc: {
              en: 'Your score becomes a shareable, verifiable hire-ready passport — the signal that opens doors.',
              ar: 'تتحول نتيجتك إلى جواز جاهزية قابل للمشاركة والتحقق — الإشارة التي تفتح الأبواب.',
            },
          },
          {
            scene: 'coach' as const,
            title: { en: 'Go deeper with a human expert', ar: 'تعمّق مع خبير بشري' },
            desc: {
              en: 'Optional: book a live interviewer by the hour when you want coaching beyond AI practice.',
              ar: 'اختياري: احجز محاوراً مباشراً بالساعة حين تريد تدريباً أعمق من الذكاء الاصطناعي.',
            },
          },
        ],
      },
      {
        label: { en: 'Act II · Let Jeannie work', ar: 'الفصل ٢ · دع جيني تعمل' },
        beats: [
          {
            scene: 'share' as const,
            title: { en: 'Set your targets', ar: 'حدّد أهدافك' },
            desc: {
              en: 'Tell Jeannie the roles, cities, and seniority you want. Your passport is the proof she carries.',
              ar: 'أخبر جيني بالأدوار والمدن والمستوى الذي تريده. جوازك هو الدليل الذي تحمله.',
            },
          },
          {
            scene: 'jeannie' as const,
            title: { en: 'Jeannie shortlists matches', ar: 'جيني ترشّح المطابقات' },
            desc: {
              en: 'She finds roles that fit your score and path — not random spam applications.',
              ar: 'تجد أدواراً تناسب نتيجتك ومسارك — لا تقديمات عشوائية مزعجة.',
            },
          },
          {
            scene: 'apply' as const,
            title: { en: 'You approve — she applies', ar: 'أنت توافق — وهي تقدّم' },
            desc: {
              en: 'Every application needs your OK. Jeannie sends a professional apply with your passport attached.',
              ar: 'كل تقديم يحتاج موافقتك. جيني ترسل طلباً احترافياً مع جوازك مرفقاً.',
            },
          },
          {
            scene: 'track' as const,
            title: { en: 'Track replies in one place', ar: 'تابع الردود من مكان واحد' },
            desc: {
              en: 'See status, next steps, and verification links — so employers always have proof handy.',
              ar: 'شاهد الحالة والخطوات التالية وروابط التحقق — ليبقى الدليل في متناول أصحاب العمل.',
            },
          },
        ],
      },
    ],
  },
  companies: {
    headline: { en: 'Hire with verified signal', ar: 'وظّف بإشارة موثّقة' },
    body: {
      en: 'Stop spending cycles on unqualified candidates. AI screening surfaces hire-ready talent, while human experts deliver deep assessment — passport included.',
      ar: 'توقّف عن إضاعة الوقت مع مرشحين غير مؤهلين. فرز الذكاء الاصطناعي يُظهر مواهب جاهزة، ويقدّم خبراؤنا تقييماً عميقاً — مع الجواز.',
    },
    bullets: [
      { en: 'Cut time-to-hire with scored shortlists', ar: 'اختصر وقت التوظيف بقوائم مقيّمة' },
      { en: 'Consistent AI + human scoring', ar: 'تقييم ذكي وبشري موحّد' },
      { en: 'Receive applicants with passports', ar: 'استلم متقدمين مع جوازاتهم' },
      { en: 'Real-time hiring analytics', ar: 'تحليلات توظيف فورية' },
    ],
    cta: { en: 'Talk to sales', ar: 'تحدث إلى المبيعات' },
  },
  pricing: {
    title: { en: 'Clear offers', ar: 'عروض واضحة' },
    subtitle: {
      en: 'Start free. Subscribe when you want Jeannie applying for you — or when your team needs screening.',
      ar: 'ابدأ مجاناً. اشترك عندما تريد جيني تقدّم عنك — أو عندما يحتاج فريقك إلى فرز.',
    },
    plans: [
      {
        name: { en: 'Free', ar: 'مجاني' },
        price: { en: '$0', ar: '$0' },
        period: { en: '', ar: '' },
        features: [
          { en: '1 AI interview', ar: 'مقابلة ذكاء اصطناعي واحدة' },
          { en: 'Passport preview', ar: 'معاينة الجواز' },
          { en: 'Basic scorecard', ar: 'بطاقة تقييم أساسية' },
          { en: 'Email support', ar: 'دعم عبر البريد' },
        ],
        cta: { en: 'Start free', ar: 'ابدأ مجاناً' },
        href: '/register',
        popular: false,
      },
      {
        name: { en: 'Pro + Jeannie', ar: 'الاحترافي + جيني' },
        price: { en: '$19', ar: '$19' },
        period: { en: '/mo', ar: '/شهر' },
        features: [
          { en: 'Unlimited AI practice', ar: 'تدريب ذكي بلا حدود' },
          { en: 'Full verified passport', ar: 'جواز موثّق كامل' },
          { en: 'Jeannie applies (up to 15/mo)', ar: 'جيني تقدّم (حتى ١٥/شهر)' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
          { en: 'Priority matching', ar: 'مطابقة ذات أولوية' },
        ],
        cta: { en: 'Get Pro + Jeannie', ar: 'اشترك مع جيني' },
        href: '/app/packages',
        popular: true,
      },
      {
        name: { en: 'Executive', ar: 'التنفيذي' },
        price: { en: '$49', ar: '$49' },
        period: { en: '/mo', ar: '/شهر' },
        features: [
          { en: 'Everything in Pro + Jeannie', ar: 'كل مزايا الاحترافي + جيني' },
          { en: '2 human interview credits', ar: 'رصيدان لمقابلات بشرية' },
          { en: 'Jeannie applies (up to 40/mo)', ar: 'جيني تقدّم (حتى ٤٠/شهر)' },
          { en: 'Career coaching session', ar: 'جلسة استشارة مهنية' },
          { en: 'Priority support', ar: 'دعم ذو أولوية' },
        ],
        cta: { en: 'Go Executive', ar: 'اشترك في التنفيذي' },
        href: '/app/packages',
        popular: false,
      },
      {
        name: { en: 'Company Screen', ar: 'فرز الشركات' },
        price: { en: 'Custom', ar: 'مخصص' },
        period: { en: '', ar: '' },
        features: [
          { en: 'AI screening credits', ar: 'رصيد فرز ذكي' },
          { en: 'Human panel interviews', ar: 'مقابلات لجان بشرية' },
          { en: 'Verified candidate passports', ar: 'جوازات مرشحين موثّقة' },
          { en: 'Dedicated account support', ar: 'دعم حساب مخصص' },
        ],
        cta: { en: 'Request a demo', ar: 'اطلب عرضاً توضيحياً' },
        href: '/request-demo',
        popular: false,
      },
    ],
  },
  testimonials: {
    title: { en: 'Stories from people who got ready', ar: 'قصص ممن استعدّوا معنا' },
    items: [
      {
        name: { en: 'Sara Al-Mansouri', ar: 'سارة المنصوري' },
        role: { en: 'Product Manager — Dubai', ar: 'مديرة منتجات — دبي' },
        quote: {
          en: 'Three AI sessions and one human coach — I walked into my final round ready.',
          ar: 'ثلاث جلسات ذكاء اصطناعي ومدرب بشري واحد — دخلت الجولة النهائية وأنا جاهزة.',
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
          en: 'A shareable, verifiable hire-ready profile built from your AI (and optional human) interview scores — proof employers can trust.',
          ar: 'ملف جاهزية قابل للمشاركة والتحقق مبني على نتائج مقابلاتك الذكية (والبشرية اختيارياً) — دليل يثق به أصحاب العمل.',
        },
      },
      {
        q: {
          en: 'Who is Jeannie?',
          ar: 'من هي جيني؟',
        },
        a: {
          en: 'Jeannie is your interview-verified career agent. She shortlists fitting roles and applies professionally after you approve each one.',
          ar: 'جيني وكيلتك المهنية الموثّقة بالمقابلة. ترشّح أدواراً مناسبة وتقدّم باحتراف بعد موافقتك على كل فرصة.',
        },
      },
      {
        q: {
          en: 'Can I practice in Arabic or English?',
          ar: 'هل يمكنني التدرّب بالعربية أو الإنجليزية؟',
        },
        a: {
          en: 'Both. Choose your language per session — the platform is fully bilingual.',
          ar: 'كلاهما. اختر لغة كل جلسة — المنصة ثنائية اللغة بالكامل.',
        },
      },
      {
        q: {
          en: 'Is there a free trial?',
          ar: 'هل توجد تجربة مجانية؟',
        },
        a: {
          en: 'Yes. Start with a free AI interview and passport preview, then subscribe when you want Jeannie applying for you.',
          ar: 'نعم. ابدأ بمقابلة ذكاء اصطناعي مجانية ومعاينة الجواز، ثم اشترك عندما تريد جيني تقدّم عنك.',
        },
      },
      {
        q: {
          en: 'Do you have a public job board today?',
          ar: 'هل لديكم لوحة وظائف عامة الآن؟',
        },
        a: {
          en: 'The Job Portal is paused while we grow verified passports and partners. Jeannie applies via external boards with your passport attached — the marketplace returns later.',
          ar: 'بوابة الوظائف متوقفة مؤقتاً بينما ننمّي الجوازات الموثّقة والشركاء. جيني تقدّم عبر اللوحات الخارجية مع جوازك — وتعود السوق لاحقاً.',
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
    becomeInterviewer: { en: 'Become interviewer', ar: 'انضم كمحاور' },
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
      en: 'We’re building a denser network of verified passports and hiring partners before reopening public listings. Meanwhile, get your passport and let Jeannie apply professionally on your behalf.',
      ar: 'نبني شبكة أوثق من الجوازات الموثّقة وشركاء التوظيف قبل إعادة فتح الإعلانات العامة. في الأثناء، احصل على جوازك ودع جيني تقدّم عنك باحتراف.',
    },
    ctaPassport: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJeannie: { en: 'See how Jeannie works', ar: 'تعرّف على جيني' },
    ctaHire: { en: 'Hire with screening', ar: 'وظّف بالفرز' },
  },
} as const;
