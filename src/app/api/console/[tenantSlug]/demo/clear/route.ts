import { NextResponse } from 'next/server';
import { isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { clearDemoPassports } from '@/lib/console/demo-data';

type Ctx = { params: Promise<{ tenantSlug: string }> };

/** Clear demo-tagged passports for the current demo tenant (in-memory only). */
export async function POST(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;

  if (!auth.usingDemo) {
    return NextResponse.json(
      { ok: false, error: 'Demo clear is only available on demo tenants.' },
      { status: 400 },
    );
  }

  const removed = clearDemoPassports(tenantSlug);
  return NextResponse.json({ ok: true, removed });
}
