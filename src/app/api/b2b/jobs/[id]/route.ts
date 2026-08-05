import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canManageJob, getAtsSession, unauthorized, forbidden } from '@/lib/ats/auth';
import { APPLICATION_STAGES, JOB_STATUSES } from '@/lib/ats/constants';
import { serializePublicJob } from '@/lib/ats/serialize';
import { z } from 'zod';

const patchSchema = z.object({
  title: z.string().min(2).max(160).optional(),
  titleAr: z.string().max(160).optional().nullable(),
  industry: z.string().min(1).max(80).optional(),
  type: z.string().min(1).max(40).optional(),
  mode: z.string().optional(),
  description: z.string().max(20000).optional().nullable(),
  descriptionAr: z.string().max(20000).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  benefits: z.string().max(10000).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  department: z.string().max(80).optional().nullable(),
  employmentType: z.enum(['fulltime', 'contract', 'remote']).optional(),
  salaryRange: z.string().max(80).optional().nullable(),
  tags: z.string().max(400).optional().nullable(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(JOB_STATUSES).optional(),
  mustAskQuestions: z.string().optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAtsSession();
  if (!user) return unauthorized();
  const { id } = await params;

  const allowed = await canManageJob(id, user);
  if (!allowed) return forbidden();

  const job = await db.b2BJob.findUnique({
    where: { id },
    include: {
      company: { select: { id: true, name: true, industry: true, country: true } },
      applications: {
        orderBy: { createdAt: 'desc' },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              country: true,
              image: true,
              candidatePool: true,
            },
          },
        },
      },
      _count: { select: { applications: true, interviews: true } },
    },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const stageCounts = APPLICATION_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = job.applications.filter((a) => a.stage === stage).length;
      return acc;
    },
    {} as Record<string, number>,
  );

  return NextResponse.json({
    job: {
      ...serializePublicJob(job),
      isPublic: job.isPublic,
      status: job.status,
      mode: job.mode,
      mustAskQuestions: job.mustAskQuestions,
      interviewsCount: job._count.interviews,
    },
    stageCounts,
    applications: job.applications.map((a) => ({
      id: a.id,
      stage: a.stage,
      coverLetter: a.coverLetter,
      source: a.source,
      score: a.score,
      employerNote: a.employerNote,
      cvAssetId: a.cvAssetId,
      photoAssetId: a.photoAssetId,
      cvUrl: a.cvAssetId ? `/api/media/${a.cvAssetId}` : null,
      photoUrl: a.photoAssetId
        ? `/api/media/${a.photoAssetId}`
        : a.candidate.image,
      createdAt: a.createdAt.toISOString(),
      candidate: {
        id: a.candidate.id,
        name: a.candidate.name,
        email: a.candidate.email,
        country: a.candidate.country,
        role: a.candidate.candidatePool?.role || null,
        level: a.candidate.candidatePool?.level || null,
        headline: a.candidate.candidatePool?.headline || null,
        skills: a.candidate.candidatePool?.skills || null,
        muqabalehScore: a.candidate.candidatePool?.muqabalehScore ?? null,
        phone: a.candidate.candidatePool?.phone || null,
        linkedInUrl: a.candidate.candidatePool?.linkedInUrl || null,
      },
    })),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAtsSession();
  if (!user) return unauthorized();
  const { id } = await params;
  const allowed = await canManageJob(id, user);
  if (!allowed) return forbidden();

  try {
    const body = patchSchema.parse(await req.json());
    const job = await db.b2BJob.update({
      where: { id },
      data: {
        ...body,
        ...(body.mode ? { mode: body.mode.toUpperCase() } : {}),
      },
      include: {
        company: { select: { id: true, name: true, industry: true, country: true } },
        _count: { select: { applications: true } },
      },
    });
    return NextResponse.json({ job: serializePublicJob(job) });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
