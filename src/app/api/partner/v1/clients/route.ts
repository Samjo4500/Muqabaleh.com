import { NextRequest, NextResponse } from 'next/server';
import { isApiKeyCtx, requirePartnerApiKey } from '@/lib/partner/api-key-auth';
import { listClients } from '@/lib/partner/service';

/** Public partner API — list client companies. */
export async function GET(req: NextRequest) {
  const ctx = await requirePartnerApiKey(req, { scope: 'read' });
  if (!isApiKeyCtx(ctx)) return ctx;

  const clients = await listClients(ctx.partnerId, ctx.usingDemo);
  return NextResponse.json({ clients });
}
