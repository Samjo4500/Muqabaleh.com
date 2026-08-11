import { NextResponse } from 'next/server';
import { isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { clearDemoPassports } from '@/lib/console/demo-data';
import { demoClearedCookieName } from '@/lib/console/onboarding';

type Ctx = { params: Promise<{ tenantSlug: string }> };

/** Clear demo-tagged passports. Cookie persists clear across serverless cold starts. */
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
  const res = NextResponse.json({ ok: true, removed });
  res.cookies.set(demoClearedCookieName(tenantSlug), '1', {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    httpOnly: false,
  });
  return res;
}
