const BOT_UA =
  /bot|crawler|spider|crawling|lighthouse|pagespeed|pingdom|preview|headless|slurp|bingpreview|facebookexternalhit|whatsapp|telegram|discordbot|twitterbot/i;

const SKIP_PREFIXES = ['/admin', '/api', '/_next', '/favicon', '/manifest'];

export type VisitorStats = {
  available: boolean;
  pageviews24h: number;
  unique24h: number;
  pageviews7d: number;
  unique7d: number;
  topPages: { path: string; views: number }[];
};

export function emptyVisitorStats(): VisitorStats {
  return {
    available: false,
    pageviews24h: 0,
    unique24h: 0,
    pageviews7d: 0,
    unique7d: 0,
    topPages: [],
  };
}

export function isMissingRelationError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  if (e.code === 'P2021' || e.code === 'P2010') return true;
  return /does not exist|relation .* does not exist/i.test(String(e.message ?? ''));
}

export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

export function sanitizeVisitorKey(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const key = raw.trim();
  if (!/^[a-zA-Z0-9_-]{8,64}$/.test(key)) return null;
  return key;
}

export function sanitizeVisitPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  let path = raw.trim().split(/[?#]/)[0] ?? '';
  try {
    path = decodeURIComponent(path);
  } catch {
    return null;
  }
  if (!path.startsWith('/') || path.includes('..') || path.includes('\\')) return null;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 180) path = path.slice(0, 180);
  const lower = path.toLowerCase();
  if (/(^|\/)admin(\/|$)/.test(lower)) return null;
  if (SKIP_PREFIXES.some((p) => lower === p || lower.startsWith(`${p}/`))) return null;
  if (/\.(?:png|jpe?g|webp|gif|svg|ico|css|js|map|woff2?|txt|xml)$/i.test(path)) return null;
  return path || null;
}

export function sanitizeVisitLocale(raw: unknown): 'ar' | 'en' {
  return raw === 'en' ? 'en' : 'ar';
}
