import { NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { listPassports } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'view_passports');
  if (denied) return denied;

  const passports = await listPassports(auth);
  return NextResponse.json({ ok: true, passports, tenantId: auth.organizationId });
}
