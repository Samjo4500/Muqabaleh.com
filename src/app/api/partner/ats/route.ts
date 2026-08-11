import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePartnerContext } from '@/lib/partner/auth';
import { partnerCompanyIds } from '@/lib/ats/auth';
import { serializePublicJob, serializeTalent } from '@/lib/ats/serialize';

/** Partner overview: client jobs + shared talent pool. */
export async function GET() {
  const ctx = await requirePartnerContext();
  if (ctx instanceof NextResponse) return ctx;

  try {
    if (ctx.usingDemo) {
      return NextResponse.json({
        jobs: [],
        candidates: [],
        stats: { jobs: 0, openJobs: 0, applications: 0, talent: 0 },
        demo: true,
      });
    }

    const companyIds = await partnerCompanyIds(ctx.partnerId);
    const jobs = companyIds.length
      ? await db.b2BJob.findMany({
          where: { companyId: { in: companyIds } },
          include: {
            company: {
              select: { id: true, name: true, industry: true, country: true },
            },
            _count: { select: { applications: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        })
      : [];

    const applications = companyIds.length
      ? await db.jobApplication.count({
          where: { job: { companyId: { in: companyIds } } },
        })
      : 0;

    // Isolation: only candidates who applied to this partner's jobs
    // (no global CandidatePool leak across tenants).
    const applicantIds = companyIds.length
      ? (
          await db.jobApplication.findMany({
            where: { job: { companyId: { in: companyIds } } },
            select: { candidateId: true },
            distinct: ['candidateId'],
            take: 200,
          })
        ).map((a) => a.candidateId)
      : [];

    const talent = applicantIds.length
      ? await db.candidatePool.findMany({
          where: {
            userId: { in: applicantIds },
            isOptedIn: true,
            isVisible: true,
          },
          include: {
            user: {
              select: { id: true, name: true, email: true, country: true, image: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 50,
        })
      : [];

    return NextResponse.json({
      jobs: jobs.map((j) => ({
        ...serializePublicJob(j),
        status: j.status,
        isPublic: j.isPublic,
      })),
      candidates: talent.map(serializeTalent),
      stats: {
        jobs: jobs.length,
        openJobs: jobs.filter((j) => j.status === 'OPEN').length,
        applications,
        talent: talent.length,
      },
    });
  } catch (e) {
    console.error('GET /api/partner/ats', e);
    return NextResponse.json({ error: 'Failed to load ATS' }, { status: 500 });
  }
}
