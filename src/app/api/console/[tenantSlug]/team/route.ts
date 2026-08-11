import { NextRequest, NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { seatCapForOrgPlan } from '@/lib/console/rbac';
import { inviteMember, listMembers } from '@/lib/console/service';
import type { OrgMemberRole } from '@/lib/console/types';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;

  const members = await listMembers(auth);
  const cap = seatCapForOrgPlan(auth.organization.plan);
  return NextResponse.json({
    ok: true,
    members,
    seats: { used: members.filter((m) => m.status !== 'REVOKED').length, cap },
    tenantId: auth.organizationId,
  });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'manage_team');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    name?: string;
    role?: OrgMemberRole;
  };
  if (!body.email?.trim()) {
    return NextResponse.json({ error: 'email required' }, { status: 400 });
  }

  const members = await listMembers(auth);
  const cap = seatCapForOrgPlan(auth.organization.plan);
  if (members.filter((m) => m.status !== 'REVOKED').length >= cap) {
    return NextResponse.json({ error: 'Seat limit reached' }, { status: 403 });
  }

  const member = await inviteMember(auth, {
    email: body.email.trim().toLowerCase(),
    name: body.name,
    role: body.role || 'REVIEWER',
  });
  return NextResponse.json({ ok: true, member }, { status: 201 });
}
