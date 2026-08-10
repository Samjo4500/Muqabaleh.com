import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DEMO_ADMIN_USER_ID, DEMO_PARTNER_ID, demoStore } from './demo-data';
import { mapPartnerRow } from './map-partner';
import type { PartnerRecord } from './types';

export type PartnerSessionContext = {
  userId: string;
  role: string;
  partnerId: string;
  partner: PartnerRecord;
  usingDemo: boolean;
};

export async function requirePartnerContext(): Promise<
  PartnerSessionContext | NextResponse
> {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | {
        id?: string;
        role?: string;
        partnerId?: string;
        email?: string;
      }
    | undefined;

  if (!user?.id || !user.role) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = ['PARTNER_ADMIN', 'PARTNER_MEMBER', 'SUPER_ADMIN'];
  if (!allowed.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Demo partner login path
  if (
    user.partnerId === DEMO_PARTNER_ID ||
    user.id === DEMO_ADMIN_USER_ID ||
    user.email === 'partner@atlas.demo'
  ) {
    return {
      userId: user.id,
      role: user.role,
      partnerId: DEMO_PARTNER_ID,
      partner: demoStore.partner,
      usingDemo: true,
    };
  }

  try {
    const { db } = await import('@/lib/db');
    let partnerId = user.partnerId;

    if (!partnerId && user.role === 'SUPER_ADMIN') {
      const first = await db.partner.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
      });
      if (first) partnerId = first.id;
    }

    if (!partnerId) {
      const u = await db.user.findUnique({
        where: { id: user.id },
        select: { partnerId: true },
      });
      partnerId = u?.partnerId || undefined;
    }

    if (!partnerId) {
      // Fall back to demo so console remains usable before migration/seed
      return {
        userId: user.id,
        role: user.role,
        partnerId: DEMO_PARTNER_ID,
        partner: demoStore.partner,
        usingDemo: true,
      };
    }

    const partner = await db.partner.findUnique({ where: { id: partnerId } });
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return {
      userId: user.id,
      role: user.role,
      partnerId: partner.id,
      partner: mapPartnerRow(partner as unknown as Record<string, unknown>),
      usingDemo: false,
    };
  } catch {
    return {
      userId: user.id,
      role: user.role,
      partnerId: DEMO_PARTNER_ID,
      partner: demoStore.partner,
      usingDemo: true,
    };
  }
}

export function isPartnerCtx(
  value: PartnerSessionContext | NextResponse,
): value is PartnerSessionContext {
  return !(value instanceof NextResponse);
}
