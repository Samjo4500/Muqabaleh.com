import { NextResponse } from 'next/server';
import {
  isConsoleCtx,
  requireConsoleTenant,
  requireTenantType,
} from '@/lib/console/auth';
import { getAgencyRevenue } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const wrong = requireTenantType(auth, ['AGENCY']);
  if (wrong) return wrong;

  const revenue = await getAgencyRevenue(auth);
  return NextResponse.json({ ok: true, revenue, tenantId: auth.organizationId });
}
