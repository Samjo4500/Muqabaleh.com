import type { Bi } from '@/components/landing/crystal/copy';

export type JobType = 'fulltime' | 'contract' | 'remote';
export type JobDept = 'product' | 'engineering' | 'design' | 'people' | 'data' | 'sales';

export type JobListing = {
  id: string;
  title: Bi;
  company: Bi;
  location: Bi;
  city: 'dubai' | 'riyadh' | 'cairo' | 'remote' | 'doha';
  type: JobType;
  typeLabel: Bi;
  dept: JobDept;
  salary: Bi;
  tags: Bi[];
  featured?: boolean;
  posted: Bi;
  blurb: Bi;
  match: number;
};

export const JOBS_COPY = {
  kicker: { en: 'Muqabaleh Jobs', ar: 'وظائف مقابلة' } as Bi,
  title: {
    en: 'Browse roles. Apply with proof.',
    ar: 'تصفح الوظائف. وقدّم بإثبات.',
  } as Bi,
  subtitle: {
    en: 'Verified openings across MENA. Apply with your interview score — not just a CV.',
    ar: 'فرص موثّقة عبر المنطقة. قدّم بدرجة مقابلتك — لا بسيرة ذاتية فقط.',
  } as Bi,
  searchPlaceholder: {
    en: 'Search role, company, or skill…',
    ar: 'ابحث عن وظيفة، شركة، أو مهارة…',
  } as Bi,
  searchCta: { en: 'Find roles', ar: 'اعثر على وظائف' } as Bi,
  all: { en: 'All', ar: 'الكل' } as Bi,
  filters: {
    type: { en: 'Type', ar: 'النوع' } as Bi,
    location: { en: 'Location', ar: 'الموقع' } as Bi,
    department: { en: 'Field', ar: 'المجال' } as Bi,
  },
  types: {
    fulltime: { en: 'Full-time', ar: 'دوام كامل' } as Bi,
    contract: { en: 'Contract', ar: 'تعاقد' } as Bi,
    remote: { en: 'Remote', ar: 'عن بُعد' } as Bi,
  },
  locations: {
    dubai: { en: 'Dubai', ar: 'دبي' } as Bi,
    riyadh: { en: 'Riyadh', ar: 'الرياض' } as Bi,
    cairo: { en: 'Cairo', ar: 'القاهرة' } as Bi,
    doha: { en: 'Doha', ar: 'الدوحة' } as Bi,
    remote: { en: 'Remote MENA', ar: 'عن بُعد · المنطقة' } as Bi,
  },
  depts: {
    product: { en: 'Product', ar: 'منتج' } as Bi,
    engineering: { en: 'Engineering', ar: 'هندسة' } as Bi,
    design: { en: 'Design', ar: 'تصميم' } as Bi,
    people: { en: 'People / HR', ar: 'موارد بشرية' } as Bi,
    data: { en: 'Data', ar: 'بيانات' } as Bi,
    sales: { en: 'Sales', ar: 'مبيعات' } as Bi,
  },
  results: { en: 'open roles', ar: 'فرصة مفتوحة' } as Bi,
  featured: { en: 'Featured', ar: 'مميزة' } as Bi,
  match: { en: 'Match', ar: 'توافق' } as Bi,
  apply: { en: 'Apply with score', ar: 'قدّم بالدرجة' } as Bi,
  viewPrep: { en: 'Prepare first', ar: 'تدرّب أولاً' } as Bi,
  emptyTitle: { en: 'No roles match that filter', ar: 'لا توجد وظائف مطابقة' } as Bi,
  emptyBody: {
    en: 'Widen your search — or start a free interview while new roles land.',
    ar: 'وسّع نطاق البحث — أو ابدأ مقابلة مجانية بينما تُضاف فرص جديدة.',
  } as Bi,
  trust: [
    { en: 'Verified employers', ar: 'أصحاب عمل موثّقون' },
    { en: 'Score-based apply', ar: 'تقديم بدرجة المقابلة' },
    { en: 'Arabic & English', ar: 'عربية وإنجليزية' },
  ] as Bi[],
  ctaTitle: {
    en: 'Walk in ready. Get discovered.',
    ar: 'ادخل مستعداً. ودع الشركات تكتشفك.',
  } as Bi,
  ctaBody: {
    en: 'Practice with AI, then apply with a score employers already trust.',
    ar: 'تدرّب مع الذكاء الاصطناعي، ثم قدّم بدرجة يثق بها أصحاب العمل.',
  } as Bi,
  ctaInterview: { en: 'Start free interview', ar: 'ابدأ مقابلة مجانية' } as Bi,
  ctaHire: { en: "I'm hiring", ar: 'أنا أوظّف' } as Bi,
};

export const JOBS: JobListing[] = [
  {
    id: 'pm-growth-labs',
    title: { en: 'Senior Product Manager', ar: 'مدير منتجات أول' },
    company: { en: 'Growth Labs', ar: 'Growth Labs' },
    location: { en: 'Dubai · Hybrid', ar: 'دبي · هجين' },
    city: 'dubai',
    type: 'fulltime',
    typeLabel: JOBS_COPY.types.fulltime,
    dept: 'product',
    salary: { en: 'AED 28–35k / mo', ar: '٢٨–٣٥ ألف درهم / شهرياً' },
    tags: [
      { en: 'B2B SaaS', ar: 'برمجيات B2B' },
      { en: 'Arabic market', ar: 'سوق عربي' },
    ],
    featured: true,
    posted: { en: '2 days ago', ar: 'منذ يومين' },
    blurb: {
      en: 'Own discovery-to-launch for MENA growth products. Ship with design & eng weekly.',
      ar: 'قد دورة المنتج من الاكتشاف إلى الإطلاق لأسواق المنطقة. أطلق مع التصميم والهندسة أسبوعياً.',
    },
    match: 92,
  },
  {
    id: 'fe-northstar',
    title: { en: 'Software Engineer (Frontend)', ar: 'مهندس برمجيات (واجهات)' },
    company: { en: 'Northstar Tech', ar: 'Northstar Tech' },
    location: { en: 'Riyadh · On-site', ar: 'الرياض · حضوري' },
    city: 'riyadh',
    type: 'fulltime',
    typeLabel: JOBS_COPY.types.fulltime,
    dept: 'engineering',
    salary: { en: 'SAR 22–30k / mo', ar: '٢٢–٣٠ ألف ريال / شهرياً' },
    tags: [
      { en: 'React', ar: 'React' },
      { en: 'TypeScript', ar: 'TypeScript' },
    ],
    featured: true,
    posted: { en: 'Yesterday', ar: 'أمس' },
    blurb: {
      en: 'Build glass-smooth hiring experiences used by thousands of candidates daily.',
      ar: 'ابنِ تجارب توظيف سلسة يستخدمها آلاف المرشحين يومياً.',
    },
    match: 88,
  },
  {
    id: 'hrbp-apex',
    title: { en: 'HR Business Partner', ar: 'شريك موارد بشرية' },
    company: { en: 'Apex Talent', ar: 'Apex Talent' },
    location: { en: 'Remote · MENA', ar: 'عن بُعد · المنطقة' },
    city: 'remote',
    type: 'contract',
    typeLabel: JOBS_COPY.types.contract,
    dept: 'people',
    salary: { en: 'USD 4–6k / mo', ar: '٤–٦ آلاف دولار / شهرياً' },
    tags: [
      { en: 'Talent', ar: 'مواهب' },
      { en: 'Coaching', ar: 'توجيه' },
    ],
    posted: { en: '4 days ago', ar: 'منذ ٤ أيام' },
    blurb: {
      en: 'Partner with scale-ups on interview loops, scorecards, and offer strategy.',
      ar: 'شارك الشركات الناشئة في حلقات المقابلات، بطاقات التقييم، واستراتيجية العروض.',
    },
    match: 84,
  },
  {
    id: 'ux-mirage',
    title: { en: 'Product Designer', ar: 'مصمم منتجات' },
    company: { en: 'Mirage Studio', ar: 'Mirage Studio' },
    location: { en: 'Cairo · Hybrid', ar: 'القاهرة · هجين' },
    city: 'cairo',
    type: 'fulltime',
    typeLabel: JOBS_COPY.types.fulltime,
    dept: 'design',
    salary: { en: 'EGP 55–75k / mo', ar: '٥٥–٧٥ ألف جنيه / شهرياً' },
    tags: [
      { en: 'Design systems', ar: 'أنظمة تصميم' },
      { en: 'RTL', ar: 'RTL' },
    ],
    posted: { en: '1 week ago', ar: 'منذ أسبوع' },
    blurb: {
      en: 'Craft bilingual interfaces for talent platforms — Arabic-first, English-ready.',
      ar: 'صمّم واجهات ثنائية اللغة لمنصات المواهب — عربية أولاً، جاهزة للإنجليزية.',
    },
    match: 81,
  },
  {
    id: 'de-lumen',
    title: { en: 'Data Analyst', ar: 'محلل بيانات' },
    company: { en: 'Lumen Insights', ar: 'Lumen Insights' },
    location: { en: 'Doha · Hybrid', ar: 'الدوحة · هجين' },
    city: 'doha',
    type: 'fulltime',
    typeLabel: JOBS_COPY.types.fulltime,
    dept: 'data',
    salary: { en: 'QAR 14–18k / mo', ar: '١٤–١٨ ألف ريال قطري / شهرياً' },
    tags: [
      { en: 'SQL', ar: 'SQL' },
      { en: 'Dashboards', ar: 'لوحات متابعة' },
    ],
    posted: { en: '3 days ago', ar: 'منذ ٣ أيام' },
    blurb: {
      en: 'Turn hiring funnel data into decisions hiring managers actually use.',
      ar: 'حوّل بيانات مسار التوظيف إلى قرارات يستخدمها مديرو التوظيف فعلاً.',
    },
    match: 79,
  },
  {
    id: 'be-orbit',
    title: { en: 'Backend Engineer', ar: 'مهندس خلفية' },
    company: { en: 'Orbit Pay', ar: 'Orbit Pay' },
    location: { en: 'Dubai · Remote-friendly', ar: 'دبي · مرن عن بُعد' },
    city: 'dubai',
    type: 'remote',
    typeLabel: JOBS_COPY.types.remote,
    dept: 'engineering',
    salary: { en: 'AED 25–32k / mo', ar: '٢٥–٣٢ ألف درهم / شهرياً' },
    tags: [
      { en: 'Node.js', ar: 'Node.js' },
      { en: 'Postgres', ar: 'Postgres' },
    ],
    featured: true,
    posted: { en: '5 days ago', ar: 'منذ ٥ أيام' },
    blurb: {
      en: 'Scale interview scoring pipelines that stay fast under peak load.',
      ar: 'وسّع خطوط تقييم المقابلات لتبقى سريعة تحت أعلى الأحمال.',
    },
    match: 90,
  },
  {
    id: 'ae-horizon',
    title: { en: 'Account Executive — Talent', ar: 'مدير حسابات — مواهب' },
    company: { en: 'Horizon Hire', ar: 'Horizon Hire' },
    location: { en: 'Riyadh · On-site', ar: 'الرياض · حضوري' },
    city: 'riyadh',
    type: 'fulltime',
    typeLabel: JOBS_COPY.types.fulltime,
    dept: 'sales',
    salary: { en: 'SAR 18k + OTE', ar: '١٨ ألف ريال + عمولة' },
    tags: [
      { en: 'Enterprise', ar: 'مؤسسات' },
      { en: 'Arabic', ar: 'عربي' },
    ],
    posted: { en: '6 days ago', ar: 'منذ ٦ أيام' },
    blurb: {
      en: 'Sell white-label interview platforms to HR teams across KSA & UAE.',
      ar: 'بع منصات مقابلات بهوية خاصة لفرق الموارد البشرية في السعودية والإمارات.',
    },
    match: 76,
  },
  {
    id: 'tpm-cascade',
    title: { en: 'Technical Program Manager', ar: 'مدير برامج تقنية' },
    company: { en: 'Cascade AI', ar: 'Cascade AI' },
    location: { en: 'Remote · MENA', ar: 'عن بُعد · المنطقة' },
    city: 'remote',
    type: 'remote',
    typeLabel: JOBS_COPY.types.remote,
    dept: 'product',
    salary: { en: 'USD 7–9k / mo', ar: '٧–٩ آلاف دولار / شهرياً' },
    tags: [
      { en: 'AI products', ar: 'منتجات ذكاء' },
      { en: 'Cross-functional', ar: 'متعدد الفرق' },
    ],
    posted: { en: '2 weeks ago', ar: 'منذ أسبوعين' },
    blurb: {
      en: 'Orchestrate AI interview launches across product, trust, and go-to-market.',
      ar: 'نسّق إطلاقات مقابلات الذكاء الاصطناعي عبر المنتج والثقة والسوق.',
    },
    match: 85,
  },
];
