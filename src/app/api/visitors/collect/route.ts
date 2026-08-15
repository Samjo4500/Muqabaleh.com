import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getClientIp } from '@/lib/security';
import { recordVisitorEvent } from '@/lib/visitors/record';
import {
  SESSION_COOKIE,
  SESSION_IDLE_MS,
  VISITOR_COOKIE,
  decodeHeaderValue,
  isVisitorId,
  newVisitorId,
  normalizePath,
} from '@/lib/visitors/parse';

export const dynamic = 'force-dynamic';
export const maxDuration = 15;

function cookieOpts(maxAgeSec: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSec,
  };
}

function readIds(req: NextRequest, body: { visitorId?: string; sessionId?: string }) {
  const fromCookieVid = req.cookies.get(VISITOR_COOKIE)?.value;
  const fromCookieSid = req.cookies.get(SESSION_COOKIE)?.value;
  const visitorId = isVisitorId(body.visitorId)
    ? body.visitorId
    : isVisitorId(fromCookieVid)
      ? fromCookieVid
      : newVisitorId();
  const sessionId = isVisitorId(body.sessionId)
    ? body.sessionId
    : isVisitorId(fromCookieSid)
      ? fromCookieSid
      : newVisitorId();
  return { visitorId, sessionId };
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    let parsed: unknown = {};
    try {
      parsed = raw ? JSON.parse(raw) : {};
    } catch {
      parsed = {};
    }
    const body = parsed as {
      type?: string;
      path?: string;
      title?: string;
      referrer?: string;
      search?: string;
      locale?: string;
      visitorId?: string;
      sessionId?: string;
    };

    const type = body.type === 'heartbeat' ? 'heartbeat' : 'pageview';
    const path = normalizePath(body.path || req.headers.get('referer') || '/');
    const { visitorId, sessionId } = readIds(req, body);

    const session =
      type === 'pageview' ? await getServerSession(authOptions).catch(() => null) : null;
    const userId = (session?.user as { id?: string } | undefined)?.id || null;

    const host = (req.headers.get('host') || '').split(':')[0];
    await recordVisitorEvent({
      type,
      visitorId,
      sessionId,
      path,
      title: body.title,
      referrer: body.referrer,
      search: body.search,
      locale: body.locale,
      userId,
      userAgent: req.headers.get('user-agent'),
      ip: await getClientIp(),
      country: decodeHeaderValue(
        req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry'),
      ),
      city: decodeHeaderValue(req.headers.get('x-vercel-ip-city')),
      region: decodeHeaderValue(req.headers.get('x-vercel-ip-country-region')),
      siteHost: host,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(VISITOR_COOKIE, visitorId, cookieOpts(60 * 60 * 24 * 365));
    res.cookies.set(SESSION_COOKIE, sessionId, cookieOpts(Math.floor(SESSION_IDLE_MS / 1000)));
    return res;
  } catch (err) {
    console.error('[visitors/collect]', err);
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
