import { NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  return NextResponse.json({ partner: ctx.partner, role: ctx.role, usingDemo: ctx.usingDemo });
}
