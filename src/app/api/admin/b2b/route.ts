import { NextRequest, NextResponse } from 'next/server';
import type { ApplicationStage, JobPostingStatus, Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/**
 * GET ?tab=jobs|applications
 * PATCH applications: { applicationId, stage?, employerNote?, score? }
 * PATCH jobs: { jobId, status?, isPublic?, isFeatured? }
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const tab = req.nextUrl.searchParams.get('tab') || 'jobs';
  const q = (req.nextUrl.searchParams.get('q') || '').trim();

  if (tab === 'applications') {
    const items = await db.jobApplication.findMany({
      where: q
        ? {
            OR: [
              { candidate: { email: { contains: q, mode: 'insensitive' } } },
              { candidate: { name: { contains: q, mode: 'insensitive' } } },
              { job: { title: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        candidate: { select: { id: true, email: true, name: true } },
        job: {
          select: {
            id: true,
            title: true,
            titleAr: true,
            status: true,
            company: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    return NextResponse.json({ items });
  }

  const items = await db.b2BJob.findMany({
    where: q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { titleAr: { contains: q, mode: 'insensitive' } },
            { company: { name: { contains: q, mode: 'insensitive' } } },
          ],
        }
      : undefined,
    include: {
      company: { select: { id: true, name: true, plan: true, status: true } },
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ items });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    kind?: 'job' | 'application';
    jobId?: string;
    applicationId?: string;
    status?: string;
    isPublic?: boolean;
    isFeatured?: boolean;
    stage?: string;
    employerNote?: string;
    score?: number;
  };

  if (body.kind === 'application' || body.applicationId) {
    const applicationId = String(body.applicationId || '').trim();
    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId required' }, { status: 400 });
    }
    const data: Prisma.JobApplicationUpdateInput = {};
    if (typeof body.stage === 'string') data.stage = body.stage as ApplicationStage;
    if (typeof body.employerNote === 'string') data.employerNote = body.employerNote;
    if (typeof body.score === 'number') data.score = body.score;

    const app = await db.jobApplication.update({
      where: { id: applicationId },
      data,
    });

    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'UPDATE',
        entity: 'job_application',
        entityId: app.id,
        details: {
          stage: typeof body.stage === 'string' ? body.stage : undefined,
          score: typeof body.score === 'number' ? body.score : undefined,
        },
      });
    }
    return NextResponse.json({ ok: true, application: app });
  }

  const jobId = String(body.jobId || '').trim();
  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }
  const data: Prisma.B2BJobUpdateInput = {};
  if (typeof body.status === 'string') data.status = body.status as JobPostingStatus;
  if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic;
  if (typeof body.isFeatured === 'boolean') data.isFeatured = body.isFeatured;

  const job = await db.b2BJob.update({ where: { id: jobId }, data });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'b2b_job',
      entityId: job.id,
      details: {
        status: typeof body.status === 'string' ? body.status : undefined,
        isPublic: typeof body.isPublic === 'boolean' ? body.isPublic : undefined,
        isFeatured: typeof body.isFeatured === 'boolean' ? body.isFeatured : undefined,
      },
    });
  }

  return NextResponse.json({ ok: true, job });
}
