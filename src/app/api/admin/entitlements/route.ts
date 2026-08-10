import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';
import {
  grantPlan,
  revokeToFree,
  type PlanKey,
  PLAN_ENTITLEMENTS,
} from '@/lib/plans/entitlements';

const PLAN_KEYS = new Set(Object.keys(PLAN_ENTITLEMENTS));

/** GET users with Jeannie tiers. POST grant|revoke. */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const users = await db.user.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { email: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      sessionsLeft: true,
      masteryMocksLeft: true,
      cvStudioEnabled: true,
      coverLetterAiEnabled: true,
      subscriptionExpiresAt: true,
      createdAt: true,
      jeannieProfile: {
        select: {
          id: true,
          isActive: true,
          targetRoles: true,
          targetCities: true,
          seniority: true,
          updatedAt: true,
        },
      },
      _count: { select: { interviews: true, interviewSessions: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 150,
  });

  return NextResponse.json({ items: users, plans: Object.keys(PLAN_ENTITLEMENTS) });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    action?: 'grant' | 'revoke';
    userId?: string;
    planKey?: string;
    days?: number;
  };

  const userId = String(body.userId || '').trim();
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  if (body.action === 'revoke') {
    await revokeToFree(userId);
    if (auth.adminId) {
      await writeAdminAudit({
        adminId: auth.adminId,
        action: 'UPDATE',
        entity: 'entitlements',
        entityId: userId,
        details: { action: 'revoke' },
      });
    }
    return NextResponse.json({ ok: true, tier: 'FREE' });
  }

  const planKey = String(body.planKey || 'JEANNIE') as PlanKey;
  if (!PLAN_KEYS.has(planKey)) {
    return NextResponse.json({ error: 'Invalid planKey' }, { status: 400 });
  }

  const days = Math.min(Math.max(Number(body.days) || 30, 1), 365);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  await grantPlan({
    userId,
    planKey,
    expiresAt: planKey === 'MASTERY_PACK' || planKey === 'PRO' ? undefined : expiresAt,
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'entitlements',
      entityId: userId,
      details: { action: 'grant', planKey, days },
    });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      tier: true,
      sessionsLeft: true,
      masteryMocksLeft: true,
      subscriptionExpiresAt: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}
