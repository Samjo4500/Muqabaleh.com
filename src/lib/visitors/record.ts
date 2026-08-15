import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import {
  isBotUserAgent,
  isStaffPath,
  normalizePath,
  parseBrowser,
  parseDevice,
  parseOs,
  parseUtm,
  referrerHostOf,
  shouldTrackPath,
} from '@/lib/visitors/parse';

export type CollectInput = {
  type: 'pageview' | 'heartbeat';
  visitorId: string;
  sessionId: string;
  path: string;
  title?: string | null;
  referrer?: string | null;
  search?: string | null;
  locale?: string | null;
  userId?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  country?: string | null;
  city?: string | null;
  region?: string | null;
  siteHost?: string | null;
};

function hashSecret(value: string): string {
  const secret = process.env.NEXTAUTH_SECRET || 'muqabaleh';
  return createHash('sha256').update(`${secret}:${value}`).digest('hex').slice(0, 32);
}

export async function recordVisitorEvent(input: CollectInput): Promise<{ ok: true; skipped?: string }> {
  const path = normalizePath(input.path || '/');
  if (!shouldTrackPath(path)) return { ok: true, skipped: 'path' };

  const ua = input.userAgent || '';
  const isBot = isBotUserAgent(ua);
  const isStaff = isStaffPath(path);
  const utm = parseUtm(input.search || '');
  const now = new Date();

  const device = parseDevice(ua);
  const browser = parseBrowser(ua);
  const os = parseOs(ua);
  const presence = {
    visitorId: input.visitorId,
    path,
    title: input.title?.slice(0, 160) || null,
    locale: input.locale?.slice(0, 8) || null,
    country: input.country?.slice(0, 8) || null,
    city: input.city?.slice(0, 80) || null,
    region: input.region?.slice(0, 80) || null,
    device,
    browser,
    userId: input.userId || null,
    isStaff,
  };

  await db.visitorPresence.upsert({
    where: { sessionId: input.sessionId },
    create: {
      sessionId: input.sessionId,
      ...presence,
      lastSeenAt: now,
      startedAt: now,
    },
    update: {
      ...presence,
      lastSeenAt: now,
    },
  });

  if (input.type === 'heartbeat') {
    if (Math.random() < 0.05) {
      const stale = new Date(Date.now() - 10 * 60 * 1000);
      await db.visitorPresence.deleteMany({ where: { lastSeenAt: { lt: stale } } });
    }
    return { ok: true };
  }

  if (isBot) return { ok: true, skipped: 'bot' };

  const recent = await db.visitorPageview.findFirst({
    where: {
      sessionId: input.sessionId,
      path,
      createdAt: { gte: new Date(Date.now() - 2500) },
    },
    select: { id: true },
  });
  if (recent) return { ok: true, skipped: 'dedup' };

  await db.visitorPageview.create({
    data: {
      visitorId: input.visitorId,
      sessionId: input.sessionId,
      path,
      title: presence.title,
      locale: presence.locale,
      country: presence.country,
      city: presence.city,
      region: presence.region,
      device,
      browser,
      os,
      userId: presence.userId,
      isStaff,
      referrer: input.referrer?.slice(0, 300) || null,
      referrerHost: referrerHostOf(input.referrer, input.siteHost || undefined),
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      ipHash: input.ip ? hashSecret(input.ip) : null,
      isBot: false,
    },
  });

  return { ok: true };
}
