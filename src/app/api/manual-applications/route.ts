import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { ManualApplicationStatus } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getEntitlementSnapshot } from '@/lib/plans/entitlements';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/security';

const STATUSES = [
  'APPLIED',
  'SCREENING',
  'INTERVIEW',
  'OFFER',
  'HIRED',
  'REJECTED',
] as const;

const createSchema = z.object({
  companyName: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(160),
  status: z.enum(STATUSES).optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
  appliedDate: z.string().datetime().optional(),
});

async function requireUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!session?.user || !userId) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { userId };
}

export async function GET() {
  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const snap = await getEntitlementSnapshot(auth.userId);
  if (!snap?.manualTracker) {
    return NextResponse.json(
      { error: 'Manual tracker requires Jeannie or higher', code: 'UPGRADE_REQUIRED' },
      { status: 403 },
    );
  }

  const items = await db.manualApplication.findMany({
    where: { userId: auth.userId },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ applications: items, entitlement: true });
}

export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rl = checkRateLimit(ip, '/api/manual-applications', 60);
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const auth = await requireUser();
  if ('error' in auth) return auth.error;

  const snap = await getEntitlementSnapshot(auth.userId);
  if (!snap?.manualTracker) {
    return NextResponse.json(
      { error: 'Manual tracker requires Jeannie or higher', code: 'UPGRADE_REQUIRED' },
      { status: 403 },
    );
  }

  try {
    const body = createSchema.parse(await req.json());
    const created = await db.manualApplication.create({
      data: {
        userId: auth.userId,
        companyName: body.companyName,
        role: body.role,
        status: (body.status as ManualApplicationStatus) || 'APPLIED',
        notes: body.notes ?? null,
        appliedDate: body.appliedDate ? new Date(body.appliedDate) : new Date(),
      },
    });
    return NextResponse.json({ application: created }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.flatten() }, { status: 400 });
    }
    console.error('POST /api/manual-applications', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
