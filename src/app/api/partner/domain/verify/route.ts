import { NextResponse } from 'next/server';
import { isPartnerCtx, requirePartnerContext } from '@/lib/partner/auth';
import { verifyPartnerCustomDomain } from '@/lib/partner/domain-verify';

/** POST — check DNS and flip customDomainVerified when CNAME/TXT matches. */
export async function POST() {
  const ctx = await requirePartnerContext();
  if (!isPartnerCtx(ctx)) return ctx;

  const result = await verifyPartnerCustomDomain({
    partnerId: ctx.partnerId,
    usingDemo: ctx.usingDemo,
    slug: ctx.partner.slug,
    customDomain: ctx.partner.customDomain,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
