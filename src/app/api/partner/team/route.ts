import { NextRequest, NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { inviteMember, listMembers } from '@/lib/partner/service';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const members = await listMembers(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json({ members });
}

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.role === 'PARTNER_MEMBER') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const body = await req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const name = String(body.name || '').trim();
  const password = String(body.password || '').trim();
  const role = body.role === 'PARTNER_ADMIN' ? 'PARTNER_ADMIN' : 'PARTNER_MEMBER';
  if (!email || !name || password.length < 8) {
    return NextResponse.json({ error: 'Invalid member payload' }, { status: 400 });
  }
  const member = await inviteMember(ctx.partnerId, ctx.usingDemo, { email, name, password, role });
  return NextResponse.json({ member }, { status: 201 });
}
