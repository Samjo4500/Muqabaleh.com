import { NextRequest, NextResponse } from 'next/server';
import { forbidUnless, isConsoleCtx, requireConsoleTenant } from '@/lib/console/auth';
import { addPassportNote, getPassport } from '@/lib/console/service';

type Ctx = { params: Promise<{ tenantSlug: string; id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { tenantSlug, id } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'view_passports');
  if (denied) return denied;

  const passport = await getPassport(auth, id);
  if (!passport) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, passport });
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { tenantSlug, id } = await ctx.params;
  const auth = await requireConsoleTenant(tenantSlug);
  if (!isConsoleCtx(auth)) return auth;
  const denied = forbidUnless(auth, 'add_notes');
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { note?: string; author?: string };
  if (!body.note?.trim()) {
    return NextResponse.json({ error: 'Note required' }, { status: 400 });
  }
  const passport = await addPassportNote(
    auth,
    id,
    body.note.trim(),
    body.author || 'Team',
  );
  if (!passport) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, passport });
}
