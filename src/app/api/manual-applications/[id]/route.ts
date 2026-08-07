import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { ManualApplicationStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getEntitlementSnapshot } from '@/lib/plans/entitlements';

const STATUSES = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;

const patchSchema = z.object({
  companyName: z.string().trim().min(1).max(120).optional(),
  role: z.string().trim().min(1).max(160).optional(),
  status: z.enum(STATUSES).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  appliedDate: z.string().datetime().optional(),
});

async function requireOwner(id: string) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const snap = await getEntitlementSnapshot(userId);
  if (!snap?.manualTracker) {
    return {
      error: NextResponse.json(
        { error: 'Manual tracker requires Jeannie or higher', code: 'UPGRADE_REQUIRED' },
        { status: 403 },
      ),
    };
  }
  const existing = await db.manualApplication.findFirst({ where: { id, userId } });
  if (!existing) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }
  return { userId, existing };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gate = await requireOwner(id);
  if ('error' in gate) return gate.error;

  try {
    const body = patchSchema.parse(await req.json());
    const updated = await db.manualApplication.update({
      where: { id },
      data: {
        ...(body.companyName !== undefined ? { companyName: body.companyName } : {}),
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.status !== undefined
          ? { status: body.status as ManualApplicationStatus }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
        ...(body.appliedDate !== undefined ? { appliedDate: new Date(body.appliedDate) } : {}),
      },
    });
    return NextResponse.json({ application: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.flatten() }, { status: 400 });
    }
    console.error('PATCH /api/manual-applications/[id]', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const gate = await requireOwner(id);
  if ('error' in gate) return gate.error;

  await db.manualApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
