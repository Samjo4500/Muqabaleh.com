import { db } from '@/lib/db';
import {
  emptyVisitorStats,
  isMissingRelationError,
  sanitizeVisitLocale,
  sanitizeVisitPath,
  sanitizeVisitorKey,
  type VisitorStats,
} from './site-visit-sanitize';

export type { VisitorStats };
export {
  emptyVisitorStats,
  isBotUserAgent,
  isMissingRelationError,
  sanitizeVisitLocale,
  sanitizeVisitPath,
  sanitizeVisitorKey,
} from './site-visit-sanitize';

type CountRow = { pageviews: number; uniques: number };
type TopRow = { path: string; views: number };

export async function loadVisitorStats(since24h: Date, since7d: Date): Promise<VisitorStats> {
  try {
    const [h24, h7, top] = await Promise.all([
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(*)::int AS pageviews, COUNT(DISTINCT "visitorKey")::int AS uniques
        FROM "site_visits"
        WHERE "createdAt" >= ${since24h}
      `,
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(*)::int AS pageviews, COUNT(DISTINCT "visitorKey")::int AS uniques
        FROM "site_visits"
        WHERE "createdAt" >= ${since7d}
      `,
      db.$queryRaw<TopRow[]>`
        SELECT "path", COUNT(*)::int AS views
        FROM "site_visits"
        WHERE "createdAt" >= ${since7d}
        GROUP BY "path"
        ORDER BY views DESC
        LIMIT 8
      `,
    ]);
    return {
      available: true,
      pageviews24h: Number(h24[0]?.pageviews ?? 0),
      unique24h: Number(h24[0]?.uniques ?? 0),
      pageviews7d: Number(h7[0]?.pageviews ?? 0),
      unique7d: Number(h7[0]?.uniques ?? 0),
      topPages: (top ?? []).map((row) => ({
        path: row.path,
        views: Number(row.views ?? 0),
      })),
    };
  } catch (err) {
    if (isMissingRelationError(err)) return emptyVisitorStats();
    console.error('loadVisitorStats', err);
    return emptyVisitorStats();
  }
}

export async function recordSiteVisit(input: {
  path: unknown;
  locale: unknown;
  visitorKey: unknown;
}): Promise<'recorded' | 'skipped' | 'unavailable'> {
  const path = sanitizeVisitPath(input.path);
  const visitorKey = sanitizeVisitorKey(input.visitorKey);
  const locale = sanitizeVisitLocale(input.locale);
  if (!path || !visitorKey) return 'skipped';

  try {
    const recent = await db.siteVisit.findFirst({
      where: {
        visitorKey,
        path,
        createdAt: { gte: new Date(Date.now() - 30_000) },
      },
      select: { id: true },
    });
    if (recent) return 'skipped';
    await db.siteVisit.create({ data: { path, locale, visitorKey } });
    return 'recorded';
  } catch (err) {
    if (isMissingRelationError(err)) return 'unavailable';
    console.error('recordSiteVisit', err);
    return 'unavailable';
  }
}
