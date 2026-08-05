import { NextRequest, NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { updatePartnerBranding } from '@/lib/partner/service';

export async function POST(req: NextRequest) {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;
  const body = await req.json();
  const partner = await updatePartnerBranding(ctx.partnerId, ctx.usingDemo, {
    name: body.name,
    logoUrl: body.logoUrl,
    primaryColor: body.primaryColor,
    accentColor: body.accentColor,
    customDomain: body.customDomain,
    supportEmail: body.supportEmail,
    fromEmailName: body.fromEmailName,
    website: body.website,
  });
  return NextResponse.json({ partner, ok: true });
}
