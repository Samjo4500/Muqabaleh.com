/**
 * Conversion funnel events — shared by GA4 (gtag) and first-party /api/analytics.
 * Unknown / null / undefined parameters are omitted. Never send null.
 */

export const FUNNEL_EVENT_NAMES = [
  'interview_started',
  'interview_completed',
  'guide_viewed',
  'signup_initiated',
  'signup_completed',
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENT_NAMES)[number];

export type FunnelLanguage = 'ar' | 'en';
export type FunnelGuideType = 'company' | 'role';
export type FunnelSignupLocation = 'homepage' | 'guide' | 'pricing';
export type FunnelPlan = 'free' | 'pro' | 'enterprise';

export type FunnelEventParams = {
  language?: FunnelLanguage;
  role?: string;
  duration_seconds?: number;
  guide_type?: FunnelGuideType;
  guide_slug?: string;
  location?: FunnelSignupLocation;
  plan?: FunnelPlan;
};

export type CompactFunnelParams = {
  [K in keyof FunnelEventParams]: NonNullable<FunnelEventParams[K]>;
};

export type FunnelEventPayload = {
  name: FunnelEventName;
} & CompactFunnelParams & {
    path?: string;
  };

const FUNNEL_SET = new Set<string>(FUNNEL_EVENT_NAMES);

export function isFunnelEventName(value: unknown): value is FunnelEventName {
  return typeof value === 'string' && FUNNEL_SET.has(value);
}

export function isValidGaMeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id.trim());
}

export function normalizeLanguage(value?: string | null): FunnelLanguage | undefined {
  if (!value) return undefined;
  const s = value.trim().toLowerCase();
  if (s === 'ar' || s.startsWith('ar') || s === 'arabic') return 'ar';
  if (s === 'en' || s.startsWith('en') || s === 'english') return 'en';
  return undefined;
}

export function normalizeGuideType(value?: string | null): FunnelGuideType | undefined {
  if (value === 'company' || value === 'role') return value;
  return undefined;
}

export function normalizeSignupLocation(
  value?: string | null,
): FunnelSignupLocation | undefined {
  if (value === 'homepage' || value === 'guide' || value === 'pricing') return value;
  return undefined;
}

export function inferSignupLocation(pathname?: string | null): FunnelSignupLocation {
  const p = (pathname || '').replace(/^\/en(?=\/|$)/, '') || '/';
  if (p.includes('interview-guide')) return 'guide';
  if (p.includes('pricing') || p.includes('packages')) return 'pricing';
  return 'homepage';
}

export function normalizePlan(value?: string | null): FunnelPlan | undefined {
  if (!value) return undefined;
  const s = value.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (
    s === 'free' ||
    s === 'basic' ||
    s === 'individual'
  ) {
    return 'free';
  }
  if (
    s === 'enterprise' ||
    s === 'b2b' ||
    s === 'company' ||
    s === 'employer'
  ) {
    return 'enterprise';
  }
  if (
    s === 'pro' ||
    s === 'premium' ||
    s === 'jeannie' ||
    s === 'jeannie_pro' ||
    s === 'unlimited' ||
    s === 'mastery' ||
    s === 'mastery_pack' ||
    s === 'paid'
  ) {
    return 'pro';
  }
  return undefined;
}

export function normalizeRole(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clipped = value.trim().slice(0, 80);
  return clipped || undefined;
}

export function normalizeGuideSlug(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clipped = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 80);
  return clipped || undefined;
}

export function normalizeDurationSeconds(value?: number | null): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const n = Math.round(value);
  if (n < 0 || n > 86_400) return undefined;
  return n;
}

export function normalizePath(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;
  const clipped = value.trim().slice(0, 300);
  if (!clipped.startsWith('/')) return undefined;
  if (clipped.startsWith('/api')) return undefined;
  return clipped;
}

/**
 * Drop null / undefined / empty values. Never returns keys with null.
 */
export function compactParams(
  params?: Record<string, unknown> | FunnelEventParams | null,
): CompactFunnelParams {
  const out: Record<string, string | number> = {};
  if (!params) return out as CompactFunnelParams;

  const language = normalizeLanguage(
    typeof params.language === 'string' ? params.language : undefined,
  );
  if (language) out.language = language;

  const role = normalizeRole(typeof params.role === 'string' ? params.role : undefined);
  if (role) out.role = role;

  const duration = normalizeDurationSeconds(
    typeof params.duration_seconds === 'number' ? params.duration_seconds : undefined,
  );
  if (duration !== undefined) out.duration_seconds = duration;

  const guideType = normalizeGuideType(
    typeof params.guide_type === 'string' ? params.guide_type : undefined,
  );
  if (guideType) out.guide_type = guideType;

  const guideSlug = normalizeGuideSlug(
    typeof params.guide_slug === 'string' ? params.guide_slug : undefined,
  );
  if (guideSlug) out.guide_slug = guideSlug;

  const location = normalizeSignupLocation(
    typeof params.location === 'string' ? params.location : undefined,
  );
  if (location) out.location = location;

  const plan = normalizePlan(typeof params.plan === 'string' ? params.plan : undefined);
  if (plan) out.plan = plan;

  return out as CompactFunnelParams;
}

export function parseFunnelEventBody(body: unknown): FunnelEventPayload | null {
  if (!body || typeof body !== 'object') return null;
  const rec = body as Record<string, unknown>;
  if (!isFunnelEventName(rec.name)) return null;
  const compact = compactParams(rec);
  const path = normalizePath(typeof rec.path === 'string' ? rec.path : undefined);
  return path ? { name: rec.name, ...compact, path } : { name: rec.name, ...compact };
}

/** Asia/Riyadh calendar day bounds (UTC+3, no DST). offsetDays 0 = today, -1 = yesterday. */
export function riyadhDayBounds(offsetDays = 0): {
  start: Date;
  end: Date;
  label: string;
} {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  const month = Number(parts.find((p) => p.type === 'month')?.value);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const start = new Date(Date.UTC(year, month - 1, day + offsetDays, -3, 0, 0, 0));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const labelDate = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  const label = labelDate.toISOString().slice(0, 10);
  return { start, end, label };
}

export function ratePercent(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}
