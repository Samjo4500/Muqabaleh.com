import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { clientIpFromHeaders, geoFromHeaders, hashIp } from '@/lib/analytics/hash';
import { ingestAnalyticsBatch, type IngestEventInput } from '@/lib/analytics/ingest';

export const runtime = 'nodejs';

async function handle(req: Request) {
  const ip = clientIpFromHeaders(req.headers) || 'unknown';
  if (!rateLimit(`analytics:${ip}`, 120, 60_000)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const events: IngestEventInput[] = Array.isArray(body)
    ? body
    : Array.isArray((body as { events?: unknown })?.events)
      ? ((body as { events: IngestEventInput[] }).events)
      : body && typeof body === 'object'
        ? [body as IngestEventInput]
        : [];

  if (!events.length) {
    return NextResponse.json({ ok: false, error: 'empty' }, { status: 400 });
  }

  const session = await getServerSession(authOptions).catch(() => null);
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id || null;
  if (sessionUserId) {
    for (const ev of events) {
      if (!ev.userId) ev.userId = sessionUserId;
    }
  }

  const geo = geoFromHeaders(req.headers);
  const result = await ingestAnalyticsBatch(events, {
    userAgent: req.headers.get('user-agent'),
    ipHash: hashIp(ip),
    country: geo.country,
    region: geo.region,
    city: geo.city,
  });

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(req: Request) {
  try {
    return await handle(req);
  } catch (err) {
    console.error('[analytics/collect]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

/** sendBeacon sometimes uses text/plain — accept POST only above; OPTIONS for CORS preflight none needed same-origin */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
