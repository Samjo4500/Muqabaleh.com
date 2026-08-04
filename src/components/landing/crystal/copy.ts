/** Exact bilingual landing copy from product prompt — Muqabaleh only. */

export type Bi = { en: string; ar: string };

export const C = {
  brand: { en: 'Muqabaleh', ar: 'مقابلة' } as Bi,
  nav: {
    services: { en: 'Services', ar: 'الخدمات' },
    howItWorks: { en: 'How It Works', ar: 'كيف تعمل' },
    forCompanies: { en: 'For Companies', ar: 'للشركات' },
    pricing: { en: 'Pricing', ar: 'الأسعار' },
    jobs: { en: 'Jobs', ar: 'الوظائف' },
    blog: { en: 'Blog', ar: 'المدونة' },
    login: { en: 'Log In', ar: 'تسجيل الدخول' },
    getStarted: { en: 'Get Started', ar: 'ابدأ الآن' },
    lang: { en: 'EN / عربي', ar: 'EN / عربي' },
  },
  hero: {
    headline: {
      en: 'AI-Powered Mock Interviews. Real Human Experts. Your Path to the Perfect Job.',
      ar: 'مقابلات تجريبية بالذكاء الاصطناعي. خبراء بشريون حقيقيون. طريقك إلى الوظيفة المثالية.',
    },
    sub: {
      en: 'Practice with AI avatars, book real interviewers by the hour, or let companies find you through our job board. All in one platform.',
      ar: 'تدرب مع شخصيات ذكاء اصطناعي، احجز مقابلين حقيقيين بالساعة، أو دع الشركات تجدك عبر لوحة الوظائف. كل ذلك في منصة واحدة.',
    },
    ctaInterview: { en: 'Start Free Interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJobs: { en: 'Browse Jobs', ar: 'تصفح الوظائف' },
    ctaHr: { en: "I'm an HR Company", ar: 'أنا شركة موارد بشرية' },
    statInterviews: { en: '10,000+ Interviews', ar: '+١٠,٠٠٠ مقابلة' },
    statPartners: { en: '500+ HR Partners', ar: '+٥٠٠ شريك' },
    statSuccess: { en: '95% Success Rate', ar: '٩٥٪ نسبة النجاح' },
  },
  trust: {
    text: {
      en: 'Trusted by leading companies across MENA',
      ar: 'موثوق من قبل الشركات الرائدة في منطقة الشرق الأوسط وشمال أفريقيا',
    },
  },
  services: {
    title: { en: 'Services', ar: 'الخدمات' },
    cards: [
      {
        title: { en: 'AI Mock Interview', ar: 'مقابلة تجريبية بالذكاء الاصطناعي' },
        body: {
          en: 'Practice unlimited interviews with our AI avatar interviewer. Get instant feedback on your answers, body language analysis, and a detailed scorecard in 30 seconds.',
          ar: 'تدرب على مقابلات غير محدودة مع مقابل ذكاء اصطناعي تفاعلي. احصل على ملاحظات فورية على إجاباتك، تحليل لغة الجسد، وتقرير تقييم مفصل في ٣٠ ثانية.',
        },
        features: [
          { en: 'Real-time AI dialogue', ar: 'حوار ذكاء اصطناعي فوري' },
          { en: 'Instant scoring', ar: 'تقييم فوري' },
          { en: 'Industry questions', ar: 'أسئلة حسب التخصص' },
          { en: 'Bilingual', ar: 'ثنائي اللغة' },
          { en: '24/7', ar: 'متاح على مدار الساعة' },
        ],
        cta: { en: 'Try AI Interview', ar: 'جرب المقابلة الذكية' },
        href: '/demo',
      },
      {
        title: { en: 'Human Expert', ar: 'احجز خبيراً بشرياً' },
        body: {
          en: 'Schedule a live video session with a certified interviewer from your industry. Get personalized coaching, real-time corrections, and insider tips from hiring managers.',
          ar: 'حدد موعد جلسة مرئية مباشرة مع مقابل معتمد من مجال تخصصك. احصل على توجيه شخصي، تصحيحات فورية، ونصائح من مديري التوظيف.',
        },
        features: [
          { en: 'Certified experts', ar: 'خبراء معتمدون' },
          { en: 'Hourly booking', ar: 'حجز بالساعة' },
          { en: 'Video/audio/chat', ar: 'جلسات مرئية أو صوتية أو نصية' },
          { en: 'Panel simulation', ar: 'محاكاة لجنة' },
          { en: 'Career coaching', ar: 'استشارة مهنية' },
        ],
        cta: { en: 'Book Now', ar: 'احجز الآن' },
        href: '/interviewers',
      },
      {
        title: { en: 'Job Board', ar: 'اعثر على وظيفة أحلامك' },
        body: {
          en: 'Browse hundreds of verified job postings from top employers. Apply directly, track your application status, and get matched based on your interview scores.',
          ar: 'تصفح مئات إعلانات الوظائف الموثقة من أفضل أصحاب العمل. قدم طلبك مباشرة، تابع حالة طلبك، واحصل على توصيات بناءً على درجات مقابلتك.',
        },
        features: [
          { en: 'Verified postings', ar: 'إعلانات موثقة' },
          { en: 'AI matching', ar: 'توصية بالذكاء الاصطناعي' },
          { en: 'One-click apply', ar: 'تقديم بنقرة واحدة' },
          { en: 'Application tracker', ar: 'متتبع الطلبات' },
          { en: 'Featured jobs', ar: 'فرص مميزة' },
        ],
        cta: { en: 'Browse Jobs', ar: 'تصفح الوظائف' },
        href: '/jobs',
      },
      {
        title: { en: 'HR Whitelabel', ar: 'منصة مقابلات الموارد البشرية' },
        body: {
          en: 'Launch your own branded interview platform under your company domain. Screen candidates with AI, manage pipelines, and build your talent pool — fully whitelabeled.',
          ar: 'أطلق منصة مقابلات بعلامتك التجارية الخاصة تحت نطاق شركتك. قيّم المرشحين بالذكاء الاصطناعي، أدر خطوط التوظيف، وابنِ قاعدة مواهبك — بشكل كامل وخاص.',
        },
        features: [
          { en: 'Custom subdomain', ar: 'نطاق فرعي مخصص' },
          { en: 'AI + Human options', ar: 'خيارات ذكاء اصطناعي وبشري' },
          { en: 'Pipeline management', ar: 'إدارة خطوط المرشحين' },
          { en: 'Team tools', ar: 'أدوات التعاون' },
          { en: 'Analytics', ar: 'تحليلات مفصلة' },
        ],
        cta: { en: 'Request Demo', ar: 'اطلب عرضاً توضيحياً' },
        href: '/business',
      },
    ],
  },
  how: {
    title: { en: 'How It Works', ar: 'كيف تعمل' },
    steps: [
      {
        title: { en: 'Create Profile', ar: 'أنشئ ملفك' },
        desc: { en: 'Sign up and set goals', ar: 'سجّل وحدد أهدافك' },
      },
      {
        title: { en: 'Choose Interview', ar: 'اختر نوع المقابلة' },
        desc: { en: 'AI, human, or job', ar: 'ذكاء اصطناعي، بشري، أو وظيفة' },
      },
      {
        title: { en: 'Practice & Feedback', ar: 'تدرب واحصل على ملاحظات' },
        desc: { en: 'Complete and get scored', ar: 'أكمل واحصل على تقييم' },
      },
      {
        title: { en: 'Land the Job', ar: 'احصل على الوظيفة' },
        desc: { en: 'Apply with confidence', ar: 'قدم بثقة' },
      },
    ],
  },
  companies: {
    headline: { en: 'Hire Smarter with Muqabaleh', ar: 'وظّف بذكاء مع مقابلة' },
    body: {
      en: 'Stop wasting time on unqualified candidates. Our AI screening interviews filter top talent automatically, while our human experts provide deep behavioral assessments.',
      ar: 'توقف عن إضاعة الوقت مع المرشحين غير المؤهلين. مقابلات الفرز الذكية لدينا تُرشّح المواهب المتميزة تلقائياً.',
    },
    bullets: [
      { en: 'Reduce time-to-hire 70%', ar: 'اختصر وقت التوظيف ٧٠٪' },
      { en: 'AI scoring', ar: 'تقييم ذكاء اصطناعي' },
      { en: 'Your brand your domain', ar: 'علامتك نطاقك' },
      { en: 'Real-time analytics', ar: 'تحليلات فورية' },
    ],
    cta: { en: 'Talk to Sales', ar: 'تحدث مع المبيعات' },
  },
  pricing: {
    title: { en: 'Pricing', ar: 'الأسعار' },
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
        cta: { en: 'Start Free', ar: 'ابدأ مجاناً' },
        href: '/auth/register',
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
          { en: 'LinkedIn optimization', ar: 'تحسين LinkedIn' },
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
          { en: 'Full whitelabel', ar: 'علامة تجارية خاصة كاملة' },
          { en: 'Unlimited screening', ar: 'فرز بلا حدود' },
          { en: 'Account manager', ar: 'مدير حساب' },
          { en: 'API access', ar: 'وصول API' },
        ],
        cta: { en: 'Contact Sales', ar: 'تواصل مع المبيعات' },
        href: '/business',
        popular: false,
      },
    ],
  },
  testimonials: {
    title: { en: 'What people say', ar: 'ماذا يقولون' },
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
          ar: 'اختصرنا وقت الفرز بشكل كبير مع إشارات أوضح عن المرشحين.',
        },
      },
      {
        name: { en: 'Lina Haddad', ar: 'لينا حداد' },
        role: { en: 'Software Engineer — Amman', ar: 'مهندسة برمجيات — عمّان' },
        quote: {
          en: 'The bilingual practice made English interviews feel natural, not scary.',
          ar: 'التدرّب ثنائي اللغة جعل مقابلات الإنجليزية طبيعية لا مخيفة.',
        },
      },
    ],
  },
  faq: {
    title: { en: 'FAQ', ar: 'الأسئلة المتكررة' },
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
          ar: 'كلاهما. اختر لغتك لكل جلسة — المنصة ثنائية اللغة بالكامل.',
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
          ar: 'نعم. ابدأ بمقابلات ذكاء اصطناعي مجانية ورقِّ خطتك عند الحاجة.',
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
      en: 'Ready to Ace Your Next Interview?',
      ar: 'مستعد لتتقن مقابلتك القادمة؟',
    },
    startFree: { en: 'Start Free', ar: 'ابدأ مجاناً' },
    hiring: { en: "I'm Hiring", ar: 'أنا أبحث عن مواهب' },
  },
  footer: {
    tagline: {
      en: 'AI mock interviews, human experts, and jobs — one platform.',
      ar: 'مقابلات ذكاء اصطناعي، خبراء بشريون، ووظائف — منصة واحدة.',
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
