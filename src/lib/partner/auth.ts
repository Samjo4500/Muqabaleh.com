import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { DEMO_ADMIN_USER_ID, DEMO_PARTNER_ID, demoStore } from './demo-data';
import type { PartnerRecord } from './types';

export type PartnerSessionContext = {
  userId: string;
  role: string;
  partnerId: string;
  partner: PartnerRecord;
  usingDemo: boolean;
};

function mapDbPartner(p: Record<string, unknown>): PartnerRecord {
  return {
    id: p.id as string,
    slug: p.slug as string,
    name: p.name as string,
    legalName: (p.legalName as string) || null,
    status: (p.status as PartnerRecord['status']) || 'PENDING',
    plan: (p.plan as PartnerRecord['plan']) || 'STARTER',
    contactName: p.contactName as string,
    contactEmail: p.contactEmail as string,
    contactPhone: (p.contactPhone as string) || null,
    website: (p.website as string) || null,
    country: (p.country as string) || null,
    logoUrl: (p.logoUrl as string) || null,
    faviconUrl: (p.faviconUrl as string) || null,
    primaryColor: (p.primaryColor as string) || '#14B8A6',
    accentColor: (p.accentColor as string) || '#D4A843',
    customDomain: (p.customDomain as string) || null,
    customDomainVerified: Boolean(p.customDomainVerified),
    supportEmail: (p.supportEmail as string) || null,
    fromEmailName: (p.fromEmailName as string) || null,
    commissionBps: (p.commissionBps as number) ?? 2000,
    creditsPool: (p.creditsPool as number) ?? 0,
    currency: (p.currency as string) || 'USD',
    notes: (p.notes as string) || null,
    activatedAt: p.activatedAt
      ? new Date(p.activatedAt as string).toISOString()
      : null,
    createdAt: new Date(p.createdAt as string).toISOString(),
    updatedAt: new Date(p.updatedAt as string).toISOString(),
  };
}

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
      partner: mapDbPartner(partner as unknown as Record<string, unknown>),
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
