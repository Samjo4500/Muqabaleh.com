import type { GuideCompany, GuideRole } from './types';

const PUBLISHED = '2026-03-01';

/** Phase 1 — top 20 MENA employers for interview-guide SEO. */
export const GUIDE_COMPANIES: GuideCompany[] = [
  {
    slug: 'careem',
    name: { en: 'Careem', ar: 'كريم' },
    aliases: ['careem'],
    country: { en: 'UAE', ar: 'الإمارات' },
    industry: { en: 'Mobility / Super app', ar: 'التنقل / تطبيق شامل' },
    about: {
      en: 'Careem is a MENA super app spanning ride-hailing, delivery, and payments. Interviews usually test product sense, ownership, and comfort with fast-moving markets.',
      ar: 'كريم تطبيق شامل في الشرق الأوسط يغطي التنقل والتوصيل والمدفوعات. مقابلاتهم تختبر حس المنتج والملكية والراحة في أسواق سريعة.',
    },
    hook: {
      en: 'Careem hires builders who can ship for millions of riders across the region.',
      ar: 'كريم يوظّف من يستطيع إطلاق منتجات تصل ملايين المستخدمين في المنطقة.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive UAE packages; tech roles often AED 20k–45k+/mo depending on level',
      ar: 'حزم تنافسية في الإمارات؛ أدوار التقنية غالباً ٢٠–٤٥ ألف درهم+/شهر حسب المستوى',
    },
    companyQuestions: [
      {
        en: 'How would you improve Careem’s driver or captain experience in a new city?',
        ar: 'كيف تحسّن تجربة الكابتن في مدينة جديدة لكريم؟',
      },
      {
        en: 'Tell us about a time you balanced growth metrics with trust and safety.',
        ar: 'حدّثنا عن مرة وازنت فيها بين نمو المقاييس والثقة والسلامة.',
      },
      {
        en: 'Why Careem versus other regional tech companies?',
        ar: 'لماذا كريم مقارنة بشركات تقنية إقليمية أخرى؟',
      },
    ],
    cultureTips: {
      en: 'Expect bilingual environments. Dress smart-casual for most tech roles; more formal for banking partners or enterprise pitches.',
      ar: 'بيئة ثنائية اللغة غالباً. لباس أنيق غير رسمي للأدوار التقنية؛ أكثر رسمية للشراكات البنكية.',
    },
    relatedCompanySlugs: ['noon', 'talabat', 'souq'],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'data-scientist'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'noon',
    name: { en: 'noon', ar: 'نون' },
    country: { en: 'UAE / KSA', ar: 'الإمارات / السعودية' },
    industry: { en: 'E-commerce', ar: 'التجارة الإلكترونية' },
    about: {
      en: 'noon is a major Gulf e-commerce platform. Interviews emphasize scale, marketplace thinking, and Arabic/English customer empathy.',
      ar: 'نون منصة تجارة إلكترونية كبرى في الخليج. المقابلات تركز على الحجم وتفكير السوق وفهم العميل بالعربية والإنجليزية.',
    },
    hook: {
      en: 'Prepare for marketplace trade-offs: selection, speed, and unit economics.',
      ar: 'استعد لمفاضلات السوق: التشكيلة والسرعة واقتصاديات الوحدة.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Strong Gulf tech packages; varies widely by UAE vs KSA location',
      ar: 'حزم تقنية قوية في الخليج؛ تختلف كثيراً بين الإمارات والسعودية',
    },
    companyQuestions: [
      {
        en: 'How would you reduce cart abandonment during Ramadan peak?',
        ar: 'كيف تقلّل التخلي عن السلة في ذروة رمضان؟',
      },
      {
        en: 'Describe a catalog or logistics problem you owned end-to-end.',
        ar: 'صف مشكلة في الكتالوج أو اللوجستيات تولّيتها من البداية للنهاية.',
      },
    ],
    cultureTips: {
      en: 'Highlight regional holidays, Arabic UX, and last-mile realities in Gulf cities.',
      ar: 'أبرز المواسم الإقليمية وتجربة العربية وواقع التوصيل في مدن الخليج.',
    },
    relatedCompanySlugs: ['careem', 'talabat', 'souq'],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'marketing-manager'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'talabat',
    name: { en: 'Talabat', ar: 'طلبات' },
    country: { en: 'Kuwait / UAE', ar: 'الكويت / الإمارات' },
    industry: { en: 'Food delivery', ar: 'توصيل الطعام' },
    about: {
      en: 'Talabat is a leading food-delivery brand across the GCC. Interviews often probe ops rigor, partner relationships, and high-tempo execution.',
      ar: 'طلبات علامة رائدة لتوصيل الطعام في الخليج. المقابلات تختبر الصرامة التشغيلية وعلاقات الشركاء والتنفيذ السريع.',
    },
    hook: {
      en: 'Show you can thrive when every minute of delivery time matters.',
      ar: 'أظهر أنك تنجح حين تكون كل دقيقة في التوصيل مهمة.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Competitive ops and tech pay across GCC hubs',
      ar: 'رواتب تشغيل وتقنية تنافسية في مراكز الخليج',
    },
    companyQuestions: [
      {
        en: 'How would you improve restaurant onboarding without hurting quality?',
        ar: 'كيف تحسّن انضمام المطاعم دون الإضرار بالجودة؟',
      },
      {
        en: 'Walk through a busy Friday night ops incident.',
        ar: 'اسرد حادثة تشغيل في ليلة جمعة مزدحمة.',
      },
    ],
    cultureTips: {
      en: 'Operational stories beat vague strategy talk. Quantify ETA, cancel rates, and partner NPS.',
      ar: 'قصص تشغيلية أفضل من كلام استراتيجي عام. رقّم زمن الوصول والإلغاء ورضا الشركاء.',
    },
    relatedCompanySlugs: ['careem', 'noon', 'fawry'],
    relatedRoleSlugs: ['product-manager', 'project-manager', 'sales-executive'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'stc',
    name: { en: 'stc', ar: 'الاتصالات السعودية stc' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Telecom / Digital', ar: 'الاتصالات / الرقمي' },
    about: {
      en: 'stc is a flagship Saudi telecom and digital group. Interviews mix enterprise discipline with digital transformation ambition.',
      ar: 'stc مجموعة اتصالات ورقمية رائدة في السعودية. المقابلات تجمع انضباط المؤسسات وطموح التحول الرقمي.',
    },
    hook: {
      en: 'Show Vision 2030 awareness without empty buzzwords.',
      ar: 'أظهر وعياً برؤية ٢٠٣٠ دون شعارات فارغة.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Strong KSA packages; telecom and digital roles often SAR mid-to-senior bands',
      ar: 'حزم سعودية قوية؛ أدوار الاتصالات والرقمي ضمن نطاق متوسط إلى كبار',
    },
    companyQuestions: [
      {
        en: 'How would you improve a B2C digital journey for stc customers?',
        ar: 'كيف تحسّن رحلة رقمية لعملاء stc؟',
      },
      {
        en: 'Tell us about working with regulators or large enterprise stakeholders.',
        ar: 'حدّثنا عن العمل مع جهات تنظيمية أو أصحاب مصلحة كبار.',
      },
    ],
    cultureTips: {
      en: 'Business formal attire is safer for most stc interviews in Riyadh.',
      ar: 'اللباس الرسمي أكثر أماناً لمعظم مقابلات stc في الرياض.',
    },
    relatedCompanySlugs: ['etisalat', 'du', 'neom'],
    relatedRoleSlugs: ['software-engineer', 'project-manager', 'sales-executive'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'al-rajhi-bank',
    name: { en: 'Al Rajhi Bank', ar: 'مصرف الراجحي' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Banking', ar: 'الخدمات المصرفية' },
    about: {
      en: 'Al Rajhi Bank is one of the region’s largest Islamic banks. Expect compliance awareness, customer trust, and digital banking literacy.',
      ar: 'مصرف الراجحي من أكبر البنوك الإسلامية. توقّع وعياً بالامتثال وثقة العميل والمعرفة بالخدمات الرقمية.',
    },
    hook: {
      en: 'Pair banking fundamentals with modern digital product thinking.',
      ar: 'اجمع أساسيات العمل المصرفي مع تفكير المنتج الرقمي.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Banking bands in KSA; specialist and tech roles often above market median',
      ar: 'نطاقات بنكية في السعودية؛ أدوار التخصص والتقنية غالباً فوق المتوسط',
    },
    companyQuestions: [
      {
        en: 'How do you balance innovation with Sharia and risk controls?',
        ar: 'كيف توازن بين الابتكار والضوابط الشرعية والمخاطر؟',
      },
      {
        en: 'Describe a customer-trust issue you helped resolve.',
        ar: 'صف مشكلة ثقة عميل ساعدت في حلها.',
      },
    ],
    cultureTips: {
      en: 'Conservative professional dress. Emphasize integrity and customer protection.',
      ar: 'لباس مهني محافظ. شدّد على النزاهة وحماية العميل.',
    },
    relatedCompanySlugs: ['emirates-nbd', 'aramco', 'stc'],
    relatedRoleSlugs: ['financial-analyst', 'software-engineer', 'product-manager'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'emirates-nbd',
    name: { en: 'Emirates NBD', ar: 'بنك الإمارات دبي الوطني' },
    country: { en: 'UAE', ar: 'الإمارات' },
    industry: { en: 'Banking', ar: 'الخدمات المصرفية' },
    about: {
      en: 'Emirates NBD is a major UAE bank investing heavily in digital. Interviews test analytical rigor and stakeholder communication.',
      ar: 'بنك الإمارات دبي الوطني بنك إماراتي كبير يستثمر في الرقمي. المقابلات تختبر الصرامة التحليلية والتواصل مع أصحاب المصلحة.',
    },
    hook: {
      en: 'Bring crisp numbers and clear risk thinking.',
      ar: 'أحضر أرقاماً واضحة وتفكيراً واضحاً في المخاطر.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive UAE banking compensation with role-dependent allowances',
      ar: 'تعويضات بنكية تنافسية في الإمارات مع بدلات حسب الدور',
    },
    companyQuestions: [
      {
        en: 'Walk us through a dashboard or model that changed a decision.',
        ar: 'اسرد لوحة أو نموذجاً غيّر قراراً.',
      },
      {
        en: 'How would you improve onboarding for a retail banking product?',
        ar: 'كيف تحسّن انضمام عميل لمنتج مصرفي للأفراد؟',
      },
    ],
    cultureTips: {
      en: 'Formal business attire. Be ready for competency and case-style questions.',
      ar: 'لباس رسمي. استعد لأسئلة كفاءات وحالات عملية.',
    },
    relatedCompanySlugs: ['al-rajhi-bank', 'etisalat', 'emirates'],
    relatedRoleSlugs: ['financial-analyst', 'data-scientist', 'product-manager'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'aramco',
    name: { en: 'Aramco', ar: 'أرامكو' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Energy', ar: 'الطاقة' },
    about: {
      en: 'Aramco interviews are structured and competitive. Safety, technical depth, and long-term ownership matter as much as ambition.',
      ar: 'مقابلات أرامكو منظمة وتنافسية. السلامة والعمق التقني والملكية طويلة الأمد مهمة بقدر الطموح.',
    },
    hook: {
      en: 'Show engineering discipline and respect for operational excellence.',
      ar: 'أظهر انضباطاً هندسياً واحتراماً للتميز التشغيلي.',
    },
    difficulty: 5,
    salaryHint: {
      en: 'Top-tier KSA energy packages; highly role and grade dependent',
      ar: 'حزم طاقة من الدرجة الأولى في السعودية؛ تعتمد كثيراً على الدور والدرجة',
    },
    companyQuestions: [
      {
        en: 'Describe a safety or reliability risk you mitigated.',
        ar: 'صف مخاطرة سلامة أو موثوقية خفّفتها.',
      },
      {
        en: 'How do you learn complex technical systems quickly?',
        ar: 'كيف تتعلّم أنظمة تقنية معقدة بسرعة؟',
      },
    ],
    cultureTips: {
      en: 'Formal attire. Prepare STAR stories with measurable outcomes.',
      ar: 'لباس رسمي. حضّر قصص STAR بنتائج قابلة للقياس.',
    },
    relatedCompanySlugs: ['sabic', 'neom', 'red-sea-global'],
    relatedRoleSlugs: ['civil-engineer', 'project-manager', 'software-engineer'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'sabic',
    name: { en: 'SABIC', ar: 'سابك' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Chemicals / Manufacturing', ar: 'الكيماويات / التصنيع' },
    about: {
      en: 'SABIC is a global chemicals leader headquartered in KSA. Interviews reward process thinking, HSE awareness, and collaboration.',
      ar: 'سابك رائدة عالمياً في الكيماويات ومقرها السعودية. المقابلات تكافئ تفكير العمليات ووعي السلامة والتعاون.',
    },
    hook: {
      en: 'Connect your craft to industrial scale and sustainability.',
      ar: 'اربط مهارتك بالحجم الصناعي والاستدامة.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Strong industrial packages in KSA for engineering and commercial roles',
      ar: 'حزم صناعية قوية في السعودية للهندسة والأدوار التجارية',
    },
    companyQuestions: [
      {
        en: 'Tell us about optimizing a process under constraints.',
        ar: 'حدّثنا عن تحسين عملية تحت قيود.',
      },
      {
        en: 'How do you communicate technical risk to non-technical leaders?',
        ar: 'كيف توصل المخاطر التقنية لقادة غير تقنيين؟',
      },
    ],
    cultureTips: {
      en: 'Professional formal dress. Emphasize teamwork on large sites.',
      ar: 'لباس رسمي مهني. أبرز العمل الجماعي في المواقع الكبيرة.',
    },
    relatedCompanySlugs: ['aramco', 'neom', 'qiddiya'],
    relatedRoleSlugs: ['civil-engineer', 'project-manager', 'financial-analyst'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'neom',
    name: { en: 'NEOM', ar: 'نيوم' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Megaproject / Future cities', ar: 'مشاريع كبرى / مدن المستقبل' },
    about: {
      en: 'NEOM interviews look for builders who can handle ambiguity, mega-scale planning, and cross-cultural teams.',
      ar: 'مقابلات نيوم تبحث عن من يتعامل مع الغموض والتخطيط الضخم والفرق متعددة الثقافات.',
    },
    hook: {
      en: 'Bring concrete delivery stories—not only vision slides.',
      ar: 'أحضر قصص تسليم ملموسة—لا شرائح رؤية فقط.',
    },
    difficulty: 5,
    salaryHint: {
      en: 'Premium project packages; varies by specialty and contract type',
      ar: 'حزم مشاريع مميزة؛ تختلف حسب التخصص ونوع العقد',
    },
    companyQuestions: [
      {
        en: 'How do you prioritize when every workstream feels urgent?',
        ar: 'كيف ترتّب الأولويات حين يبدو كل مسار عاجلاً؟',
      },
      {
        en: 'Describe delivering with incomplete requirements.',
        ar: 'صف التسليم مع متطلبات غير مكتملة.',
      },
    ],
    cultureTips: {
      en: 'International teams; clear English helps, Arabic is a plus. Smart professional attire.',
      ar: 'فرق دولية؛ الإنجليزية الواضحة مهمة والعربية ميزة. لباس مهني أنيق.',
    },
    relatedCompanySlugs: ['qiddiya', 'red-sea-global', 'aramco'],
    relatedRoleSlugs: ['project-manager', 'civil-engineer', 'software-engineer'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'qiddiya',
    name: { en: 'Qiddiya', ar: 'القدية' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Entertainment / Destinations', ar: 'الترفيه / الوجهات' },
    about: {
      en: 'Qiddiya is building a major entertainment destination near Riyadh. Interviews value creativity grounded in execution.',
      ar: 'القدية تبني وجهة ترفيهية كبرى قرب الرياض. المقابلات تقدّر الإبداع المرتبط بالتنفيذ.',
    },
    hook: {
      en: 'Show how you turn ambitious concepts into phased delivery.',
      ar: 'أظهر كيف تحوّل المفاهيم الطموحة إلى تسليم مرحلي.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive destination-project pay in KSA',
      ar: 'رواتب تنافسية لمشاريع الوجهات في السعودية',
    },
    companyQuestions: [
      {
        en: 'How would you improve guest experience for a first-time visitor?',
        ar: 'كيف تحسّن تجربة الزائر لأول مرة؟',
      },
      {
        en: 'Tell us about a cross-functional launch you led.',
        ar: 'حدّثنا عن إطلاق متعدد التخصصات قدته.',
      },
    ],
    cultureTips: {
      en: 'Creative yet professional. Prepare examples that mix guest empathy with ops detail.',
      ar: 'إبداعي ومهني. حضّر أمثلة تمزج تعاطف الزائر مع تفاصيل التشغيل.',
    },
    relatedCompanySlugs: ['neom', 'red-sea-global', 'sabic'],
    relatedRoleSlugs: ['project-manager', 'marketing-manager', 'civil-engineer'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'red-sea-global',
    name: { en: 'Red Sea Global', ar: 'البحر الأحمر الدولية' },
    country: { en: 'Saudi Arabia', ar: 'السعودية' },
    industry: { en: 'Tourism / Regenerative development', ar: 'السياحة / التطوير التجديدي' },
    about: {
      en: 'Red Sea Global focuses on regenerative tourism destinations. Sustainability literacy and stakeholder management are frequent themes.',
      ar: 'البحر الأحمر الدولية تركّز على وجهات سياحية تجديدية. معرفة الاستدامة وإدارة أصحاب المصلحة موضوعات متكررة.',
    },
    hook: {
      en: 'Connect hospitality, environment, and large-project delivery.',
      ar: 'اربط الضيافة والبيئة وتسليم المشاريع الكبرى.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Strong tourism and project packages in KSA',
      ar: 'حزم سياحة ومشاريع قوية في السعودية',
    },
    companyQuestions: [
      {
        en: 'How do you weigh guest luxury against environmental limits?',
        ar: 'كيف توازن فخامة الضيف مع الحدود البيئية؟',
      },
      {
        en: 'Describe a sustainability KPI you influenced.',
        ar: 'صف مؤشر استدامة أثّرت فيه.',
      },
    ],
    cultureTips: {
      en: 'Professional attire. Show respect for local culture and environmental stewardship.',
      ar: 'لباس مهني. أظهر احتراماً للثقافة المحلية والرعاية البيئية.',
    },
    relatedCompanySlugs: ['neom', 'qiddiya', 'emirates'],
    relatedRoleSlugs: ['project-manager', 'marketing-manager', 'civil-engineer'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'etisalat',
    name: { en: 'e& (Etisalat)', ar: 'إي آند (اتصالات)' },
    aliases: ['etisalat', 'eand', 'e&'],
    country: { en: 'UAE', ar: 'الإمارات' },
    industry: { en: 'Telecom / Technology', ar: 'الاتصالات / التقنية' },
    about: {
      en: 'e& (Etisalat) is a UAE telecom and technology group. Interviews often cover customer experience, networks, and digital products.',
      ar: 'إي آند (اتصالات) مجموعة اتصالات وتقنية إماراتية. المقابلات تغطي تجربة العميل والشبكات والمنتجات الرقمية.',
    },
    hook: {
      en: 'Show you can improve journeys used by millions daily.',
      ar: 'أظهر أنك تحسّن رحلات يستخدمها الملايين يومياً.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive UAE telecom packages',
      ar: 'حزم اتصالات تنافسية في الإمارات',
    },
    companyQuestions: [
      {
        en: 'How would you reduce churn for a prepaid segment?',
        ar: 'كيف تقلّل فقدان العملاء لشريحة مسبقة الدفع؟',
      },
      {
        en: 'Describe a network or digital incident postmortem you contributed to.',
        ar: 'صف مراجعة حادثة شبكة أو رقمية ساهمت فيها.',
      },
    ],
    cultureTips: {
      en: 'Business professional dress. Prepare bilingual customer examples when possible.',
      ar: 'لباس مهني. حضّر أمثلة عملاء ثنائية اللغة إن أمكن.',
    },
    relatedCompanySlugs: ['du', 'stc', 'ooredoo'],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'sales-executive'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'du',
    name: { en: 'du', ar: 'دو' },
    country: { en: 'UAE', ar: 'الإمارات' },
    industry: { en: 'Telecom', ar: 'الاتصالات' },
    about: {
      en: 'du is a major UAE telecom operator. Interviews reward commercial sharpness and customer-centric problem solving.',
      ar: 'دو مشغّل اتصالات رئيسي في الإمارات. المقابلات تكافئ الحدة التجارية وحل المشكلات بتركيز على العميل.',
    },
    hook: {
      en: 'Bring examples that move ARPU, NPS, or network quality.',
      ar: 'أحضر أمثلة تحرّك الإيراد لكل مستخدم أو الرضا أو جودة الشبكة.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Solid UAE telecom compensation across commercial and tech tracks',
      ar: 'تعويضات اتصالات جيدة في الإمارات للمسارات التجارية والتقنية',
    },
    companyQuestions: [
      {
        en: 'How would you pitch a new family plan in a competitive market?',
        ar: 'كيف تسوّق باقة عائلية جديدة في سوق تنافسي؟',
      },
      {
        en: 'Tell us about simplifying a complex customer process.',
        ar: 'حدّثنا عن تبسيط عملية عميل معقدة.',
      },
    ],
    cultureTips: {
      en: 'Smart professional attire. Keep answers concise and metric-backed.',
      ar: 'لباس مهني أنيق. اجعل إجاباتك موجزة ومدعومة بمؤشرات.',
    },
    relatedCompanySlugs: ['etisalat', 'stc', 'ooredoo'],
    relatedRoleSlugs: ['marketing-manager', 'sales-executive', 'software-engineer'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'flydubai',
    name: { en: 'flydubai', ar: 'فلاي دبي' },
    country: { en: 'UAE', ar: 'الإمارات' },
    industry: { en: 'Aviation', ar: 'الطيران' },
    about: {
      en: 'flydubai is a Dubai-based airline connecting many regional routes. Interviews emphasize safety culture, guest service, and operational reliability.',
      ar: 'فلاي دبي ناقلة مقرها دبي تربط مسارات إقليمية كثيرة. المقابلات تركز على ثقافة السلامة وخدمة الضيف والموثوقية.',
    },
    hook: {
      en: 'Show calm judgment under time pressure.',
      ar: 'أظهر حكماً هادئاً تحت ضغط الوقت.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Aviation packages vary by crew vs corporate track',
      ar: 'حزم الطيران تختلف بين مسار الطاقم والمسار الإداري',
    },
    companyQuestions: [
      {
        en: 'Describe a service recovery that turned a frustrated guest around.',
        ar: 'صف استعادة خدمة حوّلت ضيفاً محبطاً.',
      },
      {
        en: 'How do you stay sharp during irregular operations?',
        ar: 'كيف تبقى حاداً خلال العمليات غير المنتظمة؟',
      },
    ],
    cultureTips: {
      en: 'Grooming and presentation standards are high. Be punctual and polished.',
      ar: 'معايير المظهر عالية. كن دقيقاً في الموعد وأنيقاً.',
    },
    relatedCompanySlugs: ['emirates', 'qatar-airways', 'etisalat'],
    relatedRoleSlugs: ['project-manager', 'marketing-manager', 'hr-manager'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'emirates',
    name: { en: 'Emirates', ar: 'طيران الإمارات' },
    country: { en: 'UAE', ar: 'الإمارات' },
    industry: { en: 'Aviation', ar: 'الطيران' },
    about: {
      en: 'Emirates is a global airline brand based in Dubai. Interviews are structured and brand-conscious—service excellence is non-negotiable.',
      ar: 'طيران الإمارات علامة عالمية مقرها دبي. المقابلات منظمة وواعية بالعلامة—تميز الخدمة غير قابل للتفاوض.',
    },
    hook: {
      en: 'Demonstrate hospitality instincts with commercial awareness.',
      ar: 'أظهر حس ضيافة مع وعي تجاري.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Premium aviation packages; benefits often significant',
      ar: 'حزم طيران مميزة؛ المزايا غالباً مهمة',
    },
    companyQuestions: [
      {
        en: 'How would you protect brand standards during disruption?',
        ar: 'كيف تحمي معايير العلامة أثناء اضطراب تشغيلي؟',
      },
      {
        en: 'Tell us about representing a brand under pressure.',
        ar: 'حدّثنا عن تمثيل علامة تحت الضغط.',
      },
    ],
    cultureTips: {
      en: 'Impeccable presentation. Practice clear, warm communication.',
      ar: 'مظهر متقن. تدرّب على تواصل واضح ودافئ.',
    },
    relatedCompanySlugs: ['flydubai', 'qatar-airways', 'emirates-nbd'],
    relatedRoleSlugs: ['marketing-manager', 'hr-manager', 'project-manager'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'qatar-airways',
    name: { en: 'Qatar Airways', ar: 'الخطوط القطرية' },
    country: { en: 'Qatar', ar: 'قطر' },
    industry: { en: 'Aviation', ar: 'الطيران' },
    about: {
      en: 'Qatar Airways is a leading Gulf carrier. Interviews test composure, service excellence, and global mindset.',
      ar: 'الخطوط القطرية ناقلة خليجية رائدة. المقابلات تختبر رباطة الجأش وتميز الخدمة والعقلية العالمية.',
    },
    hook: {
      en: 'Prepare concrete examples of calm service under pressure.',
      ar: 'حضّر أمثلة ملموسة لخدمة هادئة تحت الضغط.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive Qatar aviation packages with role-specific benefits',
      ar: 'حزم طيران تنافسية في قطر مع مزايا حسب الدور',
    },
    companyQuestions: [
      {
        en: 'How do you handle a difficult passenger while protecting dignity?',
        ar: 'كيف تتعامل مع راكب صعب مع حفظ الكرامة؟',
      },
      {
        en: 'Why Qatar Airways and why Doha as a hub?',
        ar: 'لماذا الخطوط القطرية ولماذا الدوحة كمركز؟',
      },
    ],
    cultureTips: {
      en: 'High grooming standards. Show cultural sensitivity for a global cabin.',
      ar: 'معايير مظهر عالية. أظهر حساسية ثقافية لكابينة عالمية.',
    },
    relatedCompanySlugs: ['emirates', 'flydubai', 'ooredoo'],
    relatedRoleSlugs: ['hr-manager', 'marketing-manager', 'project-manager'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'ooredoo',
    name: { en: 'Ooredoo', ar: 'أوريدو' },
    country: { en: 'Qatar / MENA', ar: 'قطر / الشرق الأوسط' },
    industry: { en: 'Telecom', ar: 'الاتصالات' },
    about: {
      en: 'Ooredoo operates across multiple MENA markets. Interviews often explore multi-market thinking and customer experience.',
      ar: 'أوريدو تعمل في أسواق متعددة بالمنطقة. المقابلات تستكشف التفكير متعدد الأسواق وتجربة العميل.',
    },
    hook: {
      en: 'Show you can localize products without losing brand consistency.',
      ar: 'أظهر أنك توطّن المنتجات دون فقدان اتساق العلامة.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Market-competitive telecom pay by country of hiring',
      ar: 'رواتب اتصالات تنافسية حسب بلد التوظيف',
    },
    companyQuestions: [
      {
        en: 'How would you launch a youth plan differently in two markets?',
        ar: 'كيف تطلق باقة شباب بشكل مختلف في سوقين؟',
      },
      {
        en: 'Describe improving a call-center or app pain point.',
        ar: 'صف تحسين نقطة ألم في مركز اتصال أو تطبيق.',
      },
    ],
    cultureTips: {
      en: 'Professional attire. Multi-country examples are a plus.',
      ar: 'لباس مهني. أمثلة متعددة البلدان ميزة.',
    },
    relatedCompanySlugs: ['etisalat', 'du', 'vodafone-egypt'],
    relatedRoleSlugs: ['marketing-manager', 'sales-executive', 'software-engineer'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'vodafone-egypt',
    name: { en: 'Vodafone Egypt', ar: 'فودافون مصر' },
    aliases: ['vodafone', 'vodafone egypt'],
    country: { en: 'Egypt', ar: 'مصر' },
    industry: { en: 'Telecom', ar: 'الاتصالات' },
    about: {
      en: 'Vodafone Egypt is a major Egyptian telecom brand. Interviews often mix commercial acuity with large-base consumer thinking.',
      ar: 'فودافون مصر علامة اتصالات كبرى. المقابلات تمزج الحدة التجارية وتفكير المستهلك واسع القاعدة.',
    },
    hook: {
      en: 'Use Egypt-scale examples: millions of users, price sensitivity, and speed.',
      ar: 'استخدم أمثلة بحجم مصر: ملايين المستخدمين وحساسية السعر والسرعة.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Competitive Egypt telecom packages; tech and commercial bands differ',
      ar: 'حزم اتصالات تنافسية في مصر؛ نطاقات التقنية والتجاري تختلف',
    },
    companyQuestions: [
      {
        en: 'How would you improve prepaid recharge conversion?',
        ar: 'كيف تحسّن تحويل شحن مسبقة الدفع؟',
      },
      {
        en: 'Tell us about a campaign or feature for value-seeking customers.',
        ar: 'حدّثنا عن حملة أو ميزة لعملاء يبحثون عن القيمة.',
      },
    ],
    cultureTips: {
      en: 'Smart professional dress. Arabic fluency is often expected for customer-facing roles.',
      ar: 'لباس مهني أنيق. الطلاقة العربية متوقعة غالباً للأدوار المواجهة للعميل.',
    },
    relatedCompanySlugs: ['fawry', 'ooredoo', 'stc'],
    relatedRoleSlugs: ['marketing-manager', 'data-scientist', 'sales-executive'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'fawry',
    name: { en: 'Fawry', ar: 'فوري' },
    country: { en: 'Egypt', ar: 'مصر' },
    industry: { en: 'Fintech / Payments', ar: 'التقنية المالية / المدفوعات' },
    about: {
      en: 'Fawry is a leading Egyptian payments network. Interviews value reliability thinking, merchant empathy, and fintech pragmatism.',
      ar: 'فوري شبكة مدفوعات مصرية رائدة. المقابلات تقدّر تفكير الموثوقية وتعاطف التاجر والبراغماتية في التقنية المالية.',
    },
    hook: {
      en: 'Show you understand cash-to-digital transitions in real life.',
      ar: 'أظهر فهمك لانتقال النقد إلى الرقمي في الواقع.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Competitive Egypt fintech packages for product and engineering',
      ar: 'حزم تقنية مالية تنافسية في مصر للمنتج والهندسة',
    },
    companyQuestions: [
      {
        en: 'How would you increase agent or merchant adoption in a new city?',
        ar: 'كيف تزيد تبنّي الوكلاء أو التجار في مدينة جديدة؟',
      },
      {
        en: 'Describe a payments reliability incident and your role.',
        ar: 'صف حادثة موثوقية مدفوعات ودورك فيها.',
      },
    ],
    cultureTips: {
      en: 'Business casual to professional. Concrete Egypt market stories help.',
      ar: 'من غير رسمي أنيق إلى مهني. قصص سوق مصر الملموسة تساعد.',
    },
    relatedCompanySlugs: ['vodafone-egypt', 'careem', 'souq'],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'financial-analyst'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'souq',
    name: { en: 'Souq.com', ar: 'سوق.كوم' },
    aliases: ['souq', 'souq.com', 'amazon.ae'],
    country: { en: 'UAE / MENA', ar: 'الإمارات / الشرق الأوسط' },
    industry: { en: 'E-commerce', ar: 'التجارة الإلكترونية' },
    about: {
      en: 'Souq.com pioneered e-commerce in the region and is part of Amazon’s MENA story. Interviews often probe marketplace fundamentals and customer obsession.',
      ar: 'سوق.كوم ريادة التجارة الإلكترونية في المنطقة وهي جزء من قصة أمازون. المقابلات تختبر أساسيات السوق وهوس العميل.',
    },
    hook: {
      en: 'Think selection, trust, and delivery promises—then practice saying it clearly.',
      ar: 'فكّر في التشكيلة والثقة ووعد التوصيل—ثم تدرّب على قول ذلك بوضوح.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Tech and ops packages aligned with large e-commerce employers',
      ar: 'حزم تقنية وتشغيل متماشية مع كبار أصحاب عمل التجارة الإلكترونية',
    },
    companyQuestions: [
      {
        en: 'How would you improve seller quality without slowing selection growth?',
        ar: 'كيف تحسّن جودة البائعين دون إبطاء نمو التشكيلة؟',
      },
      {
        en: 'Describe a metric you watched weekly in a marketplace role.',
        ar: 'صف مقياساً راقبته أسبوعياً في دور سوق.',
      },
    ],
    cultureTips: {
      en: 'Customer stories with numbers beat buzzwords. Smart professional attire.',
      ar: 'قصص العميل مع أرقام أفضل من الشعارات. لباس مهني أنيق.',
    },
    relatedCompanySlugs: ['noon', 'careem', 'talabat'],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'data-scientist'],
    publishedAt: PUBLISHED,
  },
];

/** Phase 1 — top 10 roles. */
export const GUIDE_ROLES: GuideRole[] = [
  {
    slug: 'software-engineer',
    name: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
    coachRoleId: 'software-engineer',
    about: {
      en: 'Software engineering interviews in MENA mix coding fundamentals, system design for regional scale, and collaboration stories.',
      ar: 'مقابلات هندسة البرمجيات في المنطقة تمزج أساسيات البرمجة وتصميم الأنظمة للحجم الإقليمي وقصص التعاون.',
    },
    hook: {
      en: 'Employers want engineers who ship reliably—and explain trade-offs clearly.',
      ar: 'أصحاب العمل يريدون مهندسين يسلّمون بموثوقية—ويشرحون المفاضلات بوضوح.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Wide band: often AED/SAR mid-level tech ranges; senior roles higher in UAE/KSA hubs',
      ar: 'نطاق واسع: غالباً نطاقات تقنية متوسطة بالدرهم/الريال؛ أعلى في مراكز الإمارات والسعودية',
    },
    questions: [
      { en: 'Walk me through a system you designed and the trade-offs you made.', ar: 'اسرد نظاماً صمّمته والمفاضلات التي اتخذتها.' },
      { en: 'How do you debug a production incident under time pressure?', ar: 'كيف تفحص حادثة إنتاج تحت ضغط الوقت؟' },
      { en: 'Explain a time you improved performance or reliability.', ar: 'اشرح مرة حسّنت فيها الأداء أو الموثوقية.' },
      { en: 'How do you review code and give feedback respectfully?', ar: 'كيف تراجع الكود وتعطي ملاحظات باحترام؟' },
      { en: 'What would you build differently if you restarted your last project?', ar: 'ماذا ستبني بشكل مختلف لو أعدت مشروعك الأخير؟' },
      { en: 'How do you learn a new stack quickly in a MENA product team?', ar: 'كيف تتعلّم تقنية جديدة بسرعة في فريق منتج بالمنطقة؟' },
      { en: 'Tell us about collaborating with product and design under ambiguity.', ar: 'حدّثنا عن التعاون مع المنتج والتصميم تحت الغموض.' },
    ],
    answerTips: {
      en: 'Use STAR for behavioral answers. For technical answers, state assumptions, outline approach, then dive into complexity and failure modes.',
      ar: 'استخدم STAR للإجابات السلوكية. للتقنية: اذكر الافتراضات، ارسم النهج، ثم انتقل للتعقيد وأنماط الفشل.',
    },
    cultureTips: {
      en: 'Smart casual is common in startups; more formal for banks and telecom. Be ready to interview in English with Arabic rapport.',
      ar: 'غير رسمي أنيق شائع في الشركات الناشئة؛ أكثر رسمية في البنوك والاتصالات. استعد للمقابلة بالإنجليزية مع تواصل عربي.',
    },
    titleMatchers: ['software', 'engineer', 'developer', 'backend', 'frontend', 'full stack', 'fullstack'],
    relatedRoleSlugs: ['data-scientist', 'product-manager', 'project-manager'],
    relatedCompanySlugs: ['careem', 'noon', 'stc'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'data-scientist',
    name: { en: 'Data Scientist', ar: 'عالم بيانات' },
    coachRoleId: 'data-analyst',
    about: {
      en: 'Data science interviews test statistics, experimentation, SQL/Python fluency, and business translation for MENA growth problems.',
      ar: 'مقابلات علم البيانات تختبر الإحصاء والتجارب وSQL/Python وترجمة الأعمال لمشكلات نمو المنطقة.',
    },
    hook: {
      en: 'Win by connecting models to decisions leaders actually make.',
      ar: 'اربح بربط النماذج بقرارات يتخذها القادة فعلاً.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Often above general analyst bands in UAE/KSA tech hubs',
      ar: 'غالباً فوق نطاقات المحلل العام في مراكز التقنية بالإمارات والسعودية',
    },
    questions: [
      { en: 'Walk through an experiment you designed and its result.', ar: 'اسرد تجربة صمّمتها ونتيجتها.' },
      { en: 'How do you handle messy real-world data?', ar: 'كيف تتعامل مع بيانات واقعية فوضوية؟' },
      { en: 'Explain a model to a non-technical stakeholder.', ar: 'اشرح نموذجاً لصاحب مصلحة غير تقني.' },
      { en: 'When is a simple heuristic better than a complex model?', ar: 'متى يكون استدلال بسيط أفضل من نموذج معقد؟' },
      { en: 'How do you measure model drift after launch?', ar: 'كيف تقيس انحراف النموذج بعد الإطلاق؟' },
      { en: 'Describe a metric you would use for a MENA marketplace.', ar: 'صف مقياساً تستخدمه لسوق في المنطقة.' },
    ],
    answerTips: {
      en: 'State the business question first, then data, method, validation, and decision impact. Avoid jargon without payoff.',
      ar: 'ابدأ بسؤال العمل ثم البيانات والطريقة والتحقق وأثر القرار. تجنّب المصطلحات بلا فائدة.',
    },
    cultureTips: {
      en: 'Bring a portfolio narrative. English technical depth + Arabic business storytelling is a strong combo.',
      ar: 'أحضر سرداً لمحفظتك. عمق تقني بالإنجليزية + سرد أعمال بالعربية مزيج قوي.',
    },
    titleMatchers: ['data scientist', 'data science', 'machine learning', 'ml engineer', 'ai engineer'],
    relatedRoleSlugs: ['software-engineer', 'product-manager', 'financial-analyst'],
    relatedCompanySlugs: ['careem', 'noon', 'vodafone-egypt'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'product-manager',
    name: { en: 'Product Manager', ar: 'مدير منتج' },
    coachRoleId: 'product-manager',
    about: {
      en: 'PM interviews in MENA probe prioritization, discovery, stakeholder management, and Arabic/English user empathy.',
      ar: 'مقابلات مدير المنتج تختبر تحديد الأولويات والاكتشاف وإدارة أصحاب المصلحة وتعاطف المستخدم بالعربية والإنجليزية.',
    },
    hook: {
      en: 'Show taste, judgment, and shipping discipline—not only frameworks.',
      ar: 'أظهر ذوقاً وحكماً وانضباط تسليم—لا أطراً فقط.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive PM bands in Gulf tech; equity more common at startups',
      ar: 'نطاقات مدير منتج تنافسية في تقنية الخليج؛ الأسهم أشيع في الشركات الناشئة',
    },
    questions: [
      { en: 'How do you prioritize a roadmap with limited engineering capacity?', ar: 'كيف ترتّب خارطة طريق بسعة هندسية محدودة؟' },
      { en: 'Tell us about a product bet that failed and what you learned.', ar: 'حدّثنا عن رهان منتج فشل وما تعلّمته.' },
      { en: 'How would you improve retention for a MENA consumer app?', ar: 'كيف تحسّن الاحتفاظ بتطبيق استهلاكي في المنطقة؟' },
      { en: 'Describe writing a PRD that actually got built.', ar: 'صف كتابة مواصفات منتج بُنيت فعلاً.' },
      { en: 'How do you say no to a senior stakeholder?', ar: 'كيف ترفض طلب صاحب مصلحة كبير؟' },
      { en: 'What metrics would you watch weekly for your last product?', ar: 'ما المقاييس التي تراقبها أسبوعياً لمنتجك الأخير؟' },
    ],
    answerTips: {
      en: 'Structure: problem → users → options → decision → metrics → learnings. Quantify impact.',
      ar: 'البنية: المشكلة → المستخدمون → الخيارات → القرار → المقاييس → الدروس. رقّم الأثر.',
    },
    cultureTips: {
      en: 'Smart casual in tech; more formal with banks. Practice bilingual product narratives.',
      ar: 'غير رسمي أنيق في التقنية؛ أكثر رسمية مع البنوك. تدرّب على سرد منتج ثنائي اللغة.',
    },
    titleMatchers: ['product manager', 'product owner', 'pm '],
    relatedRoleSlugs: ['software-engineer', 'data-scientist', 'marketing-manager'],
    relatedCompanySlugs: ['careem', 'noon', 'talabat'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'project-manager',
    name: { en: 'Project Manager', ar: 'مدير مشاريع' },
    coachRoleId: 'project-manager',
    about: {
      en: 'Project managers in MENA often run cross-vendor delivery across construction, digital, and enterprise programs.',
      ar: 'مديرو المشاريع في المنطقة يديرون غالباً تسليماً متعدد الموردين عبر البناء والرقمي وبرامج المؤسسات.',
    },
    hook: {
      en: 'Prove you can move work forward when requirements shift.',
      ar: 'أثبت أنك تحرّك العمل حين تتغير المتطلبات.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Varies by industry; megaproject and banking PMs often above market median',
      ar: 'يختلف حسب القطاع؛ مديرو مشاريع المشاريع الكبرى والبنوك غالباً فوق المتوسط',
    },
    questions: [
      { en: 'How do you recover a red project?', ar: 'كيف تستعيد مشروعاً أحمر؟' },
      { en: 'Describe managing scope creep with a powerful sponsor.', ar: 'صف إدارة زحف النطاق مع راعٍ قوي.' },
      { en: 'Which project artifacts do you refuse to skip?', ar: 'أي وثائق مشروع ترفض تجاوزها؟' },
      { en: 'How do you align vendors on a shared milestone plan?', ar: 'كيف توحّد الموردين على خطة معالم مشتركة؟' },
      { en: 'Tell us about a risk you escalated early.', ar: 'حدّثنا عن مخاطرة صعّدتها مبكراً.' },
      { en: 'How do you communicate bad news to leadership?', ar: 'كيف توصل أخباراً سيئة للقيادة؟' },
    ],
    answerTips: {
      en: 'Lead with outcomes, timeline, blockers, and decisions. Mention tools only after the story.',
      ar: 'ابدأ بالنتائج والجدول والعوائق والقرارات. اذكر الأدوات بعد القصة.',
    },
    cultureTips: {
      en: 'Business formal is safer for megaproject and bank interviews.',
      ar: 'اللباس الرسمي أكثر أماناً لمقابلات المشاريع الكبرى والبنوك.',
    },
    titleMatchers: ['project manager', 'program manager', 'pmo', 'delivery manager'],
    relatedRoleSlugs: ['civil-engineer', 'product-manager', 'hr-manager'],
    relatedCompanySlugs: ['neom', 'qiddiya', 'aramco'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'civil-engineer',
    name: { en: 'Civil Engineer', ar: 'مهندس مدني' },
    coachRoleId: 'civil-engineer',
    about: {
      en: 'Civil engineering interviews in the Gulf emphasize codes, site realities, safety, and coordination with consultants and contractors.',
      ar: 'مقابلات الهندسة المدنية في الخليج تركز على الأكواد وواقع الموقع والسلامة والتنسيق مع الاستشاريين والمقاولين.',
    },
    hook: {
      en: 'Bring site stories with quantities, standards, and safety outcomes.',
      ar: 'أحضر قصص موقع بكميات ومعايير ونتائج سلامة.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Strong demand on KSA megaprojects; packages depend on grade and site vs office',
      ar: 'طلب قوي على مشاريع السعودية الكبرى؛ الحزم تعتمد على الدرجة وموقع/مكتب',
    },
    questions: [
      { en: 'Walk through a design or site issue you resolved.', ar: 'اسرد مشكلة تصميم أو موقع حللتها.' },
      { en: 'How do you ensure HSE compliance with subcontractors?', ar: 'كيف تضمن امتثال السلامة مع المقاولين من الباطن؟' },
      { en: 'Describe coordinating drawings across disciplines.', ar: 'صف تنسيق الرسومات عبر التخصصات.' },
      { en: 'What codes or standards do you use most often?', ar: 'ما الأكواد أو المعايير التي تستخدمها غالباً؟' },
      { en: 'Tell us about a delay you helped recover.', ar: 'حدّثنا عن تأخير ساعدت في استعادته.' },
      { en: 'How do you communicate technical risk to a client?', ar: 'كيف توصل المخاطر التقنية لعميل؟' },
    ],
    answerTips: {
      en: 'Be specific: drawings, RFIs, quantities, and approvals. Safety stories should show judgment, not slogans.',
      ar: 'كن محدداً: الرسومات والاستفسارات والكميات والموافقات. قصص السلامة يجب أن تُظهر حكماً لا شعارات.',
    },
    cultureTips: {
      en: 'PPE mindset for site roles; formal for consultant interviews. Arabic site communication is often essential.',
      ar: 'عقلية معدات السلامة لأدوار الموقع؛ رسمي لمقابلات الاستشاريين. التواصل العربي في الموقع غالباً أساسي.',
    },
    titleMatchers: ['civil engineer', 'structural', 'site engineer', 'civil'],
    relatedRoleSlugs: ['project-manager', 'software-engineer', 'hr-manager'],
    relatedCompanySlugs: ['neom', 'qiddiya', 'aramco'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'marketing-manager',
    name: { en: 'Marketing Manager', ar: 'مدير تسويق' },
    coachRoleId: 'marketing-manager',
    about: {
      en: 'Marketing interviews in MENA test channel mix, bilingual creatives, performance literacy, and cultural timing (Ramadan, National Day, etc.).',
      ar: 'مقابلات التسويق تختبر مزيج القنوات والإبداع ثنائي اللغة وفهم الأداء والتوقيت الثقافي (رمضان، اليوم الوطني...).',
    },
    hook: {
      en: 'Show campaigns that moved CAC, ROAS, or brand lift—not vanity metrics alone.',
      ar: 'أظهر حملات حرّكت تكلفة الاكتساب أو العائد أو رفع العلامة—لا مقاييس تفاخر فقط.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Wide range across agency vs in-house; Gulf tech often pays a premium',
      ar: 'نطاق واسع بين الوكالة وداخل الشركة؛ تقنية الخليج غالباً أعلى',
    },
    questions: [
      { en: 'Walk through a campaign from brief to results.', ar: 'اسرد حملة من الموجز إلى النتائج.' },
      { en: 'How do you localize creative for Arabic and English audiences?', ar: 'كيف توطّن الإبداع لجمهور عربي وإنجليزي؟' },
      { en: 'What is your framework for channel budget allocation?', ar: 'ما إطارك لتوزيع ميزانية القنوات؟' },
      { en: 'Tell us about a campaign that underperformed and your fix.', ar: 'حدّثنا عن حملة ضعفت وأصلحتها.' },
      { en: 'How would you plan a Ramadan push for a consumer brand?', ar: 'كيف تخطط لحملة رمضان لعلامة استهلاكية؟' },
      { en: 'Which metrics do you refuse to optimize blindly?', ar: 'أي مقاييس ترفض تحسينها بشكل أعمى؟' },
    ],
    answerTips: {
      en: 'Lead with objective, audience, insight, execution, and measured outcome. Mention tools second.',
      ar: 'ابدأ بالهدف والجمهور والرؤية والتنفيذ والنتيجة المقاسة. اذكر الأدوات ثانياً.',
    },
    cultureTips: {
      en: 'Smart professional look. Bring bilingual portfolio examples when possible.',
      ar: 'مظهر مهني أنيق. أحضر أمثلة محفظة ثنائية اللغة إن أمكن.',
    },
    titleMatchers: ['marketing manager', 'growth marketing', 'brand manager', 'performance marketing'],
    relatedRoleSlugs: ['sales-executive', 'product-manager', 'data-scientist'],
    relatedCompanySlugs: ['careem', 'noon', 'vodafone-egypt'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'sales-executive',
    name: { en: 'Sales Executive', ar: 'مسؤول مبيعات' },
    coachRoleId: 'sales-executive',
    about: {
      en: 'Sales interviews focus on pipeline discipline, discovery questions, objection handling, and relationship building across MENA markets.',
      ar: 'مقابلات المبيعات تركز على انضباط الخطوط وأسيدة الاكتشاف ومعالجة الاعتراضات وبناء العلاقات عبر أسواق المنطقة.',
    },
    hook: {
      en: 'Quantify wins: quota, cycle time, win rate, and deal size.',
      ar: 'رقّم الإنجازات: الحصة وزمن الدورة ونسبة الفوز وحجم الصفقة.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Base + commission common; OTE varies heavily by industry',
      ar: 'أساسي + عمولة شائع؛ الإجمالي المستهدف يختلف كثيراً حسب القطاع',
    },
    questions: [
      { en: 'Walk me through your sales process from lead to close.', ar: 'اسرد عملية مبيعاتك من العميل المحتمل إلى الإغلاق.' },
      { en: 'How do you handle price objections in a competitive bid?', ar: 'كيف تتعامل مع اعتراض السعر في عرض تنافسي؟' },
      { en: 'Tell us about a deal you lost and what changed afterward.', ar: 'حدّثنا عن صفقة خسرتها وما تغيّر بعدها.' },
      { en: 'How do you multi-thread stakeholders in enterprise deals?', ar: 'كيف تتواصل مع عدة أصحاب مصلحة في صفقات المؤسسات؟' },
      { en: 'What CRM hygiene habits do you keep weekly?', ar: 'ما عادات نظافة نظام إدارة العملاء الأسبوعية لديك؟' },
      { en: 'How would you enter a new Gulf city or vertical?', ar: 'كيف تدخل مدينة خليجية أو قطاعاً جديداً؟' },
    ],
    answerTips: {
      en: 'Use real numbers. Show discovery before pitching. End with mutual next steps.',
      ar: 'استخدم أرقاماً حقيقية. أظهر الاكتشاف قبل العرض. اختم بخطوات تالية مشتركة.',
    },
    cultureTips: {
      en: 'Business formal for enterprise; smart casual for startups. Relationship warmth matters in the region.',
      ar: 'رسمي للمؤسسات؛ غير رسمي أنيق للشركات الناشئة. دفء العلاقة مهم في المنطقة.',
    },
    titleMatchers: ['sales', 'account executive', 'account manager', 'business development'],
    relatedRoleSlugs: ['marketing-manager', 'product-manager', 'financial-analyst'],
    relatedCompanySlugs: ['stc', 'etisalat', 'talabat'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'financial-analyst',
    name: { en: 'Financial Analyst', ar: 'محلل مالي' },
    coachRoleId: 'finance-analyst',
    about: {
      en: 'Financial analyst interviews test modeling hygiene, variance analysis, storytelling with numbers, and comfort with ambiguity.',
      ar: 'مقابلات المحلل المالي تختبر نظافة النماذج وتحليل الفروقات والسرد بالأرقام والراحة مع الغموض.',
    },
    hook: {
      en: 'Be the person who makes numbers decision-ready.',
      ar: 'كن من يجعل الأرقام جاهزة للقرار.',
    },
    difficulty: 4,
    salaryHint: {
      en: 'Competitive in banking and large corporates across KSA/UAE',
      ar: 'تنافسي في البنوك والشركات الكبرى عبر السعودية والإمارات',
    },
    questions: [
      { en: 'Walk through a model you built and how it was used.', ar: 'اسرد نموذجاً بنيته وكيف استُخدم.' },
      { en: 'How do you investigate a surprising variance?', ar: 'كيف تفحص فرقاً مفاجئاً؟' },
      { en: 'Explain a financial concept to a non-finance leader.', ar: 'اشرح مفهوماً مالياً لقائد غير مالي.' },
      { en: 'What makes a forecast trustworthy?', ar: 'ما الذي يجعل التوقعات موثوقة؟' },
      { en: 'Tell us about a recommendation that changed spend.', ar: 'حدّثنا عن توصية غيّرت إنفاقاً.' },
      { en: 'How do you prioritize when every team wants analysis ASAP?', ar: 'كيف ترتّب الأولويات حين يريد كل فريق تحليلاً فوراً؟' },
    ],
    answerTips: {
      en: 'Show assumptions, sensitivity, and the decision your analysis enabled. Accuracy beats flashy charts.',
      ar: 'أظهر الافتراضات والحساسية والقرار الذي مكّنه تحليلك. الدقة أفضل من الرسوم المبهرجة.',
    },
    cultureTips: {
      en: 'Business formal for banks. Prepare Excel/case comfort and clean communication.',
      ar: 'رسمي للبنوك. حضّر راحة Excel/الحالات وتواصلاً نظيفاً.',
    },
    titleMatchers: ['financial analyst', 'finance analyst', 'fp&a', 'financial analysis'],
    relatedRoleSlugs: ['data-scientist', 'product-manager', 'sales-executive'],
    relatedCompanySlugs: ['al-rajhi-bank', 'emirates-nbd', 'aramco'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'hr-manager',
    name: { en: 'HR Manager', ar: 'مدير موارد بشرية' },
    coachRoleId: 'hr-specialist',
    about: {
      en: 'HR manager interviews cover hiring systems, employee relations, localization policies, and culture building across diverse MENA teams.',
      ar: 'مقابلات مدير الموارد البشرية تغطي أنظمة التوظيف وعلاقات الموظفين وسياسات التوطين وبناء الثقافة عبر فرق متنوعة.',
    },
    hook: {
      en: 'Show judgment on people issues with fairness and business sense.',
      ar: 'أظهر حكماً في قضايا الأفراد بعدل وحس أعمال.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Varies by company size; premium in large corporates and aviation',
      ar: 'يختلف حسب حجم الشركة؛ أعلى في الشركات الكبرى والطيران',
    },
    questions: [
      { en: 'How do you improve quality of hire without slowing the business?', ar: 'كيف تحسّن جودة التوظيف دون إبطاء العمل؟' },
      { en: 'Describe handling a sensitive employee relations case.', ar: 'صف التعامل مع حالة علاقات موظفين حساسة.' },
      { en: 'How do you partner with hiring managers who want shortcuts?', ar: 'كيف تتشارك مع مديري توظيف يريدون اختصارات؟' },
      { en: 'What people metrics do you review monthly?', ar: 'ما مقاييس الأفراد التي تراجعها شهرياً؟' },
      { en: 'Tell us about building an onboarding that stuck.', ar: 'حدّثنا عن بناء انضمام ثبت أثره.' },
      { en: 'How do you approach Saudization / Emiratization goals responsibly?', ar: 'كيف تقارب أهداف التوطين بمسؤولية؟' },
    ],
    answerTips: {
      en: 'Balance empathy with policy and business outcomes. Confidentiality matters—share patterns, not gossip.',
      ar: 'وازن التعاطف مع السياسة ونتائج العمل. السرية مهمة—شارك الأنماط لا الشائعات.',
    },
    cultureTips: {
      en: 'Professional attire. Demonstrate cultural fluency across nationalities common in Gulf workplaces.',
      ar: 'لباس مهني. أظهر طلاقة ثقافية عبر الجنسيات الشائعة في أماكن عمل الخليج.',
    },
    titleMatchers: ['hr manager', 'human resources', 'people manager', 'talent', 'hrbp'],
    relatedRoleSlugs: ['project-manager', 'sales-executive', 'marketing-manager'],
    relatedCompanySlugs: ['emirates', 'stc', 'neom'],
    publishedAt: PUBLISHED,
  },
  {
    slug: 'nurse',
    name: { en: 'Nurse', ar: 'ممرض / ممرضة' },
    coachRoleId: 'nurse',
    about: {
      en: 'Nursing interviews in MENA focus on patient safety, clinical judgment, teamwork, and compassion under pressure.',
      ar: 'مقابلات التمريض تركز على سلامة المريض والحكم السريري والعمل الجماعي والتعاطف تحت الضغط.',
    },
    hook: {
      en: 'Your calm bedside judgment is the story—back it with clinical detail.',
      ar: 'حكمك الهادئ بجانب السرير هو القصة—ادعمه بتفاصيل سريرية.',
    },
    difficulty: 3,
    salaryHint: {
      en: 'Varies by country, facility, and specialty; Gulf packages often include housing/benefits',
      ar: 'يختلف حسب البلد والمنشأة والتخصص؛ حزم الخليج غالباً تشمل سكناً/مزايا',
    },
    questions: [
      { en: 'Describe a time you advocated for a patient.', ar: 'صف مرة دافعت فيها عن مريض.' },
      { en: 'How do you prioritize during a busy shift?', ar: 'كيف ترتّب الأولويات في وردية مزدحمة؟' },
      { en: 'Tell us about a medication or safety near-miss.', ar: 'حدّثنا عن حادثة دواء أو سلامة كادت تحدث.' },
      { en: 'How do you communicate with anxious families?', ar: 'كيف تتواصل مع عائلات قلقة؟' },
      { en: 'What infection-control habits do you never skip?', ar: 'ما عادات مكافحة العدوى التي لا تتجاوزها؟' },
      { en: 'How do you handle conflict within a clinical team?', ar: 'كيف تتعامل مع خلاف داخل فريق سريري؟' },
    ],
    answerTips: {
      en: 'Use clinical specificity: assessment, action, escalation, outcome. Empathy without losing protocol.',
      ar: 'استخدم تحديداً سريرياً: التقييم والإجراء والتصعيد والنتيجة. تعاطف دون فقدان البروتوكول.',
    },
    cultureTips: {
      en: 'Clean professional presentation. Cultural and gender sensitivity with patients is essential in the region.',
      ar: 'مظهر مهني نظيف. الحساسية الثقافية والجندرية مع المرضى أساسية في المنطقة.',
    },
    titleMatchers: ['nurse', 'nursing', 'rn ', 'staff nurse'],
    relatedRoleSlugs: ['hr-manager', 'project-manager', 'sales-executive'],
    relatedCompanySlugs: ['emirates', 'neom', 'stc'],
    publishedAt: PUBLISHED,
  },
];

const companyBySlug = new Map(GUIDE_COMPANIES.map((c) => [c.slug, c]));
const roleBySlug = new Map(GUIDE_ROLES.map((r) => [r.slug, r]));

export function getGuideCompany(slug: string): GuideCompany | null {
  return companyBySlug.get(slug) ?? null;
}

export function getGuideRole(slug: string): GuideRole | null {
  return roleBySlug.get(slug) ?? null;
}

export function allGuideCompanySlugs(): string[] {
  return GUIDE_COMPANIES.map((c) => c.slug);
}

export function allGuideRoleSlugs(): string[] {
  return GUIDE_ROLES.map((r) => r.slug);
}

export function pickRelatedCompanies(slugs: string[], exclude?: string): GuideCompany[] {
  return slugs
    .filter((s) => s !== exclude)
    .map((s) => companyBySlug.get(s))
    .filter((c): c is GuideCompany => Boolean(c))
    .slice(0, 3);
}

export function pickRelatedRoles(slugs: string[], exclude?: string): GuideRole[] {
  return slugs
    .filter((s) => s !== exclude)
    .map((s) => roleBySlug.get(s))
    .filter((r): r is GuideRole => Boolean(r))
    .slice(0, 3);
}
