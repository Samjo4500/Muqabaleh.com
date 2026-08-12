import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { hostFromReferrer, parseUserAgent } from '@/lib/analytics/ua';
import {
  clip,
  normalizePath,
  sanitizeQuery,
  MAX_HREF,
  MAX_REF,
  MAX_TEXT,
  MAX_TITLE,
  MAX_UA,
} from '@/lib/analytics/sanitize';

const ALLOWED_TYPES = new Set([
  'pageview',
  'scroll',
  'outbound',
  'click',
  'exit',
  'engage',
  'error',
  'custom',
]);

export type IngestEventInput = {
  type?: string;
  visitorId?: string;
  sessionId?: string;
  userId?: string | null;
  path?: string;
  query?: string | null;
  hash?: string | null;
  locale?: string | null;
  title?: string | null;
  referrer?: string | null;
  previousPath?: string | null;
  durationMs?: number | null;
  scrollPct?: number | null;
  clickHref?: string | null;
  clickText?: string | null;
  screenW?: number | null;
  screenH?: number | null;
  viewportW?: number | null;
  viewportH?: number | null;
  timezone?: string | null;
  language?: string | null;
  connection?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
  gclid?: string | null;
  fbclid?: string | null;
  entryUrl?: string | null;
  meta?: Record<string, unknown> | null;
  occurredAt?: string | null;
};

export type IngestContext = {
  userAgent: string | null;
  ipHash: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
};

function intOrNull(v: unknown, min = 0, max = 10_000_000): number | null {
  if (typeof v !== 'number' || !Number.isFinite(v)) return null;
  const n = Math.round(v);
  if (n < min || n > max) return null;
  return n;
}

function idOk(id: unknown): id is string {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{8,80}$/.test(id);
}

export async function ingestAnalyticsBatch(
  events: IngestEventInput[],
  ctx: IngestContext,
): Promise<{ accepted: number; skipped: number }> {
  let accepted = 0;
  let skipped = 0;
  const ua = parseUserAgent(ctx.userAgent);

  for (const raw of events.slice(0, 25)) {
    try {
      const type = typeof raw.type === 'string' ? raw.type.toLowerCase() : '';
      if (!ALLOWED_TYPES.has(type) || !idOk(raw.visitorId) || !idOk(raw.sessionId)) {
        skipped++;
        continue;
      }

      const path = clip(raw.path, 500) || '/';
      const pathNorm = normalizePath(path);
      // Never log private API noise
      if (pathNorm.startsWith('/api')) {
        skipped++;
        continue;
      }

      const visitorId = raw.visitorId;
      const sessionId = raw.sessionId;
      const userId = clip(raw.userId, 80);
      const referrer = clip(raw.referrer, MAX_REF);
      const referrerHost = hostFromReferrer(referrer);
      const durationMs = intOrNull(raw.durationMs, 0, 86_400_000) ?? 0;
      const scrollPct = intOrNull(raw.scrollPct, 0, 100);
      const screenW = intOrNull(raw.screenW, 0, 10000);
      const screenH = intOrNull(raw.screenH, 0, 10000);
      const viewportW = intOrNull(raw.viewportW, 0, 10000);
      const viewportH = intOrNull(raw.viewportH, 0, 10000);
      const occurredAt =
        raw.occurredAt && !Number.isNaN(Date.parse(raw.occurredAt))
          ? new Date(raw.occurredAt)
          : new Date();

      const utmSource = clip(raw.utmSource, 120);
      const utmMedium = clip(raw.utmMedium, 120);
      const utmCampaign = clip(raw.utmCampaign, 160);
      const utmTerm = clip(raw.utmTerm, 160);
      const utmContent = clip(raw.utmContent, 160);
      const gclid = clip(raw.gclid, 200);
      const fbclid = clip(raw.fbclid, 200);
      const locale = clip(raw.locale, 12);
      const language = clip(raw.language, 40);
      const timezone = clip(raw.timezone, 64);
      const connection = clip(raw.connection, 40);
      const title = clip(raw.title, MAX_TITLE);
      const previousPath = clip(raw.previousPath, 500);
      const query = sanitizeQuery(raw.query);
      const hash = clip(raw.hash, 200);
      const clickHref = clip(raw.clickHref, MAX_HREF);
      const clickText = clip(raw.clickText, MAX_TEXT);
      const entryUrl = clip(raw.entryUrl, MAX_REF);
      const isBot = ua.isBot;

      await db.analyticsVisitor.upsert({
        where: { id: visitorId },
        create: {
          id: visitorId,
          userId,
          country: ctx.country,
          region: ctx.region,
          city: ctx.city,
          deviceClass: ua.deviceClass,
          browser: ua.browser,
          os: ua.os,
          language,
          timezone,
          isBot,
          pageviews: type === 'pageview' ? 1 : 0,
          sessions: 0,
        },
        update: {
          lastSeenAt: occurredAt,
          ...(userId ? { userId } : {}),
          ...(ctx.country ? { country: ctx.country, region: ctx.region, city: ctx.city } : {}),
          deviceClass: ua.deviceClass,
          browser: ua.browser,
          os: ua.os,
          ...(language ? { language } : {}),
          ...(timezone ? { timezone } : {}),
          isBot,
          ...(type === 'pageview' ? { pageviews: { increment: 1 } } : {}),
        },
      });

      const existingSession = await db.analyticsSession.findUnique({
        where: { id: sessionId },
        select: { id: true, pageCount: true, durationMs: true, maxScrollPct: true },
      });

      if (!existingSession) {
        await db.analyticsSession.create({
          data: {
            id: sessionId,
            visitorId,
            startedAt: occurredAt,
            landingPath: pathNorm,
            exitPath: pathNorm,
            entryUrl,
            referrer,
            referrerHost,
            utmSource,
            utmMedium,
            utmCampaign,
            utmTerm,
            utmContent,
            gclid,
            fbclid,
            locale,
            userAgent: clip(ctx.userAgent, MAX_UA),
            browser: ua.browser,
            os: ua.os,
            deviceClass: ua.deviceClass,
            country: ctx.country,
            region: ctx.region,
            city: ctx.city,
            language,
            timezone,
            screenW,
            screenH,
            isBot,
            pageCount: type === 'pageview' ? 1 : 0,
            durationMs,
            maxScrollPct: scrollPct ?? 0,
            userId,
            ipHash: ctx.ipHash,
          },
        });
        await db.analyticsVisitor.update({
          where: { id: visitorId },
          data: { sessions: { increment: 1 } },
        });
      } else {
        await db.analyticsSession.update({
          where: { id: sessionId },
          data: {
            endedAt: occurredAt,
            exitPath: pathNorm,
            ...(userId ? { userId } : {}),
            ...(ctx.country
              ? { country: ctx.country, region: ctx.region, city: ctx.city }
              : {}),
            ...(type === 'pageview' ? { pageCount: { increment: 1 } } : {}),
            durationMs: Math.max(existingSession.durationMs, durationMs),
            maxScrollPct: Math.max(existingSession.maxScrollPct, scrollPct ?? 0),
          },
        });
      }

      // engage heartbeats only refresh session — avoid event spam
      if (type === 'engage') {
        accepted++;
        continue;
      }

      await db.analyticsEvent.create({
        data: {
          type,
          visitorId,
          sessionId,
          userId,
          occurredAt,
          path,
          pathNorm,
          query,
          hash,
          locale,
          title,
          referrer,
          previousPath,
          durationMs: durationMs || null,
          scrollPct,
          clickHref,
          clickText,
          screenW,
          screenH,
          viewportW,
          viewportH,
          country: ctx.country,
          region: ctx.region,
          city: ctx.city,
          deviceClass: ua.deviceClass,
          browser: ua.browser,
          os: ua.os,
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
          gclid,
          fbclid,
          isBot,
          ipHash: ctx.ipHash,
          timezone,
          language,
          connection,
          meta:
            raw.meta && typeof raw.meta === 'object'
              ? (raw.meta as Prisma.InputJsonValue)
              : undefined,
        },
      });
      accepted++;
    } catch (err) {
      console.error('[analytics ingest]', err);
      skipped++;
    }
  }

  return { accepted, skipped };
}
