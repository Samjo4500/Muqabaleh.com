import { NextRequest, NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { updateSettings } from '@/lib/console/service';
import type { WhiteLabelConfig } from '@/lib/console/types';

type Ctx = { params: Promise<{ tenantSlug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  return NextResponse.json({
    ok: true,
    organization: auth.organization,
    role: auth.role,
    usingDemo: auth.usingDemo,
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { tenantSlug } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'manage_settings');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    industry?: string;
    size?: string;
    country?: string;
    whiteLabel?: WhiteLabelConfig;
  };

  const organization = await updateSettings(auth, body);
  return NextResponse.json({ ok: true, organization });
}
