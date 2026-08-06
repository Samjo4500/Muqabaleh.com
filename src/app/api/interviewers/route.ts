import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

type SortBy = 'rating' | 'price_low' | 'price_high' | 'experience' | 'newest';

function experienceBandFromYears(years: number): 'JUNIOR' | 'MID' | 'SENIOR' | 'EXPERT' {
  if (years >= 15) return 'EXPERT';
  if (years >= 10) return 'SENIOR';
  if (years >= 5) return 'MID';
  return 'JUNIOR';
}

/** GET /api/interviewers — list ACTIVE interviewers (DB only; empty when none). */
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

    try {
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

      const interviewers = dbInterviewers.map((i) => {
        const years = i.yearsExperience || 0;
        const photo = i.photoUrl || null;
        return {
          ...i,
          currentTitleAr: null,
          specialties: JSON.parse(i.specialties || '[]'),
          industries: JSON.parse(i.industries || '[]'),
          languages: JSON.parse(i.languages || '["AR"]'),
          yearsExperience: years,
          experienceBand: experienceBandFromYears(years),
          photoUrl: photo,
          avatar: photo,
          isOnline: years >= 10,
          responseTime: years >= 12 ? '< 2h' : '< 6h',
          initials: i.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        };
      });

      return NextResponse.json({
        interviewers,
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      });
    } catch (dbErr) {
      console.error('[GET /api/interviewers] DB error:', dbErr);
      return NextResponse.json(
        { error: { ar: 'تعذّر تحميل قائمة المحاورين', en: 'Interviewers temporarily unavailable' } },
        { status: 503 },
      );
    }
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
