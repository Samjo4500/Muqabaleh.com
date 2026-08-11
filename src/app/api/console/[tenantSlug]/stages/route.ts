import { NextResponse } from 'next/server';
import { isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { listStages } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const stages = await listStages(auth);
  return NextResponse.json({ ok: true, stages, tenantId: auth.organizationId });
}
