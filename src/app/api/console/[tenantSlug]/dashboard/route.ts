import { NextResponse } from 'next/server';
import { isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { applyDemoClearedCookie } from '@/lib/console/demo-cleared';
import { getDashboard, listStages } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;

  if (auth.usingDemo) await applyDemoClearedCookie(tenantSlug);

  const [dashboard, stages] = await Promise.all([
    getDashboard(auth),
    listStages(auth),
  ]);

  return NextResponse.json({
    ok: true,
    organization: auth.organization,
    role: auth.role,
    usingDemo: auth.usingDemo,
    dashboard,
    stages,
  });
}
