import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/jobs/listed
 * Public active job listings (employer-posted + legal ATS aggregations).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get('country')?.trim();
  const company = searchParams.get('company')?.trim();
  const department = searchParams.get('department')?.trim();
  const employmentType = searchParams.get('employmentType')?.trim();
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || 20)));
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(department ? { department: { contains: department, mode: 'insensitive' as const } } : {}),
    ...(employmentType
      ? { employmentType: { contains: employmentType, mode: 'insensitive' as const } }
      : {}),
    ...(company
      ? { company: { slug: company, isActive: true } }
      : { OR: [{ companyId: null }, { company: { isActive: true } }] }),
    ...(country
      ? {
          OR: [
            { location: { contains: country, mode: 'insensitive' as const } },
            { company: { country: { contains: country, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  };

  const [total, jobs] = await Promise.all([
    db.listedJob.count({ where }),
    db.listedJob.findMany({
      where,
      include: {
        company: {
          select: { id: true, name: true, slug: true, country: true, logoUrl: true, industry: true },
        },
      },
      orderBy: { postedAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    page,
    limit,
    total,
    jobs: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      department: j.department,
      employmentType: j.employmentType,
      description: j.description.slice(0, 300),
      applyUrl: j.applyUrl,
      source: j.source,
      postedAt: j.postedAt,
      company: j.company,
    })),
  });
}
