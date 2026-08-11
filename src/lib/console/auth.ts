import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { can, type ConsolePermission } from './rbac';
import {
  DEMO_OWNER_USER_ID,
  getDemoBundle,
  isDemoSlug,
} from './demo-data';
import type { ConsoleOrganization, OrgMemberRole } from './types';

export type ConsoleContext = {
  userId: string;
  role: OrgMemberRole;
  organizationId: string;
  organization: ConsoleOrganization;
  usingDemo: boolean;
  slug: string;
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
 * Demo slugs (najm-tech, atlas-agency, bayan-university) always available for preview.
 * Every subsequent query MUST filter by organizationId (tenantId).
 */
export async function requireConsoleTenant(
  slug: string,
): Promise<ConsoleContext | NextResponse> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const sessionRole = (session?.user as { role?: string } | undefined)?.role;

  if (isDemoSlug(slug)) {
    const bundle = getDemoBundle(slug)!;
    return {
      userId: userId || DEMO_OWNER_USER_ID,
      role: 'OWNER',
      organizationId: bundle.org.id,
      organization: bundle.org,
      usingDemo: true,
      slug,
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

    if (sessionRole === 'SUPER_ADMIN') {
      return {
        userId,
        role: 'OWNER',
        organizationId: org.id,
        organization: mapOrg(org),
        usingDemo: false,
        slug,
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
      slug,
    };
  } catch (err) {
    console.warn('[console/auth] DB unavailable', err);
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

export function requireTenantType(
  ctx: ConsoleContext,
  types: ConsoleOrganization['tenantType'][],
): NextResponse | null {
  if (!types.includes(ctx.organization.tenantType)) {
    return NextResponse.json(
      { error: `Requires tenant type: ${types.join(' | ')}` },
      { status: 403 },
    );
  }
  return null;
}
