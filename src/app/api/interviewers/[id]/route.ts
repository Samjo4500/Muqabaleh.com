import { NextRequest, NextResponse } from 'next/server';

const PHOTO_BY_ID: Record<string, string> = {
  'int-001': '/images/interviewers/fahd.webp',
  'int-002': '/images/interviewers/int-f1.webp',
  'int-003': '/images/interviewers/int-m2.webp',
  'int-004': '/images/interviewers/int-f3.webp',
  'int-005': '/images/interviewers/int-m3.webp',
  'int-006': '/images/interviewers/noora.webp',
  'int-007': '/images/interviewers/int-m1.webp',
  'int-008': '/images/interviewers/int-f2.webp',
  'int-009': '/images/interviewers/int-m4.webp',
  'int-010': '/images/interviewers/int-f4.webp',
  'int-011': '/images/interviewers/int-m2.webp',
  'int-012': '/images/interviewers/int-f1.webp',
};

// ── Mock interviewer profiles keyed by ID ──
const MOCK_PROFILES: Record<string, Record<string, unknown>> = {
  'int-001': {
    id: 'int-001',
    fullName: 'Fahd Al-Rashed',
    fullNameAr: 'فهد الراشد',
    bio: 'Senior Software Engineer with 12+ years in the tech industry. Specialized in full-stack development, system design, and leading engineering teams at top Saudi companies.',
    bioAr: 'مهندس برمجيات أول مع أكثر من ١٢ عاماً في قطاع التقنية. متخصص في تطوير الأنظمة الشاملة وتصميم النظم وقيادة فرق الهندسة.',
    currentTitle: 'VP of Engineering',
    currentTitleAr: 'نائب رئيس الهندسة',
    yearsExperience: 12,
    rating: 4.9,
    totalInterviews: 87,
    specialties: ['SOFTWARE_ENGINEER', 'PROJECT_MANAGER'],
    industries: ['TECH', 'FINTECH'],
    languages: ['AR', 'EN'],
    priceTier: 'ELITE',
    hourlyRate: 5900,
    videoIntroUrl: null,
    photoUrl: PHOTO_BY_ID['int-001'],
    avatar: PHOTO_BY_ID['int-001'],
    initials: 'FR',
    linkedInUrl: 'https://linkedin.com/in/fahd-alrashed',
    reviews: [
      {
        id: 'rev-001',
        rating: 5,
        comment: 'Incredible interviewer! Asked very relevant system design questions and gave detailed, actionable feedback.',
        commentAr: 'مقابل مذهل! طرح أسئلة تصميم أنظمة ذات صلة وقدّم ملاحظات تفصيلية وقابلة للتنفيذ.',
        date: '2024-11-15',
        candidateName: 'Omar K.',
      },
      {
        id: 'rev-002',
        rating: 5,
        comment: 'Very professional and knowledgeable. Helped me prepare for my FAANG interview.',
        commentAr: 'مهنّي ومطلع جداً. ساعدني في الاستعداد لمقابلتي في شركات التقنية الكبرى.',
        date: '2024-10-28',
        candidateName: 'Sarah M.',
      },
      {
        id: 'rev-003',
        rating: 4,
        comment: 'Great session overall. Would have liked more behavioral questions but the technical depth was excellent.',
        commentAr: 'جلسة رائعة عموماً. تمنيت المزيد من الأسئلة السلوكية لكن العمق التقني كان ممتازاً.',
        date: '2024-10-10',
        candidateName: 'Ahmed B.',
      },
    ],
    availability: [
      { dayOfWeek: 0, dayName: 'Sunday', dayNameAr: 'الأحد', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: false },
        { time: '11:00', isAvailable: true, isBooked: true },
        { time: '14:00', isAvailable: true, isBooked: false },
        { time: '15:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 1, dayName: 'Monday', dayNameAr: 'الاثنين', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: true },
        { time: '16:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 3, dayName: 'Wednesday', dayNameAr: 'الأربعاء', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: false },
        { time: '14:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 4, dayName: 'Thursday', dayNameAr: 'الخميس', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '11:00', isAvailable: true, isBooked: false },
        { time: '15:00', isAvailable: true, isBooked: true },
      ]},
    ],
  },
  'int-002': {
    id: 'int-002',
    fullName: 'Maryam Al-Otaibi',
    fullNameAr: 'مريم العتيبي',
    bio: 'HR Director with extensive experience in talent acquisition and organizational development. Expert in behavioral interviewing and cultural fit assessment.',
    bioAr: 'مديرة موارد بشرية ذات خبرة واسعة في استقطاب المواهب والتطوير المؤسسي. خبيرة في المقابلات السلوكية وتقييم التوافق الثقافي.',
    currentTitle: 'HR Director',
    currentTitleAr: 'مديرة موارد بشرية',
    yearsExperience: 15,
    rating: 4.8,
    totalInterviews: 134,
    specialties: ['HR_MANAGER', 'CUSTOMER_SERVICE'],
    industries: ['TECH', 'RETAIL', 'HEALTHCARE'],
    languages: ['AR', 'EN'],
    priceTier: 'PREMIUM',
    hourlyRate: 3900,
    videoIntroUrl: null,
    photoUrl: PHOTO_BY_ID['int-002'],
    avatar: PHOTO_BY_ID['int-002'],
    initials: 'MO',
    linkedInUrl: 'https://linkedin.com/in/maryam-alotaibi',
    reviews: [
      {
        id: 'rev-004',
        rating: 5,
        comment: 'Maryam was incredibly thorough. Her behavioral questions really helped me understand my strengths.',
        commentAr: 'مريم كانت دقيقة للغاية. أسئلتها السلوكية ساعدتني حقاً في فهم نقاط قوتي.',
        date: '2024-11-20',
        candidateName: 'Layla H.',
      },
      {
        id: 'rev-005',
        rating: 5,
        comment: 'Best HR interview prep I have ever had. Highly recommended!',
        commentAr: 'أفضل تحضير لمقابلة موارد بشرية خضتها على الإطلاق. أنصح بها بشدة!',
        date: '2024-11-05',
        candidateName: 'Nasser A.',
      },
      {
        id: 'rev-006',
        rating: 4,
        comment: 'Very professional session with great insights into what HR managers look for.',
        commentAr: 'جلسة احترافية جداً مع رؤى رائعة حول ما يبحث عنه مدراء الموارد البشرية.',
        date: '2024-10-18',
        candidateName: 'Rania S.',
      },
    ],
    availability: [
      { dayOfWeek: 0, dayName: 'Sunday', dayNameAr: 'الأحد', slots: [
        { time: '10:00', isAvailable: true, isBooked: false },
        { time: '11:00', isAvailable: true, isBooked: false },
        { time: '12:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 2, dayName: 'Tuesday', dayNameAr: 'الثلاثاء', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: true },
        { time: '13:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 4, dayName: 'Thursday', dayNameAr: 'الخميس', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: false },
      ]},
    ],
  },
};

// Default profile for any mock ID not explicitly listed above
function getMockProfile(id: string): Record<string, unknown> {
  const defaults: Record<string, Record<string, unknown>> = {
    'int-003': { fullName: 'Sultan Al-Harbi', fullNameAr: 'سلطان الحربي', rating: 4.7, totalInterviews: 62, specialties: ['MARKETING_SPECIALIST', 'SALES_MANAGER'], priceTier: 'PREMIUM', hourlyRate: 3900, yearsExperience: 10, initials: 'SH' },
    'int-004': { fullName: 'Aisha Al-Dosari', fullNameAr: 'عائشة الدوسري', rating: 4.6, totalInterviews: 45, specialties: ['ACCOUNTANT', 'DATA_ANALYST'], priceTier: 'STANDARD', hourlyRate: 2900, yearsExperience: 15, initials: 'AD' },
    'int-005': { fullName: 'Khalid Al-Mutairi', fullNameAr: 'خالد المطيري', rating: 4.9, totalInterviews: 71, specialties: ['OPERATIONS_MANAGER', 'PROJECT_MANAGER'], priceTier: 'ELITE', hourlyRate: 5900, yearsExperience: 18, initials: 'KM' },
    'int-006': { fullName: 'Noura Al-Qahtani', fullNameAr: 'نورة القحطاني', rating: 4.5, totalInterviews: 38, specialties: ['GRAPHIC_DESIGNER', 'SOFTWARE_ENGINEER'], priceTier: 'STANDARD', hourlyRate: 2900, yearsExperience: 7, initials: 'NQ' },
    'int-007': { fullName: 'Abdullah Al-Shammari', fullNameAr: 'عبدالله الشمري', rating: 4.8, totalInterviews: 56, specialties: ['DATA_ANALYST', 'SOFTWARE_ENGINEER'], priceTier: 'PREMIUM', hourlyRate: 3900, yearsExperience: 8, initials: 'AS' },
    'int-008': { fullName: 'Sara Al-Anzi', fullNameAr: 'سارة العنزي', rating: 4.3, totalInterviews: 92, specialties: ['CUSTOMER_SERVICE', 'HR_MANAGER'], priceTier: 'STANDARD', hourlyRate: 2900, yearsExperience: 11, initials: 'SA' },
    'int-009': { fullName: 'Mohammed Al-Zahrani', fullNameAr: 'محمد الزهراني', rating: 4.7, totalInterviews: 63, specialties: ['PROJECT_MANAGER', 'OPERATIONS_MANAGER'], priceTier: 'PREMIUM', hourlyRate: 3900, yearsExperience: 20, initials: 'MZ' },
    'int-010': { fullName: 'Lina Al-Subaie', fullNameAr: 'لينا السبيعي', rating: 4.4, totalInterviews: 51, specialties: ['SALES_MANAGER', 'MARKETING_SPECIALIST'], priceTier: 'STANDARD', hourlyRate: 2900, yearsExperience: 9, initials: 'LS' },
    'int-011': { fullName: 'Ahmed Al-Ghamdi', fullNameAr: 'أحمد الغامدي', rating: 5.0, totalInterviews: 29, specialties: ['SOFTWARE_ENGINEER', 'DATA_ANALYST'], priceTier: 'ELITE', hourlyRate: 5900, yearsExperience: 6, initials: 'AG' },
    'int-012': { fullName: 'Hind Al-Maliki', fullNameAr: 'هند المالكي', rating: 4.2, totalInterviews: 34, specialties: ['OPERATIONS_MANAGER', 'HR_MANAGER'], priceTier: 'STANDARD', hourlyRate: 2900, yearsExperience: 14, initials: 'HM' },
  };

  const d = defaults[id] || defaults['int-003']!;
  const specs = d.specialties as string[];
  return {
    id,
    fullName: d.fullName as string,
    fullNameAr: d.fullNameAr as string,
    bio: `Experienced ${specs[0].replace(/_/g, ' ')} with ${d.yearsExperience as number} years of professional experience. Passionate about helping candidates succeed in their interviews.`,
    bioAr: `${specs[0].replace(/_/g, ' ')} ذو خبرة ${d.yearsExperience as number} عاماً. شغوف بمساعدة المرشحين على النجاح في مقابلاتهم.`,
    currentTitle: 'Senior Consultant',
    currentTitleAr: 'استشاري أول',
    yearsExperience: d.yearsExperience,
    rating: d.rating,
    totalInterviews: d.totalInterviews,
    specialties: d.specialties,
    industries: ['TECH', 'FINTECH'],
    languages: ['AR', 'EN'],
    priceTier: d.priceTier,
    hourlyRate: d.hourlyRate,
    videoIntroUrl: null,
    photoUrl: PHOTO_BY_ID[id] || null,
    avatar: PHOTO_BY_ID[id] || null,
    initials: d.initials,
    linkedInUrl: null,
    reviews: [
      {
        id: `rev-${id}-1`,
        rating: 5,
        comment: 'Excellent interviewer! Very professional and gave great feedback.',
        commentAr: 'مقابل ممتاز! مهني جداً وقدّم ملاحظات رائعة.',
        date: '2024-11-10',
        candidateName: 'Anonymous',
      },
      {
        id: `rev-${id}-2`,
        rating: 4,
        comment: 'Good session, helped me identify areas to improve.',
        commentAr: 'جلسة جيدة، ساعدتني في تحديد مجالات التحسين.',
        date: '2024-10-25',
        candidateName: 'Anonymous',
      },
      {
        id: `rev-${id}-3`,
        rating: 5,
        comment: 'Highly recommended. Very knowledgeable in their field.',
        commentAr: 'أنصح بها بشدة. مطلعة جداً في مجالها.',
        date: '2024-10-01',
        candidateName: 'Anonymous',
      },
    ],
    availability: [
      { dayOfWeek: 0, dayName: 'Sunday', dayNameAr: 'الأحد', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: false },
        { time: '11:00', isAvailable: true, isBooked: true },
        { time: '14:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 1, dayName: 'Monday', dayNameAr: 'الاثنين', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '10:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 2, dayName: 'Tuesday', dayNameAr: 'الثلاثاء', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '13:00', isAvailable: true, isBooked: false },
        { time: '16:00', isAvailable: true, isBooked: false },
      ]},
      { dayOfWeek: 3, dayName: 'Wednesday', dayNameAr: 'الأربعاء', slots: [
        { time: '10:00', isAvailable: true, isBooked: false },
        { time: '14:00', isAvailable: true, isBooked: true },
      ]},
      { dayOfWeek: 4, dayName: 'Thursday', dayNameAr: 'الخميس', slots: [
        { time: '09:00', isAvailable: true, isBooked: false },
        { time: '11:00', isAvailable: true, isBooked: false },
      ]},
    ],
  };
}

// GET /api/interviewers/[id] — single interviewer profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: { ar: 'معرف المقابل مطلوب', en: 'Interviewer ID is required' } },
        { status: 400 },
      );
    }

    // ── Try DB first ──
    try {
      const { db } = await import('@/lib/db');
      const interviewer = await db.interviewer.findUnique({
        where: { id },
        include: {
          availability: true,
          reviews: {
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (interviewer) {
        const { availability, reviews, ...rest } = interviewer as Record<string, unknown>;
        return NextResponse.json({
          interviewer: {
            ...rest,
            specialties: JSON.parse((rest.specialties as string) || '[]'),
            industries: JSON.parse((rest.industries as string) || '[]'),
            languages: JSON.parse((rest.languages as string) || '["AR"]'),
            avatar: null,
            initials: (rest.fullName as string)
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase(),
            reviews: (reviews as Record<string, unknown>[]).map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
              date: r.createdAt,
              candidateName: 'Anonymous',
            })),
            availability: (availability as Record<string, unknown>[]).map((a) => ({
              dayOfWeek: a.weekday,
              dayName: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][a.weekday as number] || '',
              dayNameAr: ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'][a.weekday as number] || '',
              slots: [{
                time: a.startTime,
                isAvailable: a.isAvailable,
                isBooked: false,
              }],
            })),
          },
        });
      }
    } catch (dbErr) {
      console.warn('[GET /api/interviewers/[id]] DB unavailable, using mock data:', dbErr);
    }

    // ── Mock mode ──
    const profile = MOCK_PROFILES[id] || getMockProfile(id);
    return NextResponse.json({ interviewer: profile });
  } catch (err) {
    console.error('GET /api/interviewers/[id] error:', err);
    return NextResponse.json(
      {
        error: {
          ar: 'حدث خطأ أثناء جلب بيانات المقابل',
          en: 'Error fetching interviewer profile',
        },
      },
      { status: 500 },
    );
  }
}
