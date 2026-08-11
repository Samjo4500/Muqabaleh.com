import { NextRequest, NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { movePassportStage } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string; candidateId: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { tenantSlug, candidateId } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'move_pipeline');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { stageKey?: string };
  if (!body.stageKey) {
    return NextResponse.json({ error: 'stageKey required' }, { status: 400 });
  }

  const passport = await movePassportStage(auth, candidateId, body.stageKey);
  if (!passport) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, passport });
}
