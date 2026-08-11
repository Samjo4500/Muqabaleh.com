import { NextRequest, NextResponse } from 'next/server';
import { isApiKeyCtx, requirePartnerApiKey } from '@/lib/partner/api-key-auth';

/** Public partner API — identity + branding snapshot. */
export async function GET(req: NextRequest) {
  const ctx = await requirePartnerApiKey(req, { scope: 'read' });
  if (!isApiKeyCtx(ctx)) return ctx;

  const p = ctx.partner;
  return NextResponse.json({
    partner: {
      id: p.id,
      slug: p.slug,
      name: p.name,
      plan: p.plan,
      status: p.status,
      primaryColor: p.primaryColor,
      accentColor: p.accentColor,
      logoUrl: p.logoUrl,
      customDomain: p.customDomain,
      customDomainVerified: p.customDomainVerified,
      supportEmail: p.supportEmail,
      creditsPool: p.creditsPool,
    },
    auth: { keyId: ctx.keyId, scopes: ctx.scopes, mode: ctx.usingDemo ? 'demo' : 'live' },
  });
}
