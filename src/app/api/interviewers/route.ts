import { NextRequest, NextResponse } from 'next/server';

// ── Mock Interviewer Data ──
const MOCK_INTERVIEWERS = [
  {
    id: 'int-001',
    fullName: 'Fahd Al-Rashed',
    fullNameAr: 'فهد الراشد',
    bio: 'Senior Software Engineer with 12+ years in the tech industry. Specialized in full-stack development, system design, and leading engineering teams at top Saudi companies.',
    bioAr: 'مهندس برمجيات أول مع أكثر من ١٢ عاماً في قطاع التقنية. متخصص في تطوير الأنظمة الشاملة وتصميم النظم وقيادة فرق الهندسة.',
    rating: 4.9,
    totalInterviews: 87,
    specialties: ['SOFTWARE_ENGINEER', 'PROJECT_MANAGER'],
    industries: ['TECH', 'FINTECH'],
    languages: ['AR', 'EN'],
    priceTier: 'ELITE',
    hourlyRate: 5900, // $59.00 in cents
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'FR',
  },
  {
    id: 'int-002',
    fullName: 'Maryam Al-Otaibi',
    fullNameAr: 'مريم العتيبي',
    bio: 'HR Director with extensive experience in talent acquisition and organizational development. Expert in behavioral interviewing and cultural fit assessment.',
    bioAr: 'مديرة موارد بشرية ذات خبرة واسعة في استقطاب المواهب والتطوير المؤسسي. خبيرة في المقابلات السلوكية وتقييم التوافق الثقافي.',
    rating: 4.8,
    totalInterviews: 134,
    specialties: ['HR_MANAGER', 'CUSTOMER_SERVICE'],
    industries: ['TECH', 'RETAIL', 'HEALTHCARE'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'MO',
  },
  {
    id: 'int-003',
    fullName: 'Sultan Al-Harbi',
    fullNameAr: 'سلطان الحربي',
    bio: 'Former Marketing VP at a leading MENA agency. Expert in digital marketing strategy, brand management, and growth marketing interviews.',
    bioAr: 'نائب رئيس التسويق السابق في وكالة رائدة في الشرق الأوسط. خبير في استراتيجية التسويق الرقمي وإدارة العلامة التجارية.',
    rating: 4.7,
    totalInterviews: 62,
    specialties: ['MARKETING_SPECIALIST', 'SALES_MANAGER'],
    industries: ['RETAIL', 'TECH', 'TELECOM'],
    languages: ['AR'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'SH',
  },
  {
    id: 'int-004',
    fullName: 'Aisha Al-Dosari',
    fullNameAr: 'عائشة الدوسري',
    bio: 'Certified Public Accountant with 15 years in financial auditing and reporting. Specializes in interviewing finance professionals and accountants.',
    bioAr: 'محاسبة قانونية معتمدة مع ١٥ عاماً في التدقيق المالي والتقارير. متخصصة في مقابلة المحترفين الماليين والمحاسبين.',
    rating: 4.6,
    totalInterviews: 45,
    specialties: ['ACCOUNTANT', 'DATA_ANALYST'],
    industries: ['FINTECH', 'MANUFACTURING'],
    languages: ['AR', 'EN'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'AD',
  },
  {
    id: 'int-005',
    fullName: 'Khalid Al-Mutairi',
    fullNameAr: 'خالد المطيري',
    bio: 'Operations excellence consultant with 18 years across manufacturing, logistics, and supply chain. Former operations director at a Fortune 500 company.',
    bioAr: 'مستشار تميز تشغيلي مع ١٨ عاماً في التصنيع واللوجستيات وسلاسل الإمداد. مدير عمليات سابق في شركة من فورتشن ٥٠٠.',
    rating: 4.9,
    totalInterviews: 71,
    specialties: ['OPERATIONS_MANAGER', 'PROJECT_MANAGER'],
    industries: ['MANUFACTURING', 'TECH'],
    languages: ['AR'],
    priceTier: 'ELITE',
    hourlyRate: 5900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'KM',
  },
  {
    id: 'int-006',
    fullName: 'Noura Al-Qahtani',
    fullNameAr: 'نورة القحطاني',
    bio: 'Creative Director and UX lead with a passion for design thinking. Conducts interviews for graphic design, UI/UX, and creative roles.',
    bioAr: 'مديرة إبداعية ورائدة تجربة المستخدم بشغف التفكير التصميمي. تجري مقابلات لمهام التصميم والإبداع.',
    rating: 4.5,
    totalInterviews: 38,
    specialties: ['GRAPHIC_DESIGNER', 'SOFTWARE_ENGINEER'],
    industries: ['TECH', 'RETAIL'],
    languages: ['AR', 'EN'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'NQ',
  },
  {
    id: 'int-007',
    fullName: 'Abdullah Al-Shammari',
    fullNameAr: 'عبدالله الشمري',
    bio: 'Data science leader with a PhD in AI/ML. Experienced in evaluating data analysts, ML engineers, and BI professionals across multiple industries.',
    bioAr: 'قائد علم البيانات مع دكتوراه في الذكاء الاصطناعي. ذو خبرة في تقييم محللي البيانات ومهندسي التعلم الآلي.',
    rating: 4.8,
    totalInterviews: 56,
    specialties: ['DATA_ANALYST', 'SOFTWARE_ENGINEER'],
    industries: ['FINTECH', 'TECH', 'HEALTHCARE'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'AS',
  },
  {
    id: 'int-008',
    fullName: 'Sara Al-Anzi',
    fullNameAr: 'سارة العنزي',
    bio: 'Bilingual customer experience expert who has built and led support teams of 200+ agents. Specializes in customer service and communication skills assessment.',
    bioAr: 'خبيرة ثنائية اللغة في تجربة العملاء بنيت وقادت فرق دعم يزيد عددها عن ٢٠٠ وكيل. متخصصة في تقييم مهارات خدمة العملاء.',
    rating: 4.3,
    totalInterviews: 92,
    specialties: ['CUSTOMER_SERVICE', 'HR_MANAGER'],
    industries: ['TELECOM', 'RETAIL', 'HEALTHCARE'],
    languages: ['AR'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'SA',
  },
  {
    id: 'int-009',
    fullName: 'Mohammed Al-Zahrani',
    fullNameAr: 'محمد الزهراني',
    bio: 'PMP-certified project manager with 20 years leading multi-million dollar projects in construction, IT, and government sectors.',
    bioAr: 'مدير مشاريع معتمد (PMP) مع ٢٠ عاماً في قيادة مشاريع بملايين الدولارات في قطاعات البناء وتقنية المعلومات والحكومة.',
    rating: 4.7,
    totalInterviews: 63,
    specialties: ['PROJECT_MANAGER', 'OPERATIONS_MANAGER'],
    industries: ['MANUFACTURING', 'TECH'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'MZ',
  },
  {
    id: 'int-010',
    fullName: 'Lina Al-Subaie',
    fullNameAr: 'لينا السبيعي',
    bio: 'Sales transformation coach and former regional sales director. Expert at evaluating sales professionals, B2B sales skills, and negotiation capabilities.',
    bioAr: 'مدربة تحويل مبيعات ومديرة مبيعات إقليمية سابقة. خبيرة في تقييم محترفي المبيعات ومهارات التفاوض.',
    rating: 4.4,
    totalInterviews: 51,
    specialties: ['SALES_MANAGER', 'MARKETING_SPECIALIST'],
    industries: ['RETAIL', 'TELECOM', 'FINTECH'],
    languages: ['AR'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'LS',
  },
  {
    id: 'int-011',
    fullName: 'Ahmed Al-Ghamdi',
    fullNameAr: 'أحمد الغامدي',
    bio: 'Tech entrepreneur and full-stack architect. Conducts rigorous technical interviews covering system design, algorithms, and modern web technologies.',
    bioAr: 'رائد أعمال تقنية ومهندس معماري. يجري مقابلات تقنية صارمة تشمل تصميم الأنظمة والخوارزميات وتقنيات الويب الحديثة.',
    rating: 5.0,
    totalInterviews: 29,
    specialties: ['SOFTWARE_ENGINEER', 'DATA_ANALYST'],
    industries: ['TECH', 'FINTECH'],
    languages: ['AR', 'EN'],
    priceTier: 'ELITE',
    hourlyRate: 5900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'AG',
  },
  {
    id: 'int-012',
    fullName: 'Hind Al-Maliki',
    fullNameAr: 'هند المالكي',
    bio: 'Healthcare administration veteran with 14 years in hospital management. Specializes in interviewing for healthcare, medical, and administrative roles.',
    bioAr: 'خبيرة في إدارة الرعاية الصحية مع ١٤ عاماً في إدارة المستشفيات. متخصصة في مقابلات الأدوار الصحية والإدارية.',
    rating: 4.2,
    totalInterviews: 34,
    specialties: ['OPERATIONS_MANAGER', 'HR_MANAGER'],
    industries: ['HEALTHCARE', 'MANUFACTURING'],
    languages: ['AR'],
    priceTier: 'STANDARD',
    hourlyRate: 2900,
    videoIntroUrl: null as string | null,
    avatar: null as string | null,
    initials: 'HM',
  },
];

// GET /api/interviewers — list approved interviewers with filtering and pagination
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || '';
    const experience = searchParams.get('experience') || '';
    const language = searchParams.get('language') || '';
    const price = searchParams.get('price') || '';
    const rating = searchParams.get('rating') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

    // ── Try DB first ──
    try {
      const { db } = await import('@/lib/db');
      const where: Record<string, unknown> = { status: 'APPROVED' };

      if (role) {
        where.specialties = { contains: role };
      }
      if (language) {
        where.languages = { contains: language };
      }
      if (price) {
        where.priceTier = price;
      }
      if (rating) {
        where.rating = { gte: parseFloat(rating) };
      }

      const [dbInterviewers, total] = await Promise.all([
        db.interviewer.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { rating: 'desc' },
          select: {
            id: true,
            fullName: true,
            fullNameAr: true,
            bio: true,
            bioAr: true,
            rating: true,
            totalInterviews: true,
            specialties: true,
            industries: true,
            languages: true,
            priceTier: true,
            hourlyRate: true,
            videoIntroUrl: true,
          },
        }),
        db.interviewer.count({ where }),
      ]);

      const interviewers = dbInterviewers.map((i: Record<string, unknown>) => ({
        ...i,
        specialties: JSON.parse((i.specialties as string) || '[]'),
        industries: JSON.parse((i.industries as string) || '[]'),
        languages: JSON.parse((i.languages as string) || '["AR"]'),
        avatar: null,
        initials: (i.fullName as string)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase(),
      }));

      return NextResponse.json({
        interviewers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      });
    } catch (dbErr) {
      console.warn('[GET /api/interviewers] DB unavailable, using mock data:', dbErr);
    }

    // ── Mock mode ──
    let filtered = [...MOCK_INTERVIEWERS];

    if (role) {
      filtered = filtered.filter((i) => i.specialties.includes(role));
    }
    if (language) {
      filtered = filtered.filter((i) => i.languages.includes(language));
    }
    if (price) {
      filtered = filtered.filter((i) => i.priceTier === price.toUpperCase());
    }
    if (rating) {
      const minRating = parseFloat(rating);
      filtered = filtered.filter((i) => i.rating >= minRating);
    }
    if (experience) {
      // In mock mode, experience filter is informational — we keep all
      // In production this would filter by yearsExperience
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

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
