import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runAtsFetchTick } from '@/lib/jobs/ats-fetcher';
import { verifyAdmin } from '../../_lib';

export async function GET() {
  const gate = await verifyAdmin();
  if (!gate.authorized) return gate.response;

  const [activeJobs, companies, recentLogs, byAts] = await Promise.all([
    db.listedJob.count({ where: { isActive: true } }),
    db.listedCompany.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        ats: true,
        country: true,
        updatedAt: true,
        _count: { select: { jobs: { where: { isActive: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    }),
    db.jobFetchLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 40,
      include: { company: { select: { name: true, slug: true, ats: true } } },
    }),
    db.listedCompany.groupBy({
      by: ['ats'],
      _count: { _all: true },
      where: { isActive: true },
    }),
  ]);

  const fail404 = recentLogs.filter((l) => l.statusCode === 404).length;
  const ok200 = recentLogs.filter((l) => l.statusCode === 200).length;

  return NextResponse.json({
    activeJobs,
    companyCount: companies.length,
    byAts,
    recentSuccessRate:
      recentLogs.length === 0 ? null : Math.round((ok200 / recentLogs.length) * 100),
    recent404: fail404,
    companies,
    recentLogs,
  });
}

/** Super-admin manual trigger for a fetch tick. */
export async function POST(req: NextRequest) {
  const gate = await verifyAdmin();
  if (!gate.authorized) return gate.response;

  try {
    const body = (await req.json().catch(() => ({}))) as { limit?: number };
    const limit = Math.min(Math.max(Number(body.limit) || 20, 1), 80);
    const summary = await runAtsFetchTick({ limit });
    return NextResponse.json({ ok: true, ...summary });
  } catch (err) {
    console.error('POST /api/admin/jobs/aggregator', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}
