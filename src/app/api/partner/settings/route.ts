import { NextRequest, NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { updatePartnerBranding } from '@/lib/partner/service';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  return NextResponse.json({ partner: ctx.partner });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  if (ctx.role === 'PARTNER_MEMBER') {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }
  const body = await req.json();
  const partner = await updatePartnerBranding(ctx.partnerId, ctx.usingDemo, body);
  return NextResponse.json({ partner });
}
