export const VISITOR_COOKIE = 'mq_vid';
export const SESSION_COOKIE = 'mq_sid';
export const SESSION_IDLE_MS = 30 * 60 * 1000;
export const LIVE_WINDOW_MS = 90 * 1000;

const BOT_RE =
  /bot|crawl|spider|slurp|facebookexternalhit|preview|monitor|lighthouse|headless|pingdom|gtmetrix|semrush|ahrefs|bytespider|chatgpt|gptbot|claudebot|perplexity/i;

export function newVisitorId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

export function isVisitorId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value);
}

export function isBotUserAgent(ua: string): boolean {
  if (!ua || ua.length < 8) return true;
  return BOT_RE.test(ua);
}

export function parseDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (/ipad|tablet|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.+mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function parseBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\/|opera/i.test(ua)) return 'Opera';
  if (/samsungbrowser/i.test(ua)) return 'Samsung';
  if (/firefox|fxios/i.test(ua)) return 'Firefox';
  if (/crios|chrome/i.test(ua)) return 'Chrome';
  if (/safari/i.test(ua)) return 'Safari';
  return 'Other';
}

export function parseOs(ua: string): string {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/android/i.test(ua)) return 'Android';
  if (/mac os x/i.test(ua)) return 'macOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

export function normalizePath(raw: string): string {
  try {
    const path = raw.startsWith('http') ? new URL(raw).pathname : raw;
    const clean = path.split('?')[0].split('#')[0] || '/';
    const stripped = clean.replace(/^\/(ar|en)(?=\/|$)/, '') || '/';
    return stripped.slice(0, 240);
  } catch {
    return '/';
  }
}

export function isStaffPath(path: string): boolean {
  const p = normalizePath(path);
  return p === '/admin' || p.startsWith('/admin/');
}

export function shouldTrackPath(path: string): boolean {
  const p = normalizePath(path);
  if (p.startsWith('/api/')) return false;
  if (p.startsWith('/_next')) return false;
  if (/\.[a-z0-9]{1,8}$/i.test(p)) return false;
  return true;
}

export function referrerHostOf(referrer: string | null | undefined, siteHost?: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '');
    if (!host) return null;
    if (siteHost && host === siteHost.replace(/^www\./, '')) return 'direct';
    return host.slice(0, 120);
  } catch {
    return null;
  }
}

export function parseUtm(search: string): {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
} {
  const q = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const pick = (k: string) => {
    const v = q.get(k)?.trim();
    return v ? v.slice(0, 80) : null;
  };
  return {
    utmSource: pick('utm_source'),
    utmMedium: pick('utm_medium'),
    utmCampaign: pick('utm_campaign'),
  };
}

export function decodeHeaderValue(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value).slice(0, 80);
  } catch {
    return value.slice(0, 80);
  }
}

export type RangeKey = '24h' | '7d' | '30d';

export function rangeStart(range: RangeKey, now = new Date()): Date {
  const ms =
    range === '24h'
      ? 24 * 60 * 60 * 1000
      : range === '7d'
        ? 7 * 24 * 60 * 60 * 1000
        : 30 * 24 * 60 * 60 * 1000;
  return new Date(now.getTime() - ms);
}

export function bounceRate(sessions: number, bounced: number): number {
  if (sessions <= 0) return 0;
  return Math.round((bounced / sessions) * 100);
}

export function pagesPerSession(pageviews: number, sessions: number): number {
  if (sessions <= 0) return 0;
  return Math.round((pageviews / sessions) * 10) / 10;
}
