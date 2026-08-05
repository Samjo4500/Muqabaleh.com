import { NextRequest, NextResponse } from 'next/server';

type MockInterviewer = {
  id: string;
  fullName: string;
  fullNameAr: string;
  currentTitle: string;
  currentTitleAr: string;
  bio: string;
  bioAr: string;
  rating: number;
  totalInterviews: number;
  specialties: string[];
  industries: string[];
  languages: string[];
  priceTier: string;
  hourlyRate: number;
  yearsExperience: number;
  experienceBand: 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT';
  photoUrl: string;
  videoIntroUrl: string | null;
  initials: string;
};

const MOCK_INTERVIEWERS: MockInterviewer[] = [
  {
    id: 'int-001',
    fullName: 'Fahd Al-Rashed',
    fullNameAr: 'فهد الراشد',
    currentTitle: 'Senior Engineering Leader',
    currentTitleAr: 'قائد هندسة أول',
    bio: 'Senior Software Engineer with 12+ years in tech. Specialized in full-stack development, system design, and leading engineering teams.',
    bioAr: 'مهندس برمجيات أول مع أكثر من ١٢ عاماً في التقنية. متخصص في تطوير الأنظمة وتصميم النظم وقيادة فرق الهندسة.',
    rating: 4.9,
    totalInterviews: 87,
    specialties: ['SOFTWARE_ENGINEER', 'PROJECT_MANAGER'],
    industries: ['TECH', 'FINTECH'],
    languages: ['AR', 'EN'],
    priceTier: 'ELITE',
    hourlyRate: 5900,
    yearsExperience: 12,
    experienceBand: 'SENIOR',
    photoUrl: '/images/interviewers/fahd.webp',
    videoIntroUrl: null,
    initials: 'FR',
  },
  {
    id: 'int-002',
    fullName: 'Maryam Al-Otaibi',
    fullNameAr: 'مريم العتيبي',
    currentTitle: 'HR Director',
    currentTitleAr: 'مديرة موارد بشرية',
    bio: 'HR Director with deep experience in talent acquisition and organizational development. Expert in behavioral interviewing.',
    bioAr: 'مديرة موارد بشرية ذات خبرة واسعة في استقطاب المواهب والتطوير المؤسسي. خبيرة في المقابلات السلوكية.',
    rating: 4.8,
    totalInterviews: 134,
    specialties: ['HR_MANAGER', 'CUSTOMER_SERVICE'],
    industries: ['TECH', 'RETAIL', 'HEALTHCARE'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    yearsExperience: 14,
    experienceBand: 'SENIOR',
    photoUrl: '/images/interviewers/int-f1.webp',
    videoIntroUrl: null,
    initials: 'MO',
  },
  {
    id: 'int-003',
    fullName: 'Sultan Al-Harbi',
    fullNameAr: 'سلطان الحربي',
    currentTitle: 'Marketing VP',
    currentTitleAr: 'نائب رئيس التسويق',
    bio: 'Former Marketing VP at a leading MENA agency. Expert in digital strategy, brand, and growth interviews.',
    bioAr: 'نائب رئيس التسويق السابق في وكالة رائدة. خبير في استراتيجية التسويق الرقمي وإدارة العلامة.',
    rating: 4.7,
    totalInterviews: 62,
    specialties: ['MARKETING_SPECIALIST', 'SALES_MANAGER'],
    industries: ['RETAIL', 'TECH', 'TELECOM'],
    languages: ['AR'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    yearsExperience: 11,
    experienceBand: 'SENIOR',
    photoUrl: '/images/interviewers/int-m2.webp',
    videoIntroUrl: null,
    initials: 'SH',
  },
  {
    id: 'int-004',
    fullName: 'Aisha Al-Dosari',
    fullNameAr: 'عائشة الدوسري',
    currentTitle: 'Finance Partner, CPA',
    currentTitleAr: 'شريكة مالية · محاسب قانوني',
    bio: 'Certified Public Accountant with 15 years in auditing and reporting. Specializes in finance interviews.',
    bioAr: 'محاسبة قانونية معتمدة مع ١٥ عاماً في التدقيق والتقارير. متخصصة في مقابلات المالية.',
    rating: 4.6,
    totalInterviews: 45,
    specialties: ['ACCOUNTANT', 'DATA_ANALYST'],
    industries: ['FINTECH', 'FINANCE'],
    languages: ['AR', 'EN'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    yearsExperience: 15,
    experienceBand: 'EXPERT',
    photoUrl: '/images/interviewers/int-f3.webp',
    videoIntroUrl: null,
    initials: 'AD',
  },
  {
    id: 'int-005',
    fullName: 'Khalid Al-Mutairi',
    fullNameAr: 'خالد المطيري',
    currentTitle: 'Operations Director',
    currentTitleAr: 'مدير عمليات',
    bio: 'Operations excellence consultant with 18 years across manufacturing, logistics, and supply chain.',
    bioAr: 'مستشار تميز تشغيلي مع ١٨ عاماً في التصنيع واللوجستيات وسلاسل الإمداد.',
    rating: 4.9,
    totalInterviews: 71,
    specialties: ['OPERATIONS_MANAGER', 'PROJECT_MANAGER'],
    industries: ['MANUFACTURING', 'TECH'],
    languages: ['AR'],
    priceTier: 'ELITE',
    hourlyRate: 5900,
    yearsExperience: 18,
    experienceBand: 'EXPERT',
    photoUrl: '/images/interviewers/int-m3.webp',
    videoIntroUrl: null,
    initials: 'KM',
  },
  {
    id: 'int-006',
    fullName: 'Noura Al-Qahtani',
    fullNameAr: 'نورة القحطاني',
    currentTitle: 'Creative / UX Director',
    currentTitleAr: 'مديرة إبداع وتجربة مستخدم',
    bio: 'Creative Director and UX lead. Interviews for design, UI/UX, and creative roles.',
    bioAr: 'مديرة إبداعية ورائدة تجربة مستخدم. تجري مقابلات لمهام التصميم والإبداع.',
    rating: 4.5,
    totalInterviews: 38,
    specialties: ['GRAPHIC_DESIGNER', 'SOFTWARE_ENGINEER'],
    industries: ['TECH', 'RETAIL'],
    languages: ['AR', 'EN'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    yearsExperience: 8,
    experienceBand: 'MID',
    photoUrl: '/images/interviewers/noora.webp',
    videoIntroUrl: null,
    initials: 'NQ',
  },
  {
    id: 'int-007',
    fullName: 'Abdullah Al-Shammari',
    fullNameAr: 'عبدالله الشمري',
    currentTitle: 'Head of Data Science',
    currentTitleAr: 'رئيس علم البيانات',
    bio: 'Data science leader with a PhD in AI/ML. Evaluates analysts, ML engineers, and BI professionals.',
    bioAr: 'قائد علم البيانات مع دكتوراه في الذكاء الاصطناعي. يقيّم محللي البيانات ومهندسي التعلم الآلي.',
    rating: 4.8,
    totalInterviews: 56,
    specialties: ['DATA_ANALYST', 'SOFTWARE_ENGINEER'],
    industries: ['FINTECH', 'TECH', 'HEALTHCARE'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    yearsExperience: 10,
    experienceBand: 'SENIOR',
    photoUrl: '/images/interviewers/int-m1.webp',
    videoIntroUrl: null,
    initials: 'AS',
  },
  {
    id: 'int-008',
    fullName: 'Sara Al-Anzi',
    fullNameAr: 'سارة العنزي',
    currentTitle: 'CX & Support Leader',
    currentTitleAr: 'قائدة تجربة العملاء',
    bio: 'Bilingual customer experience expert who led support teams of 200+ agents.',
    bioAr: 'خبيرة ثنائية اللغة في تجربة العملاء قادت فرق دعم يزيد عددها عن ٢٠٠ وكيل.',
    rating: 4.3,
    totalInterviews: 92,
    specialties: ['CUSTOMER_SERVICE', 'HR_MANAGER'],
    industries: ['TELECOM', 'RETAIL', 'HEALTHCARE'],
    languages: ['AR'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    yearsExperience: 9,
    experienceBand: 'MID',
    photoUrl: '/images/interviewers/int-f2.webp',
    videoIntroUrl: null,
    initials: 'SA',
  },
  {
    id: 'int-009',
    fullName: 'Mohammed Al-Zahrani',
    fullNameAr: 'محمد الزهراني',
    currentTitle: 'PMP Program Lead',
    currentTitleAr: 'قائد برامج معتمد PMP',
    bio: 'PMP-certified project manager with 20 years leading multi-million dollar programs.',
    bioAr: 'مدير مشاريع معتمد (PMP) مع ٢٠ عاماً في قيادة برامج بملايين الدولارات.',
    rating: 4.7,
    totalInterviews: 63,
    specialties: ['PROJECT_MANAGER', 'OPERATIONS_MANAGER'],
    industries: ['MANUFACTURING', 'TECH'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    yearsExperience: 20,
    experienceBand: 'EXPERT',
    photoUrl: '/images/interviewers/int-m4.webp',
    videoIntroUrl: null,
    initials: 'MZ',
  },
  {
    id: 'int-010',
    fullName: 'Lina Al-Subaie',
    fullNameAr: 'لينا السبيعي',
    currentTitle: 'Sales Transformation Coach',
    currentTitleAr: 'مدربة تحويل مبيعات',
    bio: 'Former regional sales director. Expert at evaluating B2B sales and negotiation skills.',
    bioAr: 'مديرة مبيعات إقليمية سابقة. خبيرة في تقييم محترفي المبيعات ومهارات التفاوض.',
    rating: 4.4,
    totalInterviews: 51,
    specialties: ['SALES_MANAGER', 'MARKETING_SPECIALIST'],
    industries: ['RETAIL', 'TELECOM', 'FINTECH'],
    languages: ['AR'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    yearsExperience: 7,
    experienceBand: 'MID',
    photoUrl: '/images/interviewers/int-f4.webp',
    videoIntroUrl: null,
    initials: 'LS',
  },
  {
    id: 'int-011',
    fullName: 'Ahmed Al-Ghamdi',
    fullNameAr: 'أحمد الغامدي',
    currentTitle: 'Tech Founder & Architect',
    currentTitleAr: 'مؤسس تقني ومهندس معماري',
    bio: 'Tech entrepreneur and full-stack architect. Rigorous interviews on system design and modern web.',
    bioAr: 'رائد أعمال تقنية ومهندس معماري. مقابلات صارمة في تصميم الأنظمة وتقنيات الويب.',
    rating: 5.0,
    totalInterviews: 29,
    specialties: ['SOFTWARE_ENGINEER', 'DATA_ANALYST'],
    industries: ['TECH', 'FINTECH'],
    languages: ['AR', 'EN'],
    priceTier: 'ELITE',
    hourlyRate: 5900,
    yearsExperience: 6,
    experienceBand: 'MID',
    photoUrl: '/images/interviewers/int-m2.webp',
    videoIntroUrl: null,
    initials: 'AG',
  },
  {
    id: 'int-012',
    fullName: 'Hind Al-Maliki',
    fullNameAr: 'هند المالكي',
    currentTitle: 'Healthcare Operations Lead',
    currentTitleAr: 'قائدة عمليات رعاية صحية',
    bio: 'Healthcare administration veteran with 14 years in hospital management.',
    bioAr: 'خبيرة في إدارة الرعاية الصحية مع ١٤ عاماً في إدارة المستشفيات.',
    rating: 4.2,
    totalInterviews: 34,
    specialties: ['OPERATIONS_MANAGER', 'HR_MANAGER'],
    industries: ['HEALTHCARE', 'MANUFACTURING'],
    languages: ['AR'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    yearsExperience: 14,
    experienceBand: 'SENIOR',
    photoUrl: '/images/interviewers/int-f1.webp',
    videoIntroUrl: null,
    initials: 'HM',
  },
];

function experienceBandFromYears(years: number): MockInterviewer['experienceBand'] {
  if (years >= 15) return 'EXPERT';
  if (years >= 10) return 'SENIOR';
  if (years >= 5) return 'MID';
  return 'JUNIOR';
}

type SortBy = 'rating' | 'price_low' | 'price_high' | 'experience' | 'newest';

function sortInterviewers<T extends {
  rating: number;
  hourlyRate: number;
  yearsExperience: number;
  totalInterviews: number;
}>(list: T[], sortBy: SortBy): T[] {
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
    if (sortBy === 'price_high') return b.hourlyRate - a.hourlyRate;
    if (sortBy === 'experience') return b.yearsExperience - a.yearsExperience;
    if (sortBy === 'newest') return b.totalInterviews - a.totalInterviews;
    return b.rating - a.rating;
  });
  return sorted;
}

// GET /api/interviewers — list approved interviewers with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const industry = searchParams.get('industry') || searchParams.get('role') || '';
    const specialty = searchParams.get('specialty') || '';
    const experience = searchParams.get('experience') || '';
    const language = searchParams.get('language') || '';
    const price =
      searchParams.get('price') || searchParams.get('priceTier') || '';
    const rating =
      searchParams.get('rating') || searchParams.get('minRating') || '';
    const search = (searchParams.get('search') || '').trim().toLowerCase();
    const sortBy = (searchParams.get('sortBy') || 'rating') as SortBy;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));

    // ── Try DB first ──
    try {
      const { db } = await import('@/lib/db');
      const where: Record<string, unknown> = { status: 'ACTIVE' };

      if (industry) {
        where.industries = { contains: industry };
      }
      if (specialty) {
        where.specialties = { contains: specialty };
      }
      if (language) {
        where.languages = { contains: language };
      }
      if (price) {
        where.priceTier = price.toUpperCase();
      }
      if (rating) {
        where.rating = { gte: parseFloat(rating) };
      }
      if (experience) {
        if (experience === 'JUNIOR') where.yearsExperience = { lt: 5 };
        else if (experience === 'MID') where.yearsExperience = { gte: 5, lt: 10 };
        else if (experience === 'SENIOR') where.yearsExperience = { gte: 10, lt: 15 };
        else if (experience === 'EXPERT') where.yearsExperience = { gte: 15 };
      }
      if (search) {
        where.OR = [
          { fullName: { contains: search } },
          { fullNameAr: { contains: search } },
          { bio: { contains: search } },
          { bioAr: { contains: search } },
          { currentTitle: { contains: search } },
        ];
      }

      const orderBy =
        sortBy === 'price_low'
          ? { hourlyRate: 'asc' as const }
          : sortBy === 'price_high'
            ? { hourlyRate: 'desc' as const }
            : sortBy === 'experience'
              ? { yearsExperience: 'desc' as const }
              : { rating: 'desc' as const };

      const [dbInterviewers, total] = await Promise.all([
        db.interviewer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            currentTitle: true,
            bio: true,
            bioAr: true,
            rating: true,
            totalInterviews: true,
            specialties: true,
            industries: true,
            languages: true,
            priceTier: true,
            hourlyRate: true,
            yearsExperience: true,
            photoUrl: true,
            videoIntroUrl: true,
          },
        }),
        db.interviewer.count({ where }),
      ]);

      if (dbInterviewers.length > 0) {
        const interviewers = dbInterviewers.map((i: Record<string, unknown>) => {
          const years = (i.yearsExperience as number) || 0;
          const photo = (i.photoUrl as string | null) || null;
          return {
            ...i,
            currentTitleAr: null,
            specialties: JSON.parse((i.specialties as string) || '[]'),
            industries: JSON.parse((i.industries as string) || '[]'),
            languages: JSON.parse((i.languages as string) || '["AR"]'),
            yearsExperience: years,
            experienceBand: experienceBandFromYears(years),
            photoUrl: photo,
            avatar: photo,
            isOnline: years >= 10,
            responseTime: years >= 12 ? '< 2h' : '< 6h',
            initials: (i.fullName as string)
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          };
        });

        return NextResponse.json({
          interviewers,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        });
      }
    } catch (dbErr) {
      console.warn('[GET /api/interviewers] DB unavailable, using mock data:', dbErr);
    }

    // ── Mock mode ──
    let filtered = [...MOCK_INTERVIEWERS];

    if (industry) {
      filtered = filtered.filter((i) => i.industries.includes(industry.toUpperCase()));
    }
    if (specialty) {
      filtered = filtered.filter((i) => i.specialties.includes(specialty.toUpperCase()));
    }
    if (language) {
      filtered = filtered.filter((i) => i.languages.includes(language.toUpperCase()));
    }
    if (price) {
      filtered = filtered.filter((i) => i.priceTier === price.toUpperCase());
    }
    if (rating) {
      const minRating = parseFloat(rating);
      filtered = filtered.filter((i) => i.rating >= minRating);
    }
    if (experience) {
      filtered = filtered.filter((i) => i.experienceBand === experience.toUpperCase());
    }
    if (search) {
      filtered = filtered.filter((i) => {
        const haystack = [
          i.fullName,
          i.fullNameAr,
          i.bio,
          i.bioAr,
          i.currentTitle,
          i.currentTitleAr,
          i.specialties.join(' '),
          i.industries.join(' '),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(search);
      });
    }

    filtered = sortInterviewers(filtered, sortBy);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit).map((i, idx) => ({
      ...i,
      isOnline: idx % 3 !== 2,
      responseTime: i.yearsExperience >= 12 ? '< 2h' : '< 6h',
      avatar: i.photoUrl,
    }));

    return NextResponse.json({
      interviewers: paged,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('GET /api/interviewers error:', err);
    return NextResponse.json(
      {
        error: {
          ar: 'حدث خطأ أثناء جلب قائمة المقابلين',
          en: 'Error fetching interviewers list',
        },
      },
      { status: 500 },
    );
  }
}
