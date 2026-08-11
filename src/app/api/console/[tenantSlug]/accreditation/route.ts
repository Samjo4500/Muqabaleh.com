import { NextResponse } from 'next/server';
import {
  isConsoleCtx,
  requireConsoleTenant,
  requireTenantType,
} from '@/lib/console/auth';
import { getAccreditation } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const wrong = requireTenantType(auth, ['ACADEMY']);
  if (wrong) return wrong;

  const report = await getAccreditation(auth);
  return NextResponse.json({ ok: true, report, tenantId: auth.organizationId });
}
