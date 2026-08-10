import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdmin } from '../_lib';
import { writeAdminAudit } from '@/lib/admin/audit';

/**
 * GET — candidate pool + latest interview passport signals
 * PATCH — { userId, isVisible?, isOptedIn?, openToWork? }
 */
export async function GET(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  const visibility = req.nextUrl.searchParams.get('visibility'); // public|private|all

  const pools = await db.candidatePool.findMany({
    where: {
      ...(visibility === 'public'
        ? { isVisible: true, isOptedIn: true }
        : visibility === 'private'
          ? { OR: [{ isVisible: false }, { isOptedIn: false }] }
          : {}),
      ...(q
        ? {
            OR: [
              { role: { contains: q, mode: 'insensitive' } },
              { headline: { contains: q, mode: 'insensitive' } },
              { location: { contains: q, mode: 'insensitive' } },
              { user: { email: { contains: q, mode: 'insensitive' } } },
              { user: { name: { contains: q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          tier: true,
          interviews: {
            where: { verificationId: { not: null } },
            select: {
              id: true,
              verificationId: true,
              overallScore: true,
              status: true,
              industry: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 150,
  });

  const items = pools.map((p) => {
    const latest = p.user.interviews[0] ?? null;
    return {
      id: p.id,
      userId: p.userId,
      email: p.user.email,
      name: p.user.name,
      tier: p.user.tier,
      role: p.role,
      level: p.level,
      industry: p.industry,
      location: p.location,
      headline: p.headline,
      isOptedIn: p.isOptedIn,
      isVisible: p.isVisible,
      openToWork: p.openToWork,
      muqabalehScore: p.muqabalehScore,
      averageScore: p.averageScore,
      interviewCount: p.interviewCount,
      verificationId: latest?.verificationId ?? null,
      latestScore: latest?.overallScore ?? null,
      passportStatus:
        p.isVisible && p.isOptedIn
          ? 'PUBLIC'
          : latest?.verificationId
            ? 'PRIVATE'
            : 'NONE',
      updatedAt: p.updatedAt,
    };
  });

  return NextResponse.json({ items, total: items.length });
}

export async function PATCH(req: NextRequest) {
  const auth = await verifyAdmin();
  if (!auth.authorized) return auth.response;

  const body = (await req.json().catch(() => ({}))) as {
    userId?: string;
    isVisible?: boolean;
    isOptedIn?: boolean;
    openToWork?: boolean;
  };
  const userId = String(body.userId || '').trim();
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const data: {
    isVisible?: boolean;
    isOptedIn?: boolean;
    openToWork?: boolean;
  } = {};
  if (typeof body.isVisible === 'boolean') data.isVisible = body.isVisible;
  if (typeof body.isOptedIn === 'boolean') data.isOptedIn = body.isOptedIn;
  if (typeof body.openToWork === 'boolean') data.openToWork = body.openToWork;
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  // Revoking public visibility: force both flags off when hiding
  if (data.isVisible === false) {
    data.isOptedIn = data.isOptedIn ?? false;
  }

  const pool = await db.candidatePool.update({
    where: { userId },
    data,
  });

  if (auth.adminId) {
    await writeAdminAudit({
      adminId: auth.adminId,
      action: 'UPDATE',
      entity: 'candidate_pool',
      entityId: pool.id,
      details: data,
    });
  }

  return NextResponse.json({ ok: true, pool });
}
