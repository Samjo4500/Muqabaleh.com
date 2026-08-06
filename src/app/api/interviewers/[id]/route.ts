import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { InterviewerStatus } from '@/lib/enums';

const DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

/** GET /api/interviewers/[id] — public interviewer profile (DB only, no fabricated social proof). */
export async function GET(
  _req: NextRequest,
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

    let interviewer;
    try {
      interviewer = await db.interviewer.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
          status: InterviewerStatus.ACTIVE,
        },
        include: {
          availability: true,
          reviews: {
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            take: 20,
          },
          _count: { select: { reviews: { where: { isPublic: true } } } },
        },
      });
    } catch (dbErr) {
      console.error('[GET /api/interviewers/[id]] DB error:', dbErr);
      return NextResponse.json(
        { error: { ar: 'تعذّر تحميل الملف حالياً', en: 'Profile temporarily unavailable' } },
        { status: 503 },
      );
    }

    if (!interviewer) {
      return NextResponse.json(
        { error: { ar: 'المحاور غير موجود', en: 'Interviewer not found' } },
        { status: 404 },
      );
    }

    const { availability, reviews, _count, ...rest } = interviewer;
    const specialties = safeJsonArray(rest.specialties);
    const industries = safeJsonArray(rest.industries);
    const languages = safeJsonArray(rest.languages, ['AR']);

    return NextResponse.json({
      interviewer: {
        id: rest.id,
        slug: rest.slug,
        fullName: rest.fullName,
        fullNameAr: rest.fullNameAr,
        bio: rest.bio,
        bioAr: rest.bioAr,
        bioEn: rest.bioEn,
        currentTitle: rest.currentTitle,
        yearsExperience: rest.yearsExperience,
        rating: rest.rating,
        totalInterviews: rest.totalInterviews,
        specialties,
        industries,
        languages,
        priceTier: rest.priceTier,
        hourlyRate: rest.hourlyRate,
        sessionPriceUsdCents: rest.sessionPriceUsdCents,
        videoIntroUrl: rest.videoIntroUrl,
        photoUrl: rest.photoUrl,
        linkedInUrl: rest.linkedInUrl,
        timezone: rest.timezone,
        avatar: rest.photoUrl,
        initials: rest.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
        reviewCount: _count.reviews,
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          date: r.createdAt,
          candidateName: 'Anonymous',
        })),
        availability: availability.map((a) => ({
          weekday: a.dayOfWeek,
          dayOfWeek: a.dayOfWeek,
          dayName: DAY_EN[a.dayOfWeek] || '',
          dayNameAr: DAY_AR[a.dayOfWeek] || '',
          startTime: a.startTime,
          endTime: a.endTime,
          isAvailable: a.isAvailable,
          slots: [
            {
              time: a.startTime,
              isAvailable: a.isAvailable,
              isBooked: false,
            },
          ],
        })),
      },
    });
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

function safeJsonArray(raw: string | null | undefined, fallback: string[] = []): string[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : fallback;
  } catch {
    return fallback;
  }
}
