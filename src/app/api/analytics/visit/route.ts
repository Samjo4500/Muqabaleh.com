import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { enforceIpRateLimit } from '@/lib/rate-limit';
import { isBotUserAgent, recordSiteVisit } from '@/lib/analytics/site-visit';

export async function POST(req: NextRequest) {
  const blocked = await enforceIpRateLimit('site-visit', 60);
  if (blocked) return blocked;

  const hdrs = await headers();
  if (isBotUserAgent(hdrs.get('user-agent'))) {
    return new NextResponse(null, { status: 204 });
  }
  const purpose = `${hdrs.get('sec-purpose') ?? ''} ${hdrs.get('purpose') ?? ''}`.toLowerCase();
  if (purpose.includes('prefetch')) {
    return new NextResponse(null, { status: 204 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 204 });
  }

  await recordSiteVisit({
    path: body.path,
    locale: body.locale,
    visitorKey: body.visitorKey,
  });

  return new NextResponse(null, { status: 204 });
}
