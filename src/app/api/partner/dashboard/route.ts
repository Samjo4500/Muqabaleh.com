import { NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { getPartnerDashboard } from '@/lib/partner/service';

export async function GET() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const data = await getPartnerDashboard(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json(data);
}
