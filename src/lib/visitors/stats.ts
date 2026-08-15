import { db } from '@/lib/db';
import {
  LIVE_WINDOW_MS,
  bounceRate,
  pagesPerSession,
  rangeStart,
  type RangeKey,
} from '@/lib/visitors/parse';

const publicWhere = { isBot: false, isStaff: false };

function topN(
  rows: { key: string | null; count: number }[],
  limit = 10,
): { key: string; count: number }[] {
  return rows
    .filter((r) => r.key)
    .map((r) => ({ key: r.key as string, count: r.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getLiveVisitors() {
  const since = new Date(Date.now() - LIVE_WINDOW_MS);
  const rows = await db.visitorPresence.findMany({
    where: { lastSeenAt: { gte: since }, isStaff: false },
    orderBy: { lastSeenAt: 'desc' },
    take: 80,
    select: {
      sessionId: true,
      visitorId: true,
      path: true,
      title: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      locale: true,
      userId: true,
      lastSeenAt: true,
      startedAt: true,
    },
  });
  return {
    live: rows.length,
    checkedAt: new Date().toISOString(),
    visitors: rows.map((r) => ({
      ...r,
      lastSeenAt: r.lastSeenAt.toISOString(),
      startedAt: r.startedAt.toISOString(),
    })),
  };
}

export async function getVisitorDashboard(range: RangeKey) {
  const now = new Date();
  const from = rangeStart(range, now);
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const where = { ...publicWhere, createdAt: { gte: from } };

  const pageviews = await db.visitorPageview.count({ where });
  const visitorGroups = await db.visitorPageview.groupBy({
    by: ['visitorId'],
    where,
    _count: { _all: true },
    _min: { createdAt: true },
  });
  const sessionGroups = await db.visitorPageview.groupBy({
    by: ['sessionId'],
    where,
    _count: { _all: true },
  });

  const uniqueVisitors = visitorGroups.length;
  const sessions = sessionGroups.length;
  const bounced = sessionGroups.filter((s) => s._count._all === 1).length;

  let newVisitors = 0;
  if (visitorGroups.length > 0) {
    const firstSeen = await db.visitorPageview.groupBy({
      by: ['visitorId'],
      where: { ...publicWhere, visitorId: { in: visitorGroups.map((v) => v.visitorId) } },
      _min: { createdAt: true },
    });
    const firstByVisitor = new Map(firstSeen.map((r) => [r.visitorId, r._min.createdAt]));
    newVisitors = visitorGroups.filter((v) => {
      const first = firstByVisitor.get(v.visitorId);
      return first && first >= from;
    }).length;
  }

  const pathGroups = await db.visitorPageview.groupBy({
    by: ['path'],
    where,
    _count: { _all: true },
  });
  const countryGroups = await db.visitorPageview.groupBy({
    by: ['country'],
    where,
    _count: { _all: true },
  });
  const deviceGroups = await db.visitorPageview.groupBy({
    by: ['device'],
    where,
    _count: { _all: true },
  });
  const browserGroups = await db.visitorPageview.groupBy({
    by: ['browser'],
    where,
    _count: { _all: true },
  });
  const osGroups = await db.visitorPageview.groupBy({
    by: ['os'],
    where,
    _count: { _all: true },
  });
  const localeGroups = await db.visitorPageview.groupBy({
    by: ['locale'],
    where,
    _count: { _all: true },
  });
  const referrerGroups = await db.visitorPageview.groupBy({
    by: ['referrerHost'],
    where,
    _count: { _all: true },
  });
  const sourceGroups = await db.visitorPageview.groupBy({
    by: ['utmSource'],
    where,
    _count: { _all: true },
  });

  const recentHour = await db.visitorPageview.findMany({
    where: { ...publicWhere, createdAt: { gte: hourAgo } },
    select: { createdAt: true },
    take: 4000,
  });
  const minuteBuckets = Array.from({ length: 60 }, (_, i) => {
    const t = new Date(now.getTime() - (59 - i) * 60 * 1000);
    return { minute: t.toISOString().slice(11, 16), views: 0 };
  });
  for (const row of recentHour) {
    const idx = 59 - Math.min(59, Math.floor((now.getTime() - row.createdAt.getTime()) / 60000));
    if (idx >= 0 && idx < 60) minuteBuckets[idx].views += 1;
  }

  const dayCount = range === '24h' ? 24 : range === '7d' ? 7 : 30;
  const trend: { label: string; views: number; visitors: number }[] = [];
  if (range === '24h') {
    const hourly = await db.visitorPageview.findMany({
      where,
      select: { createdAt: true, visitorId: true },
      take: 8000,
    });
    for (let i = 23; i >= 0; i -= 1) {
      const start = new Date(now.getTime() - (i + 1) * 3600000);
      const end = new Date(now.getTime() - i * 3600000);
      const slice = hourly.filter((r) => r.createdAt >= start && r.createdAt < end);
      trend.push({
        label: end.toISOString().slice(11, 13) + 'h',
        views: slice.length,
        visitors: new Set(slice.map((s) => s.visitorId)).size,
      });
    }
  } else {
    const daily = await db.visitorPageview.findMany({
      where,
      select: { createdAt: true, visitorId: true },
      take: 20000,
    });
    for (let i = dayCount - 1; i >= 0; i -= 1) {
      const start = new Date(now);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCDate(start.getUTCDate() - i);
      const end = new Date(start.getTime() + 86400000);
      const slice = daily.filter((r) => r.createdAt >= start && r.createdAt < end);
      trend.push({
        label: start.toISOString().slice(5, 10),
        views: slice.length,
        visitors: new Set(slice.map((s) => s.visitorId)).size,
      });
    }
  }

  const recent = await db.visitorPageview.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 25,
    select: {
      path: true,
      title: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      referrerHost: true,
      locale: true,
      userId: true,
      createdAt: true,
    },
  });

  const live = await getLiveVisitors();

  return {
    source: 'first-party',
    range,
    from: from.toISOString(),
    to: now.toISOString(),
    live,
    totals: {
      pageviews,
      uniqueVisitors,
      sessions,
      newVisitors,
      returningVisitors: Math.max(0, uniqueVisitors - newVisitors),
      bounceRate: bounceRate(sessions, bounced),
      pagesPerSession: pagesPerSession(pageviews, sessions),
    },
    lastHour: minuteBuckets,
    trend,
    topPages: topN(
      pathGroups.map((p) => ({ key: p.path, count: p._count._all })),
      12,
    ),
    topReferrers: topN(
      referrerGroups.map((p) => ({
        key: p.referrerHost === 'direct' || !p.referrerHost ? 'direct / none' : p.referrerHost,
        count: p._count._all,
      })),
    ),
    countries: topN(
      countryGroups.map((p) => ({ key: p.country || 'Unknown', count: p._count._all })),
    ),
    devices: topN(deviceGroups.map((p) => ({ key: p.device || 'Unknown', count: p._count._all })), 5),
    browsers: topN(
      browserGroups.map((p) => ({ key: p.browser || 'Unknown', count: p._count._all })),
      8,
    ),
    os: topN(osGroups.map((p) => ({ key: p.os || 'Unknown', count: p._count._all })), 6),
    locales: topN(
      localeGroups.map((p) => ({ key: p.locale || 'Unknown', count: p._count._all })),
      6,
    ),
    campaigns: topN(
      sourceGroups.map((p) => ({ key: p.utmSource || '(none)', count: p._count._all })),
      8,
    ),
    recent: recent.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

export async function countUniqueVisitorsSince(since: Date): Promise<number> {
  const rows = await db.visitorPageview.groupBy({
    by: ['visitorId'],
    where: { ...publicWhere, createdAt: { gte: since } },
  });
  return rows.length;
}
