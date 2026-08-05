import { NextRequest, NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { createApiKey, listApiKeys, revokeApiKey } from '@/lib/partner/service';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const keys = await listApiKeys(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.role === 'PARTNER_MEMBER') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const body = await req.json();
  const name = String(body.name || 'API Key').trim();
  const scopes = Array.isArray(body.scopes) ? body.scopes.map(String) : ['read', 'write'];
  const key = await createApiKey(ctx.partnerId, ctx.usingDemo, name, scopes);
  return NextResponse.json({ key }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.role === 'PARTNER_MEMBER') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await revokeApiKey(ctx.partnerId, ctx.usingDemo, id);
  return NextResponse.json({ ok: true });
}
