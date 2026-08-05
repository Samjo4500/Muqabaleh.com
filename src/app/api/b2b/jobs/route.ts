import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireCompanyUser } from '@/lib/ats/auth';
import { JOB_STATUSES } from '@/lib/ats/constants';
import { serializePublicJob } from '@/lib/ats/serialize';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(2).max(160),
  titleAr: z.string().max(160).optional().nullable(),
  industry: z.string().min(1).max(80),
  type: z.string().min(1).max(40).default('behavioral'),
  mode: z.enum(['AI', 'HUMAN', 'ai', 'human']).default('AI'),
  assignmentMode: z.string().default('AUTO'),
  mustAskQuestions: z.string().optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  descriptionAr: z.string().max(20000).optional().nullable(),
  requirements: z.string().max(10000).optional().nullable(),
  benefits: z.string().max(10000).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  country: z.string().max(8).optional().nullable(),
  department: z.string().max(80).optional().nullable(),
  employmentType: z
    .enum(['fulltime', 'contract', 'remote', 'hybrid'])
    .default('fulltime'),
  careerLevel: z
    .enum(['JUNIOR', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE'])
    .optional()
    .nullable(),
  salaryRange: z.string().max(80).optional().nullable(),
  tags: z.string().max(400).optional().nullable(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  status: z.enum(JOB_STATUSES).default('OPEN'),
  inviteDeadline: z.string().optional().nullable(),
  humanPriceUsdCents: z.number().int().optional().nullable(),
});

export async function GET() {
  const auth = await requireCompanyUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  try {
    const where =
      user.role === 'SUPER_ADMIN' && !user.companyId
        ? {}
        : { companyId: user.companyId! };

    const jobs = await db.b2BJob.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, industry: true, country: true } },
        _count: { select: { applications: true, interviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      jobs: jobs.map((j) => ({
        ...serializePublicJob(j),
        isPublic: j.isPublic,
        status: j.status,
        mode: j.mode,
        interviewsCount: j._count.interviews,
        applicationsCount: j._count.applications,
      })),
    });
  } catch (e) {
    console.error('GET /api/b2b/jobs', e);
    return NextResponse.json({ error: 'Failed to load jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireCompanyUser();
  if (auth.error) return auth.error;
  const user = auth.user;

  if (!user.companyId && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'No company' }, { status: 400 });
  }

  try {
    const body = createSchema.parse(await req.json());
    let companyId = user.companyId;
    if (!companyId && user.role === 'SUPER_ADMIN') {
      const first = await db.company.findFirst({ orderBy: { createdAt: 'asc' } });
      if (!first) {
        return NextResponse.json({ error: 'No company available' }, { status: 400 });
      }
      companyId = first.id;
    }

    const job = await db.b2BJob.create({
      data: {
        companyId: companyId!,
        createdById: user.id,
        title: body.title,
        titleAr: body.titleAr || null,
        industry: body.industry,
        type: body.type,
        mode: body.mode.toUpperCase(),
        assignmentMode: body.assignmentMode,
        mustAskQuestions: body.mustAskQuestions || null,
        description: body.description || null,
        descriptionAr: body.descriptionAr || null,
        requirements: body.requirements || null,
        benefits: body.benefits || null,
        location: body.location || null,
        city: body.city || null,
        country: body.country || null,
        department: body.department || null,
        employmentType: body.employmentType,
        careerLevel: body.careerLevel || null,
        salaryRange: body.salaryRange || null,
        tags: body.tags || null,
        isPublic: body.isPublic,
        isFeatured: body.isFeatured,
        status: body.status,
        inviteDeadline: body.inviteDeadline ? new Date(body.inviteDeadline) : null,
        humanPriceUsdCents: body.humanPriceUsdCents ?? null,
      },
      include: {
        company: { select: { id: true, name: true, industry: true, country: true } },
        _count: { select: { applications: true } },
      },
    });

    return NextResponse.json({ job: serializePublicJob(job) }, { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.issues }, { status: 400 });
    }
    console.error('POST /api/b2b/jobs', e);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
