import { NextRequest, NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { createClient, listClients } from '@/lib/partner/service';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const clients = await listClients(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json({ clients, creditsPool: ctx.partner.creditsPool });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.role === 'PARTNER_MEMBER') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const body = await req.json();
  if (!body.name || !body.industry || !body.country) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  try {
    const client = await createClient(ctx.partnerId, ctx.usingDemo, body);
    return NextResponse.json({ client }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 });
  }
}
