import { NextRequest, NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { listWebhooks, upsertWebhook } from '@/lib/partner/service';
import { demoStore } from '@/lib/partner/demo-data';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const webhooks = await listWebhooks(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json({ webhooks });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.role === 'PARTNER_MEMBER') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const body = await req.json();
  const url = String(body.url || '').trim();
  if (!url.startsWith('https://')) {
    return NextResponse.json({ error: 'HTTPS URL required' }, { status: 400 });
  }
  const events = Array.isArray(body.events)
    ? body.events.map(String)
    : ['interview.completed', 'candidate.scored'];
  const webhook = await upsertWebhook(ctx.partnerId, ctx.usingDemo, { url, events });
  return NextResponse.json({ webhook }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  if (ctx.usingDemo) {
    demoStore.webhooks = demoStore.webhooks.filter((w) => w.id !== id);
    return NextResponse.json({ ok: true });
  }
  try {
    const { db } = await import('@/lib/db');
    await db.partnerWebhook.deleteMany({ where: { id, partnerId: ctx.partnerId } });
  } catch {}
  return NextResponse.json({ ok: true });
}
