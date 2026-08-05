import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializePublicJob } from '@/lib/ats/serialize';

/** Public list of open vacancies. */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const country = searchParams.get('country') || '';
    const department = searchParams.get('department') || '';
    const employmentType = searchParams.get('type') || '';

    const jobs = await db.b2BJob.findMany({
      where: {
        isPublic: true,
        status: 'OPEN',
        ...(country && country !== 'all'
          ? country === 'REMOTE'
            ? {
                OR: [
                  { country: 'REMOTE' },
                  { employmentType: 'remote' },
                ],
              }
            : { country }
          : {}),
        ...(department && department !== 'all' ? { department } : {}),
        ...(employmentType && employmentType !== 'all'
          ? { employmentType }
          : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { titleAr: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { tags: { contains: q, mode: 'insensitive' } },
                { company: { name: { contains: q, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        company: { select: { id: true, name: true, industry: true, country: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });

    return NextResponse.json({
      jobs: jobs.map(serializePublicJob),
      total: jobs.length,
    });
  } catch (e) {
    console.error('GET /api/jobs', e);
    return NextResponse.json({ jobs: [], total: 0, demo: true });
  }
}
