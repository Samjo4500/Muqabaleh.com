import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { can, type ConsolePermission } from './rbac';
import {
  DEMO_ORG_ID,
  DEMO_ORG_SLUG,
  DEMO_OWNER_USER_ID,
  demoConsoleStore,
  isDemoSlug,
} from './demo-data';
import type { ConsoleOrganization, OrgMemberRole } from './types';

export type ConsoleContext = {
  userId: string;
  role: OrgMemberRole;
  organizationId: string;
  organization: ConsoleOrganization;
  usingDemo: boolean;
};

function mapOrg(row: {
  id: string;
  slug: string;
  name: string;
  tenantType: string;
  plan: string;
  industry: string | null;
  size: string | null;
  country: string | null;
  companyId: string | null;
  whiteLabel: unknown;
  status: string;
}): ConsoleOrganization {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tenantType: row.tenantType as ConsoleOrganization['tenantType'],
    plan: row.plan as ConsoleOrganization['plan'],
    industry: row.industry,
    size: row.size,
    country: row.country,
    companyId: row.companyId,
    whiteLabel: (row.whiteLabel as ConsoleOrganization['whiteLabel']) || null,
    status: row.status,
  };
}

/**
 * Resolve tenant by slug and enforce membership.
 * Demo slug `najm-tech` is always available for Phase 1 preview.
 * Every subsequent query MUST filter by organizationId (tenantId).
 */
export async function requireConsoleTenant(
  slug: string,
): Promise<ConsoleContext | NextResponse> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;

  if (isDemoSlug(slug)) {
    // Preview: allow authenticated users + anonymous read of demo tenant
    const role: OrgMemberRole =
      sessionRole === 'SUPER_ADMIN' || sessionRole === 'COMPANY_ADMIN'
        ? 'OWNER'
        : 'OWNER';
    return {
      userId: userId || DEMO_OWNER_USER_ID,
      role,
      organizationId: DEMO_ORG_ID,
      organization: demoConsoleStore.org,
      usingDemo: true,
    };
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const org = await db.organization.findUnique({ where: { slug } });
    if (!org || org.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Phase 1: Employer only
    if (org.tenantType !== 'EMPLOYER') {
      return NextResponse.json(
        { error: 'This tenant type is not available in Phase 1' },
        { status: 403 },
      );
    }

    if (sessionRole === 'SUPER_ADMIN') {
      return {
        userId,
        role: 'OWNER',
        organizationId: org.id,
        organization: mapOrg(org),
        usingDemo: false,
      };
    }

    const membership = await db.organizationMember.findFirst({
      where: {
        organizationId: org.id,
        userId,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return {
      userId,
      role: membership.role as OrgMemberRole,
      organizationId: org.id,
      organization: mapOrg(org),
      usingDemo: false,
    };
  } catch (err) {
    // Schema not migrated yet — fall back to demo for preview
    console.warn('[console/auth] DB unavailable, demo fallback', err);
    if (slug === DEMO_ORG_SLUG) {
      return {
        userId: userId || DEMO_OWNER_USER_ID,
        role: 'OWNER',
        organizationId: DEMO_ORG_ID,
        organization: demoConsoleStore.org,
        usingDemo: true,
      };
    }
    return NextResponse.json({ error: 'Console unavailable' }, { status: 503 });
  }
}

export function isConsoleCtx(
  value: ConsoleContext | NextResponse,
): value is ConsoleContext {
  return !(value instanceof NextResponse);
}

export function forbidUnless(
  ctx: ConsoleContext,
  permission: ConsolePermission,
): NextResponse | null {
  if (!can(ctx.role, permission)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  return null;
}

/** Hard isolation helper — never trust client-supplied tenant ids. */
export function assertTenantId(ctx: ConsoleContext, tenantId: string): boolean {
  return ctx.organizationId === tenantId;
}
