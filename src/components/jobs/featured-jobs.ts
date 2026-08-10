export type FeaturedJob = {
  id: string;
  company: string;
  mark: string;
  markBg: string;
  titleEn: string;
  titleAr: string;
  locationEn: string;
  locationAr: string;
  flag: string;
  deptEn: string;
  deptAr: string;
  deptDot: string;
  blurbEn: string;
  blurbAr: string;
  score: number;
  jeannieSrc: string;
};

/** Up to 6 FB-style Job of the Day posts — AR face / EN face flip order. */
export const FEATURED_JOBS: FeaturedJob[] = [
  {
    id: 'careem-dubai',
    company: 'Careem',
    mark: 'C',
    markBg: 'bg-[#00E0A0] text-[#04221a]',
    titleEn: 'Staff Software Engineer',
    titleAr: 'مهندس برمجيات أول',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    flag: '🇦🇪',
    deptEn: 'Technology',
    deptAr: 'تقنية',
    deptDot: 'bg-teal-400',
    blurbEn:
      'Build products used by millions across the Middle East — and walk in interview-ready.',
    blurbAr:
      'ابنِ منتجات يستخدمها ملايين في الشرق الأوسط — وادخل المقابلة جاهزاً.',
    score: 88,
    jeannieSrc: '/images/hero-interview.webp',
  },
  {
    id: 'mongodb-dubai',
    company: 'MongoDB',
    mark: 'M',
    markBg: 'bg-[#00ED64] text-[#04160c]',
    titleEn: 'Enterprise Account Executive',
    titleAr: 'ممثل حسابات مؤسسي',
    locationEn: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    flag: '🇦🇪',
    deptEn: 'Sales',
    deptAr: 'مبيعات',
    deptDot: 'bg-violet-400',
    blurbEn:
      'Grow MongoDB across the Gulf and win major enterprise accounts in the region.',
    blurbAr: 'نمّ أعمال MongoDB في الخليج وافتح حسابات جديدة كبرى في المنطقة.',
    score: 84,
    jeannieSrc: '/images/hero-interview.webp',
  },
  {
    id: 'tamara-riyadh',
    company: 'Tamara',
    mark: 'T',
    markBg: 'bg-[#C8F135] text-[#1a2204]',
    titleEn: 'Fraud Investigator',
    titleAr: 'محقق احتيال',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    flag: '🇸🇦',
    deptEn: 'Finance',
    deptAr: 'مالية',
    deptDot: 'bg-amber-400',
    blurbEn:
      'Monitor transactions and spot suspicious patterns inside a fast-growing payments platform.',
    blurbAr:
      'راقب المعاملات واكتشف الأنماط المشبوهة داخل منصة مدفوعات سريعة النمو.',
    score: 81,
    jeannieSrc: '/images/hero-jeannie-riyadh.webp',
  },
  {
    id: 'cloudflare-cairo',
    company: 'Cloudflare',
    mark: 'C',
    markBg: 'bg-[#F6821F] text-[#1a0d02]',
    titleEn: 'Senior Territory AE, Egypt',
    titleAr: 'مدير حسابات أول — مصر',
    locationEn: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    flag: '🇪🇬',
    deptEn: 'Sales',
    deptAr: 'مبيعات',
    deptDot: 'bg-violet-400',
    blurbEn:
      "Run full enterprise sales cycles with one of the world's strongest web networks.",
    blurbAr:
      'قد دورات مبيعات مؤسسية كاملة مع واحدة من أقوى شبكات الويب في العالم.',
    score: 83,
    jeannieSrc: '/images/hero-interview.webp',
  },
  {
    id: 'careem-amman',
    company: 'Careem',
    mark: 'C',
    markBg: 'bg-[#00E0A0] text-[#04221a]',
    titleEn: 'Operations Coordinator',
    titleAr: 'منسق عمليات',
    locationEn: 'Amman, Jordan',
    locationAr: 'عمّان، الأردن',
    flag: '🇯🇴',
    deptEn: 'Operations',
    deptAr: 'عمليات',
    deptDot: 'bg-rose-400',
    blurbEn:
      "Join the Shops team and elevate delivery experiences across the Kingdom's markets.",
    blurbAr: 'انضم لفريق المتاجر وارفع تجارب التوصيل عبر أسواق المملكة.',
    score: 79,
    jeannieSrc: '/images/hero-jeannie-amman.webp',
  },
  {
    id: 'trendyol-riyadh',
    company: 'Trendyol',
    mark: 'T',
    markBg: 'bg-[#F27A1A] text-[#1a0c02]',
    titleEn: 'Marketing Intern',
    titleAr: 'متدرّب تسويق',
    locationEn: 'Riyadh, KSA',
    locationAr: 'الرياض، السعودية',
    flag: '🇸🇦',
    deptEn: 'Marketing',
    deptAr: 'تسويق',
    deptDot: 'bg-fuchsia-400',
    blurbEn:
      "Start your marketing career with the region's biggest e-commerce platform.",
    blurbAr: 'ابدأ مسيرتك التسويقية مع أكبر منصة تجارة إلكترونية في المنطقة.',
    score: 76,
    jeannieSrc: '/images/hero-jeannie-riyadh.webp',
  },
];
