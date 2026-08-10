import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isCompanyCtx, requireB2BCompany } from '@/lib/b2b/company-auth';

/** Live company KPIs for the B2B overview. */
export async function GET() {
  const ctx = await requireB2BCompany();
  if (!isCompanyCtx(ctx)) return ctx;

  try {
    const companyId = ctx.companyId;
    const since30 = new Date(Date.now() - 30 * 86400000);

    const [jobs, applications, interviews30d, scored, recentApps] =
      await Promise.all([
        db.b2BJob.count({ where: { companyId } }),
        db.jobApplication.count({ where: { job: { companyId } } }),
        db.interview.count({
          where: { companyId, createdAt: { gte: since30 } },
        }),
        db.interview.findMany({
          where: {
            companyId,
            overallScore: { not: null },
            createdAt: { gte: since30 },
          },
          select: { overallScore: true },
          take: 200,
        }),
        db.jobApplication.findMany({
          where: { job: { companyId } },
          include: {
            candidate: { select: { name: true, email: true } },
            job: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

    const avgScore = scored.length
      ? Math.round(
          scored.reduce((n, i) => n + (i.overallScore || 0), 0) / scored.length,
        )
      : 0;

    // Soft SLA: applications older than slaHours still in NEW/SCREENING
    const slaMs = ctx.company.slaHours * 3600000;
    const slaBreached = await db.jobApplication.count({
      where: {
        job: { companyId },
        stage: { in: ['NEW', 'REVIEWING', 'SCREENING'] },
        createdAt: { lt: new Date(Date.now() - slaMs) },
      },
    });

    return NextResponse.json({
      company: ctx.company,
      kpis: {
        candidates: applications,
        completed: interviews30d,
        avgScore,
        sessionsLeft: ctx.company.credits,
        slaBreached,
        openJobs: await db.b2BJob.count({
          where: { companyId, status: 'OPEN' },
        }),
        jobs,
      },
      recentActivity: recentApps.map((a) => ({
        id: a.id,
        title: `${a.candidate.name || a.candidate.email} → ${a.job.title}`,
        stage: a.stage,
        at: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error('[api/b2b/stats]', err);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
