import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serializePublicJob } from '@/lib/ats/serialize';

/** Public list of open vacancies + featured employers. */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const country = searchParams.get('country') || '';
    const department = searchParams.get('department') || '';
    const employmentType = searchParams.get('type') || '';
    const industry = searchParams.get('industry') || '';
    const level = searchParams.get('level') || '';
    const featuredOnly = searchParams.get('featured') === '1';

    const where = {
      isPublic: true,
      status: 'OPEN' as const,
      ...(featuredOnly ? { isFeatured: true } : {}),
      ...(country && country !== 'all'
        ? country === 'REMOTE'
          ? {
              OR: [{ country: 'REMOTE' }, { employmentType: 'remote' }],
            }
          : { country }
        : {}),
      ...(department && department !== 'all' ? { department } : {}),
      ...(employmentType && employmentType !== 'all'
        ? { employmentType }
        : {}),
      ...(industry && industry !== 'all'
        ? { industry: { equals: industry, mode: 'insensitive' as const } }
        : {}),
      ...(level && level !== 'all' ? { careerLevel: level } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' as const } },
              { titleAr: { contains: q, mode: 'insensitive' as const } },
              { description: { contains: q, mode: 'insensitive' as const } },
              { tags: { contains: q, mode: 'insensitive' as const } },
              { industry: { contains: q, mode: 'insensitive' as const } },
              { company: { name: { contains: q, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [jobs, featuredJobs] = await Promise.all([
      db.b2BJob.findMany({
        where,
        include: {
          company: {
            select: { id: true, name: true, industry: true, country: true },
          },
          _count: { select: { applications: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 100,
      }),
      db.b2BJob.findMany({
        where: { isPublic: true, status: 'OPEN', isFeatured: true },
        select: {
          companyId: true,
          company: { select: { id: true, name: true, country: true, industry: true } },
        },
        take: 40,
      }),
    ]);

    const employerMap = new Map<
      string,
      { id: string; name: string; country: string | null; industry: string; openRoles: number }
    >();
    for (const row of featuredJobs) {
      const id = row.company.id;
      const prev = employerMap.get(id);
      if (prev) prev.openRoles += 1;
      else {
        employerMap.set(id, {
          id,
          name: row.company.name,
          country: row.company.country,
          industry: row.company.industry,
          openRoles: 1,
        });
      }
    }
    // Fallback: top hiring companies from current result set if no featured flags yet
    if (employerMap.size === 0) {
      for (const job of jobs) {
        if (!job.company) continue;
        const id = job.company.id;
        const prev = employerMap.get(id);
        if (prev) prev.openRoles += 1;
        else {
          employerMap.set(id, {
            id,
            name: job.company.name,
            country: job.company.country || null,
            industry: job.company.industry || '',
            openRoles: 1,
          });
        }
      }
    }

    const featuredEmployers = [...employerMap.values()]
      .sort((a, b) => b.openRoles - a.openRoles)
      .slice(0, 12);

    return NextResponse.json({
      jobs: jobs.map(serializePublicJob),
      total: jobs.length,
      featuredEmployers,
    });
  } catch (e) {
    console.error('GET /api/jobs', e);
    return NextResponse.json({ jobs: [], total: 0, featuredEmployers: [], demo: true });
  }
}
