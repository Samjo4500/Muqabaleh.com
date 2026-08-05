/** Muqabaleh landing copy — professional Arabic, not literal calques. */

export type Bi = { en: string; ar: string };

export const C = {
  brand: { en: 'Muqabaleh', ar: 'مقابلة' } as Bi,
  nav: {
    services: { en: 'Services', ar: 'الخدمات' },
    howItWorks: { en: 'How it works', ar: 'كيف تعمل' },
    forCompanies: { en: 'For companies', ar: 'للشركات' },
    pricing: { en: 'Pricing', ar: 'الأسعار' },
    jobs: { en: 'Jobs', ar: 'الوظائف' },
    partners: { en: 'Partners', ar: 'الشركاء' },
    blog: { en: 'Blog', ar: 'المدونة' },
    login: { en: 'Log in', ar: 'تسجيل الدخول' },
    getStarted: { en: 'Get started', ar: 'ابدأ الآن' },
  },
  hero: {
    headline: {
      en: 'Walk into every interview ready.',
      ar: 'ادخل كل مقابلة وأنت مستعد.',
    },
    sub: {
      en: 'Practice with AI, book human experts by the hour, and get discovered by employers — one platform for your next offer.',
      ar: 'تدرّب مع الذكاء الاصطناعي، احجز خبراء بشريين بالساعة، ودع الشركات تكتشفك — منصة واحدة لعرضك الوظيفي القادم.',
    },
    ctaInterview: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJobs: { en: 'Browse jobs', ar: 'تصفح الوظائف' },
    ctaHr: { en: "I'm hiring", ar: 'أنا أوظّف' },
    statInterviews: { en: '10,000+ interviews', ar: '+١٠٬٠٠٠ مقابلة' },
    statPartners: { en: '500+ HR partners', ar: '+٥٠٠ شريك موارد بشرية' },
    statSuccess: { en: '95% success rate', ar: '٩٥٪ نسبة نجاح' },
  },
  trust: {
    text: {
      en: 'Trusted by leading teams across MENA',
      ar: 'موثوقة لدى الفرق الرائدة في الشرق الأوسط وشمال أفريقيا',
    },
  },
  services: {
    title: { en: 'Everything you need to land the role', ar: 'كل ما تحتاجه للوصول إلى الوظيفة' },
    subtitle: {
      en: 'Four ways Muqabaleh moves you from practice to offer.',
      ar: 'أربع طرق تنقلك مقابلة من التدريب إلى العرض الوظيفي.',
    },
    cards: [
      {
        title: { en: 'AI mock interview', ar: 'مقابلة تجريبية بالذكاء الاصطناعي' },
        body: {
          en: 'Unlimited practice with an interactive AI interviewer. Instant notes on your answers, body-language cues, and a full scorecard in about 30 seconds.',
          ar: 'تدريب بلا حدود مع مقابل ذكاء اصطناعي تفاعلي. ملاحظات فورية على إجاباتك، إشارات لغة الجسد، وتقرير تقييم كامل خلال نحو ٣٠ ثانية.',
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
        title: { en: 'Book a human expert', ar: 'احجز خبيراً بشرياً' },
        body: {
          en: 'Live video with a certified interviewer from your field. Personalized coaching, real-time corrections, and hiring-manager insight.',
          ar: 'جلسة مرئية مباشرة مع مقابل معتمد من مجال تخصصك. توجيه شخصي، تصحيح فوري، ورؤية من مديري التوظيف.',
        },
        features: [
          { en: 'Certified experts', ar: 'خبراء معتمدون' },
          { en: 'Hourly booking', ar: 'حجز بالساعة' },
          { en: 'Video, audio, or chat', ar: 'مرئي أو صوتي أو نصي' },
          { en: 'Panel simulation', ar: 'محاكاة لجنة' },
          { en: 'Career coaching', ar: 'استشارة مهنية' },
        ],
        cta: { en: 'Book now', ar: 'احجز الآن' },
        href: '/interviewers',
      },
      {
        title: { en: 'Find your next role', ar: 'اعثر على وظيفتك التالية' },
        body: {
          en: 'Verified openings from top employers. Apply in one click, track status, and get matched using your interview scores.',
          ar: 'فرص موثّقة من أفضل أصحاب العمل. قدّم بنقرة واحدة، تابع حالة طلبك، واحصل على توصيات بناءً على درجات مقابلتك.',
        },
        features: [
          { en: 'Verified postings', ar: 'إعلانات موثّقة' },
          { en: 'AI matching', ar: 'توصية ذكية' },
          { en: 'One-click apply', ar: 'تقديم بنقرة واحدة' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
          { en: 'Featured roles', ar: 'فرص مميزة' },
        ],
        cta: { en: 'Browse jobs', ar: 'تصفح الوظائف' },
        href: '/jobs',
      },
      {
        title: { en: 'HR interview platform', ar: 'منصة مقابلات للموارد البشرية' },
        body: {
          en: 'Launch a branded interview experience on your domain. Screen with AI, manage pipelines, and grow your talent pool — fully white-labeled.',
          ar: 'أطلق تجربة مقابلات بعلامتك على نطاقك. فرز بالذكاء الاصطناعي، إدارة خطوط المرشحين، وبناء قاعدة مواهب — بهوية خاصة بالكامل.',
        },
        features: [
          { en: 'Custom subdomain', ar: 'نطاق فرعي مخصص' },
          { en: 'AI + human options', ar: 'ذكاء اصطناعي وبشري' },
          { en: 'Pipeline management', ar: 'إدارة خطوط المرشحين' },
          { en: 'Team tools', ar: 'أدوات للفريق' },
          { en: 'Deep analytics', ar: 'تحليلات مفصّلة' },
        ],
        cta: { en: 'Request a demo', ar: 'اطلب عرضاً توضيحياً' },
        href: '/business',
      },
    ],
  },
  how: {
    title: { en: 'How it works', ar: 'كيف تعمل' },
    subtitle: {
      en: 'Four clear steps from signup to offer.',
      ar: 'أربع خطوات واضحة من التسجيل إلى العرض.',
    },
    steps: [
      {
        title: { en: 'Create your profile', ar: 'أنشئ ملفك' },
        desc: { en: 'Sign up and set your goals.', ar: 'سجّل وحدد أهدافك المهنية.' },
      },
      {
        title: { en: 'Choose your path', ar: 'اختر مسارك' },
        desc: { en: 'AI practice, human coach, or jobs.', ar: 'تدريب ذكي، خبير بشري، أو وظائف.' },
      },
      {
        title: { en: 'Practice & get scored', ar: 'تدرّب واحصل على تقييم' },
        desc: { en: 'Finish the session. See clear feedback.', ar: 'أكمل الجلسة واطّلع على ملاحظات واضحة.' },
      },
      {
        title: { en: 'Land the job', ar: 'احصل على الوظيفة' },
        desc: { en: 'Apply with confidence and proof.', ar: 'قدّم بثقة وبما يثبت جاهزيتك.' },
      },
    ],
  },
  companies: {
    headline: { en: 'Hire smarter with Muqabaleh', ar: 'وظّف بذكاء مع مقابلة' },
    body: {
      en: 'Stop spending cycles on unqualified candidates. AI screening surfaces top talent automatically, while human experts deliver deep behavioral assessment.',
      ar: 'توقّف عن إضاعة الوقت مع مرشحين غير مؤهلين. فرز الذكاء الاصطناعي يُظهر أفضل المواهب تلقائياً، ويقدّم خبراؤنا تقييماً سلوكياً عميقاً.',
    },
    bullets: [
      { en: 'Cut time-to-hire by up to 70%', ar: 'اختصر وقت التوظيف حتى ٧٠٪' },
      { en: 'Consistent AI scoring', ar: 'تقييم ذكي موحّد' },
      { en: 'Your brand, your domain', ar: 'علامتك، نطاقك' },
      { en: 'Real-time hiring analytics', ar: 'تحليلات توظيف فورية' },
    ],
    cta: { en: 'Talk to sales', ar: 'تحدث إلى المبيعات' },
  },
  pricing: {
    title: { en: 'Simple pricing', ar: 'أسعار واضحة' },
    subtitle: {
      en: 'Start free. Upgrade when you are ready to go further.',
      ar: 'ابدأ مجاناً. حدّث خطتك عندما تكون مستعداً للمزيد.',
    },
    plans: [
      {
        name: { en: 'Free', ar: 'مجاني' },
        price: { en: '$0', ar: '$0' },
        period: { en: '', ar: '' },
        features: [
          { en: '3 AI interviews', ar: '٣ مقابلات ذكاء اصطناعي' },
          { en: 'Basic report', ar: 'تقرير أساسي' },
          { en: 'Job board access', ar: 'الوصول إلى لوحة الوظائف' },
          { en: 'Email support', ar: 'دعم عبر البريد' },
        ],
        cta: { en: 'Start free', ar: 'ابدأ مجاناً' },
        href: '/register',
        popular: false,
      },
      {
        name: { en: 'Pro', ar: 'الاحترافي' },
        price: { en: '$9.99', ar: '$9.99' },
        period: { en: '/mo', ar: '/شهر' },
        features: [
          { en: 'Unlimited AI interviews', ar: 'مقابلات ذكاء اصطناعي بلا حدود' },
          { en: 'Detailed feedback', ar: 'ملاحظات مفصّلة' },
          { en: '1 human session', ar: 'جلسة بشرية واحدة' },
          { en: 'Priority matching', ar: 'مطابقة ذات أولوية' },
          { en: 'Session recording', ar: 'تسجيل الجلسة' },
        ],
        cta: { en: 'Get Pro', ar: 'اشترك في الاحترافي' },
        href: '/pricing',
        popular: true,
      },
      {
        name: { en: 'Expert', ar: 'الخبير' },
        price: { en: '$29.99', ar: '$29.99' },
        period: { en: '/mo', ar: '/شهر' },
        features: [
          { en: 'Everything in Pro', ar: 'كل مزايا الاحترافي' },
          { en: '4 human sessions', ar: '٤ جلسات بشرية' },
          { en: 'Career coaching', ar: 'استشارة مهنية' },
          { en: 'Resume review', ar: 'مراجعة السيرة الذاتية' },
          { en: 'LinkedIn optimization', ar: 'تحسين ملف LinkedIn' },
        ],
        cta: { en: 'Go Expert', ar: 'اشترك في الخبير' },
        href: '/pricing',
        popular: false,
      },
      {
        name: { en: 'Enterprise', ar: 'الشركات' },
        price: { en: 'Custom', ar: 'مخصص' },
        period: { en: '', ar: '' },
        features: [
          { en: 'Full white-label', ar: 'علامة تجارية خاصة كاملة' },
          { en: 'Unlimited screening', ar: 'فرز بلا حدود' },
          { en: 'Dedicated account manager', ar: 'مدير حساب مخصص' },
          { en: 'API access', ar: 'وصول عبر واجهة برمجية' },
        ],
        cta: { en: 'Contact sales', ar: 'تواصل مع المبيعات' },
        href: '/business',
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
          en: 'Is the AI interviewer actually effective?',
          ar: 'هل المقابل بالذكاء الاصطناعي فعّال فعلاً؟',
        },
        a: {
          en: 'Yes. It asks adaptive follow-ups, scores you instantly, and prepares you for real interviews.',
          ar: 'نعم. يطرح أسئلة متابعة ذكية، يقيّمك فوراً، ويهيّئك للمقابلات الحقيقية.',
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
          en: 'How do I book a human interviewer?',
          ar: 'كيف أحجز مقابلاً بشرياً؟',
        },
        a: {
          en: 'Browse certified experts, pick a time slot, and join a live video session.',
          ar: 'تصفّح الخبراء المعتمدين، اختر موعداً، وانضم إلى جلسة مرئية مباشرة.',
        },
      },
      {
        q: {
          en: 'Is there a free trial?',
          ar: 'هل توجد تجربة مجانية؟',
        },
        a: {
          en: 'Yes. Start with free AI interviews and upgrade when you need more.',
          ar: 'نعم. ابدأ بمقابلات ذكاء اصطناعي مجانية، وحدّث خطتك عند الحاجة.',
        },
      },
      {
        q: {
          en: 'Can companies post jobs on Muqabaleh?',
          ar: 'هل يمكن للشركات نشر وظائف على مقابلة؟',
        },
        a: {
          en: 'Yes. HR teams can post roles, screen with AI, and manage applicants in one place.',
          ar: 'نعم. فرق الموارد البشرية تنشر الوظائف، تفرز بالذكاء الاصطناعي، وتدير المتقدمين من مكان واحد.',
        },
      },
    ],
  },
  finalCta: {
    headline: {
      en: 'Ready for your next interview?',
      ar: 'هل أنت مستعد لمقابلتك القادمة؟',
    },
    startFree: { en: 'Start free', ar: 'ابدأ مجاناً' },
    hiring: { en: "I'm hiring", ar: 'أبحث عن مواهب' },
  },
  footer: {
    tagline: {
      en: 'AI practice, human experts, and jobs — one platform.',
      ar: 'تدريب ذكي، خبراء بشريون، ووظائف — منصة واحدة.',
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
} as const;
