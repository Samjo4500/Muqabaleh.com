import { db } from '@/lib/db';

function sinceDays(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getTrafficAnalytics(days = 7) {
  const since = sinceDays(Math.min(Math.max(days, 1), 90));
  const dayAgo = sinceDays(1);
  const now = new Date();

  const [
    pageviews,
    pageviews24h,
    sessions,
    sessions24h,
    visitors,
    visitors24h,
    avgDuration,
    avgScroll,
    topPages,
    topCountries,
    topDevices,
    topBrowsers,
    topOs,
    topReferrers,
    topUtmSources,
    topCampaigns,
    locales,
    outbound,
    errors,
    recent,
    hourly,
    dailyRows,
  ] = await Promise.all([
    db.analyticsEvent.count({
      where: { type: 'pageview', isBot: false, occurredAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { type: 'pageview', isBot: false, occurredAt: { gte: dayAgo } },
    }),
    db.analyticsSession.count({
      where: { isBot: false, startedAt: { gte: since } },
    }),
    db.analyticsSession.count({
      where: { isBot: false, startedAt: { gte: dayAgo } },
    }),
    db.analyticsVisitor.count({
      where: { isBot: false, lastSeenAt: { gte: since } },
    }),
    db.analyticsVisitor.count({
      where: { isBot: false, lastSeenAt: { gte: dayAgo } },
    }),
    db.analyticsSession.aggregate({
      where: { isBot: false, startedAt: { gte: since }, durationMs: { gt: 0 } },
      _avg: { durationMs: true },
    }),
    db.analyticsSession.aggregate({
      where: { isBot: false, startedAt: { gte: since } },
      _avg: { maxScrollPct: true },
    }),
    db.analyticsEvent.groupBy({
      by: ['pathNorm'],
      where: { type: 'pageview', isBot: false, occurredAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { pathNorm: 'desc' } },
      take: 20,
    }),
    db.analyticsEvent.groupBy({
      by: ['country'],
      where: {
        type: 'pageview',
        isBot: false,
        occurredAt: { gte: since },
        country: { not: null },
      },
      _count: { _all: true },
      orderBy: { _count: { country: 'desc' } },
      take: 15,
    }),
    db.analyticsSession.groupBy({
      by: ['deviceClass'],
      where: { isBot: false, startedAt: { gte: since }, deviceClass: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { deviceClass: 'desc' } },
      take: 8,
    }),
    db.analyticsSession.groupBy({
      by: ['browser'],
      where: { isBot: false, startedAt: { gte: since }, browser: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { browser: 'desc' } },
      take: 10,
    }),
    db.analyticsSession.groupBy({
      by: ['os'],
      where: { isBot: false, startedAt: { gte: since }, os: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { os: 'desc' } },
      take: 10,
    }),
    db.analyticsSession.groupBy({
      by: ['referrerHost'],
      where: { isBot: false, startedAt: { gte: since }, referrerHost: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { referrerHost: 'desc' } },
      take: 15,
    }),
    db.analyticsSession.groupBy({
      by: ['utmSource'],
      where: { isBot: false, startedAt: { gte: since }, utmSource: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { utmSource: 'desc' } },
      take: 15,
    }),
    db.analyticsSession.groupBy({
      by: ['utmCampaign'],
      where: { isBot: false, startedAt: { gte: since }, utmCampaign: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { utmCampaign: 'desc' } },
      take: 15,
    }),
    db.analyticsEvent.groupBy({
      by: ['locale'],
      where: { type: 'pageview', isBot: false, occurredAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { locale: 'desc' } },
      take: 5,
    }),
    db.analyticsEvent.count({
      where: { type: 'outbound', isBot: false, occurredAt: { gte: since } },
    }),
    db.analyticsEvent.count({
      where: { type: 'error', occurredAt: { gte: since } },
    }),
    db.analyticsEvent.findMany({
      where: { type: 'pageview', isBot: false },
      orderBy: { occurredAt: 'desc' },
      take: 50,
      select: {
        id: true,
        occurredAt: true,
        pathNorm: true,
        path: true,
        locale: true,
        country: true,
        city: true,
        deviceClass: true,
        browser: true,
        os: true,
        referrer: true,
        utmSource: true,
        utmCampaign: true,
        visitorId: true,
        sessionId: true,
        userId: true,
        title: true,
      },
    }),
    db.analyticsEvent.findMany({
      where: { type: 'pageview', isBot: false, occurredAt: { gte: dayAgo } },
      select: { occurredAt: true },
      take: 5000,
    }),
    db.analyticsEvent.findMany({
      where: { type: 'pageview', isBot: false, occurredAt: { gte: since } },
      select: { occurredAt: true },
      take: 20000,
    }),
  ]);

  const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({ hour, count: 0 }));
  for (const row of hourly) {
    hourBuckets[row.occurredAt.getUTCHours()]!.count++;
  }

  const dailyMap = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const row of dailyRows) {
    const key = row.occurredAt.toISOString().slice(0, 10);
    if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
  }

  const mapCount = <T extends string>(
    rows: { _count: { _all: number } }[],
    key: T,
  ) =>
    rows.map((r) => ({
      key: String((r as Record<string, unknown>)[key] ?? 'unknown'),
      count: r._count._all,
    }));

  return {
    rangeDays: days,
    totals: {
      pageviews,
      pageviews24h,
      sessions,
      sessions24h,
      visitors,
      visitors24h,
      outbound,
      errors,
      avgDurationSec: Math.round((avgDuration._avg.durationMs || 0) / 1000),
      avgScrollPct: Math.round(avgScroll._avg.maxScrollPct || 0),
      pagesPerSession: sessions > 0 ? Math.round((pageviews / sessions) * 10) / 10 : 0,
    },
    topPages: mapCount(topPages, 'pathNorm'),
    topCountries: mapCount(topCountries, 'country'),
    topDevices: mapCount(topDevices, 'deviceClass'),
    topBrowsers: mapCount(topBrowsers, 'browser'),
    topOs: mapCount(topOs, 'os'),
    topReferrers: mapCount(topReferrers, 'referrerHost'),
    topUtmSources: mapCount(topUtmSources, 'utmSource'),
    topCampaigns: mapCount(topCampaigns, 'utmCampaign'),
    locales: mapCount(locales, 'locale'),
    hourlyUtc: hourBuckets,
    daily: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
    recent,
  };
}

export async function countVisitors24h(): Promise<number> {
  try {
    return await db.analyticsVisitor.count({
      where: { isBot: false, lastSeenAt: { gte: sinceDays(1) } },
    });
  } catch {
    return 0;
  }
}
