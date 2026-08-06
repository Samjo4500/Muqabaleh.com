/** Muqabaleh landing copy — professional Arabic, not literal calques. */

export type Bi = { en: string; ar: string };

export const C = {
  brand: { en: 'Muqabaleh', ar: 'مقابلة' } as Bi,
  nav: {
    services: { en: 'Services', ar: 'الخدمات' },
    howItWorks: { en: 'Your path', ar: 'مسارك' },
    jeannie: { en: 'Jeannie', ar: 'جيني' },
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
      en: "MENA's hire-ready interview passport — practice with AI, earn verified proof, then let Jeannie apply with your approval. Not spam.",
      ar: 'جواز مقابلة جاهز للتوظيف في المنطقة — تدرّب مع الذكاء الاصطناعي، احصل على دليل موثّق، ثم دع جيني تقدّم بموافقتك. لا إرسال عشوائي.',
    },
    ctaInterview: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' },
    ctaJeannie: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
    ctaHr: { en: "I'm hiring", ar: 'أنا أوظّف' },
  },
  trust: {
    text: {
      en: 'Built for candidates and hiring teams across MENA',
      ar: 'مصمّمة للمرشحين وفرق التوظيف في الشرق الأوسط وشمال أفريقيا',
    },
  },
  services: {
    title: { en: 'Three steps. One clear offer.', ar: 'ثلاث خطوات. عرض واحد واضح.' },
    subtitle: {
      en: 'Practice. Prove it. Let Jeannie apply.',
      ar: 'تدرّب. أثبت جاهزيتك. دع جيني تقدّم.',
    },
    cards: [
      {
        title: { en: 'AI interview', ar: 'مقابلة ذكية' },
        body: {
          en: 'Practice with an interactive AI interviewer. Instant notes and a full scorecard in about 30 seconds.',
          ar: 'تدرّب مع مقابل ذكاء اصطناعي تفاعلي. ملاحظات فورية وتقرير تقييم كامل خلال نحو ٣٠ ثانية.',
        },
        features: [
          { en: 'Real-time dialogue', ar: 'حوار فوري' },
          { en: 'Instant scoring', ar: 'تقييم فوري' },
          { en: 'Arabic & English', ar: 'عربية وإنجليزية' },
        ],
        cta: { en: 'Try AI interview', ar: 'جرّب المقابلة الذكية' },
        href: '/demo',
      },
      {
        title: { en: 'Muqabaleh passport', ar: 'جواز مقابلة' },
        body: {
          en: 'Turn your score into a shareable, verifiable hire-ready passport — proof employers can trust.',
          ar: 'حوّل نتيجتك إلى جواز جاهزية قابل للمشاركة والتحقق — دليل يثق به أصحاب العمل.',
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
        title: { en: 'Jeannie applies', ar: 'جيني تقدّم' },
        body: {
          en: 'Your interview-verified career agent. She shortlists roles, you approve, she applies with your passport attached.',
          ar: 'وكيلتك المهنية الموثّقة بالمقابلة. ترشّح الأدوار، أنت توافق، وهي تقدّم مع جوازك مرفقاً.',
        },
        features: [
          { en: 'You approve every apply', ar: 'أنت توافق على كل تقديم' },
          { en: 'Passport attached', ar: 'الجواز مرفق' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
        ],
        cta: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
        href: '/#jeannie',
      },
    ],
  },
  how: {
    eyebrow: { en: 'Your path', ar: 'مسارك' },
    title: { en: 'From interview to applied', ar: 'من المقابلة إلى التقديم' },
    subtitle: {
      en: 'One simple path: get scored, earn your passport, then Jeannie works for you.',
      ar: 'مسار واحد بسيط: احصل على تقييمك، اكسب جوازك، ثم تعمل جيني من أجلك.',
    },
    ctaInterview: { en: 'Start AI interview', ar: 'ابدأ المقابلة الذكية' },
    ctaJeannie: { en: 'Meet Jeannie', ar: 'تعرّف على جيني' },
    steps: [
      {
        scene: 'setup' as const,
        title: { en: 'Shape your AI interview', ar: 'شكّل مقابلتك الذكية' },
        desc: {
          en: 'Choose role, seniority, and language. Under a minute — then you begin.',
          ar: 'اختر الدور والمستوى واللغة. في أقل من دقيقة — ثم تبدأ.',
        },
      },
      {
        scene: 'interview' as const,
        title: { en: 'Get scored with AI', ar: 'احصل على تقييمك بالذكاء الاصطناعي' },
        desc: {
          en: 'Timed questions with instant feedback on content, structure, and confidence.',
          ar: 'أسئلة موقوتة مع ملاحظات فورية على المحتوى والبنية والثقة.',
        },
      },
      {
        scene: 'passport' as const,
        title: { en: 'Earn your passport', ar: 'احصل على جوازك' },
        desc: {
          en: 'Your score becomes a shareable, verifiable hire-ready passport.',
          ar: 'تتحول نتيجتك إلى جواز جاهزية قابل للمشاركة والتحقق.',
        },
      },
      {
        scene: 'jeannie' as const,
        title: { en: 'Jeannie shortlists roles', ar: 'جيني ترشّح الأدوار' },
        desc: {
          en: 'Tell her your targets. She finds fits based on your passport — not spam applies.',
          ar: 'أخبرها بأهدافك. تجد ما يناسب جوازك — لا تقديمات عشوائية.',
        },
      },
      {
        scene: 'apply' as const,
        title: { en: 'You approve — she applies', ar: 'أنت توافق — وهي تقدّم' },
        desc: {
          en: 'Every application needs your OK. Jeannie sends it with your passport attached.',
          ar: 'كل تقديم يحتاج موافقتك. جيني ترسله مع جوازك مرفقاً.',
        },
      },
    ],
  },
  jeannie: {
    eyebrow: { en: 'Your career agent', ar: 'وكيلتك المهنية' },
    name: { en: 'Jeannie', ar: 'جيني' },
    title: {
      en: 'Meet Jeannie — she applies with proof',
      ar: 'تعرّف على جيني — تقدّم ومعها الدليل',
    },
    body: {
      en: 'Same face you see in the journey. Interview-verified. She shortlists, waits for your approval, then applies professionally with your Muqabaleh passport.',
      ar: 'نفس الوجه الذي تراه في المسار. موثّقة بالمقابلة. ترشّح، تنتظر موافقتك، ثم تقدّم باحتراف مع جواز مقابلة.',
    },
    offers: [
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
        title: { en: 'Professional apply', ar: 'تقديم احترافي' },
        desc: {
          en: 'Jeannie applies for you with a clear, professional outreach.',
          ar: 'جيني تقدّم عنك بتواصل واضح واحترافي.',
        },
      },
      {
        key: 'passport',
        title: { en: 'Passport attached', ar: 'الجواز مرفق' },
        desc: {
          en: 'Every apply carries your verified Muqabaleh score employers can check.',
          ar: 'كل تقديم يحمل نتيجة مقابلة موثّقة يمكن لأصحاب العمل التحقق منها.',
        },
      },
    ],
    cta: { en: 'Start free — then unlock Jeannie', ar: 'ابدأ مجاناً — ثم فعّل جيني' },
    ctaSecondary: { en: 'Compare plans', ar: 'قارن الخطط' },
  },
  jeannieMagic: {
    eyebrow: { en: "Sample of Jeannie's magic", ar: 'عيّنة من سحر جيني' },
    title: { en: 'See how Jeannie works', ar: 'شاهِد كيف تعمل جيني' },
    body: {
      en: 'A live sample: she reviews roles, picks a fit, asks your approval, applies with your passport — then lands the interview.',
      ar: 'محاكاة حية: تراجع الفرص، تختار الأنسب، تطلب موافقتك، تقدّم مع جوازك — ثم تصل دعوة المقابلة.',
    },
    steps: [
      {
        title: { en: 'Reviews jobs', ar: 'تراجع الوظائف' },
        desc: {
          en: 'Scans MENA roles against your targets and passport signal.',
          ar: 'تفحص أدوار المنطقة مقابل أهدافك وإشارة جوازك.',
        },
      },
      {
        title: { en: 'Selects the fit', ar: 'تختار الأنسب' },
        desc: {
          en: 'One high-fit shortlist pick — quality over volume.',
          ar: 'ترشيح واحد عالي التطابق — الجودة قبل الكمية.',
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
        title: { en: 'Applies with proof', ar: 'تقدّم مع الدليل' },
        desc: {
          en: 'Sends a professional packet with your verified passport.',
          ar: 'ترسل حزمة احترافية مع جوازك الموثّق.',
        },
      },
      {
        title: { en: 'Wins the interview', ar: 'تفوز بالمقابلة' },
        desc: {
          en: 'The employer invites you — passport opened the door.',
          ar: 'صاحب العمل يدعوك — الجواز فتح الباب.',
        },
      },
    ],
    cta: { en: 'Unlock Jeannie', ar: 'فعّل جيني' },
    ctaSecondary: { en: 'Start with free practice', ar: 'ابدأ بالتدريب المجاني' },
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
      en: 'Three clear plans. Approve every apply. Not spam — quality over volume.',
      ar: 'ثلاث خطط واضحة. وافق على كل تقديم. لا إرسال عشوائي — الجودة قبل الكمية.',
    },
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
        price: { en: '$0', ar: '$0' },
        period: { en: '', ar: '' },
        tagline: {
          en: 'Prove the product. No applies.',
          ar: 'جرّب المنتج. بلا تقديمات.',
        },
        applies: { en: '0 applies', ar: '٠ تقديمات' },
        features: [
          { en: '1 AI interview', ar: 'مقابلة ذكاء اصطناعي واحدة' },
          { en: 'Passport preview', ar: 'معاينة الجواز' },
          { en: 'Basic scorecard', ar: 'بطاقة تقييم أساسية' },
          { en: 'No Jeannie applies', ar: 'بدون تقديمات جيني' },
        ],
        cta: { en: 'Start free', ar: 'ابدأ مجاناً' },
        href: '/register',
        popular: false,
      },
      {
        id: 'jeannie' as const,
        name: { en: 'Jeannie', ar: 'جيني' },
        price: { en: '$19', ar: '$19' },
        period: { en: '/mo', ar: '/شهر' },
        tagline: {
          en: 'Controlled applies. Upload your materials.',
          ar: 'تقديمات مضبوطة. ارفع موادك.',
        },
        applies: { en: '10 applies / mo', ar: '١٠ تقديمات / شهر' },
        features: [
          { en: 'Unlimited AI practice', ar: 'تدريب ذكي بلا حدود' },
          { en: 'Full verified passport', ar: 'جواز موثّق كامل' },
          { en: 'Jeannie applies — 10 / month', ar: 'جيني تقدّم — ١٠ / شهر' },
          { en: 'You approve every apply', ar: 'أنت توافق على كل تقديم' },
          { en: 'Upload CV + cover letter', ar: 'رفع السيرة وخطاب التقديم' },
          { en: 'Application tracker', ar: 'متتبّع الطلبات' },
        ],
        cta: { en: 'Unlock Jeannie', ar: 'فعّل جيني' },
        href: '/app/packages',
        popular: true,
      },
      {
        id: 'pro' as const,
        name: { en: 'Jeannie Pro', ar: 'جيني برو' },
        price: { en: '$39', ar: '$39' },
        period: { en: '/mo', ar: '/شهر' },
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
        cta: { en: 'Go Jeannie Pro', ar: 'اشترك في جيني برو' },
        href: '/app/packages',
        popular: false,
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
      en: 'Hiring team? Ask about AI screening and verified passports.',
      ar: 'فريق توظيف؟ اسأل عن الفرز الذكي والجوازات الموثّقة.',
    },
    companyCta: { en: 'Talk to sales', ar: 'تحدث إلى المبيعات' },
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
          en: 'Jeannie ($19) includes 10 approve-gated applies/month with CV and cover letter upload. Jeannie Pro ($39) raises that to 20/month and adds full CV studio plus cover letter generate/assist and richer tracking.',
          ar: 'جيني (١٩$) تشمل ١٠ تقديمات بموافقتك شهرياً مع رفع السيرة وخطاب التقديم. جيني برو (٣٩$) ترفعها إلى ٢٠/شهر وتضيف استوديو سيرة كاملاً وتوليد/مساعدة خطاب التقديم وتتبعاً أغنى.',
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
