import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { canManageJob, getAtsSession, unauthorized, forbidden } from '@/lib/ats/auth';
import { APPLICATION_STAGES } from '@/lib/ats/constants';
import { z } from 'zod';

const patchSchema = z.object({
  stage: z.enum(APPLICATION_STAGES).optional(),
  employerNote: z.string().max(5000).optional().nullable(),
  score: z.number().int().min(0).max(100).optional().nullable(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { b2bPreviewWriteBlocked } = await import('@/lib/b2b-preview');
  const previewBlock = b2bPreviewWriteBlocked();
  if (previewBlock) {
    return NextResponse.json(previewBlock, { status: 403 });
  }

  const user = await getAtsSession();
  if (!user) return unauthorized();
  const { id } = await params;

  const application = await db.jobApplication.findUnique({
    where: { id },
    select: { id: true, jobId: true },
  });
  if (!application) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const allowed = await canManageJob(application.jobId, user);
  if (!allowed) return forbidden();

  try {
    const body = patchSchema.parse(await req.json());
    const updated = await db.jobApplication.update({
      where: { id },
      data: {
        ...(body.stage ? { stage: body.stage } : {}),
        ...(body.employerNote !== undefined ? { employerNote: body.employerNote } : {}),
        ...(body.score !== undefined ? { score: body.score } : {}),
      },
    });
    return NextResponse.json({
      application: {
        id: updated.id,
        stage: updated.stage,
        employerNote: updated.employerNote,
        score: updated.score,
      },
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: e.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
