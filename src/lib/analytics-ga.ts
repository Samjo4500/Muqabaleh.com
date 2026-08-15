/**
 * GA4 + first-party funnel tracking.
 * Funnel events always POST to /api/analytics (adblocker-proof).
 * GA4 gtag fires when the measurement snippet is present (consent mode in <head>).
 */

import { hasAnalyticsConsent } from '@/lib/cookie-consent';
import {
  compactParams,
  inferSignupLocation,
  isValidGaMeasurementId,
  normalizeLanguage,
  normalizePlan,
  normalizeRole,
  type FunnelEventName,
  type FunnelEventParams,
  type FunnelLanguage,
  type FunnelPlan,
  type FunnelSignupLocation,
} from '@/lib/analytics-funnel';

export type GaEventName =
  | FunnelEventName
  | 'passport_downloaded'
  | 'upgrade_clicked'
  | 'payment_completed';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const INTERVIEW_STARTED_AT_KEY = 'mq_funnel_interview_started_at';
const INTERVIEW_ROLE_KEY = 'mq_funnel_interview_role';
const INTERVIEW_LANG_KEY = 'mq_funnel_interview_language';
const SIGNUP_COMPLETED_KEY = 'mq_funnel_signup_completed';

export function getGaId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim() || '';
  return isValidGaMeasurementId(id) ? id : null;
}

function compactRecord(
  params?: Record<string, string | number | boolean> | FunnelEventParams,
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!params) return out;
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    out[key] = value as string | number | boolean;
  }
  return out;
}

function pushToGa(name: string, params: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...params });
}

function postFirstParty(
  name: FunnelEventName,
  params: ReturnType<typeof compactParams>,
): void {
  if (typeof window === 'undefined') return;
  const body = {
    name,
    ...params,
    path: window.location.pathname,
  };
  void fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    /* first-party analytics is best-effort */
  });
}

export function trackFunnelEvent(name: FunnelEventName, params?: FunnelEventParams): void {
  if (typeof window === 'undefined') return;
  const compact = compactParams(params);
  postFirstParty(name, compact);
  pushToGa(name, compact);
}

export function trackInterviewStarted(input?: {
  language?: string | null;
  role?: string | null;
  locale?: string | null;
}): void {
  const language =
    normalizeLanguage(input?.language) || normalizeLanguage(input?.locale);
  const role = normalizeRole(input?.role);
  try {
    sessionStorage.setItem(INTERVIEW_STARTED_AT_KEY, String(Date.now()));
    if (role) sessionStorage.setItem(INTERVIEW_ROLE_KEY, role);
    if (language) sessionStorage.setItem(INTERVIEW_LANG_KEY, language);
  } catch {
    /* ignore */
  }
  trackFunnelEvent('interview_started', {
    ...(language ? { language } : {}),
    ...(role ? { role } : {}),
  });
}

export function trackInterviewCompleted(input?: {
  language?: string | null;
  role?: string | null;
  locale?: string | null;
  durationSeconds?: number | null;
}): void {
  let startedAt: number | null = null;
  let storedRole: string | undefined;
  let storedLang: FunnelLanguage | undefined;
  try {
    const raw = sessionStorage.getItem(INTERVIEW_STARTED_AT_KEY);
    if (raw) startedAt = Number(raw);
    storedRole = normalizeRole(sessionStorage.getItem(INTERVIEW_ROLE_KEY));
    storedLang = normalizeLanguage(sessionStorage.getItem(INTERVIEW_LANG_KEY));
    sessionStorage.removeItem(INTERVIEW_STARTED_AT_KEY);
  } catch {
    /* ignore */
  }
  const language =
    normalizeLanguage(input?.language) || storedLang || normalizeLanguage(input?.locale);
  const role = normalizeRole(input?.role) || storedRole;
  const duration_seconds =
    typeof input?.durationSeconds === 'number'
      ? input.durationSeconds
      : startedAt && Number.isFinite(startedAt)
        ? Math.max(0, Math.round((Date.now() - startedAt) / 1000))
        : undefined;
  trackFunnelEvent('interview_completed', {
    ...(language ? { language } : {}),
    ...(role ? { role } : {}),
    ...(duration_seconds !== undefined ? { duration_seconds } : {}),
  });
}

export function trackSignupInitiated(input?: {
  location?: FunnelSignupLocation | string | null;
  language?: string | null;
  locale?: string | null;
  pathname?: string | null;
}): void {
  const language =
    normalizeLanguage(input?.language) || normalizeLanguage(input?.locale);
  const location =
    input?.location === 'homepage' ||
    input?.location === 'guide' ||
    input?.location === 'pricing'
      ? input.location
      : inferSignupLocation(
          input?.pathname ||
            (typeof window !== 'undefined' ? window.location.pathname : undefined),
        );
  trackFunnelEvent('signup_initiated', {
    location,
    ...(language ? { language } : {}),
  });
}

export function trackSignupCompleted(input?: {
  language?: string | null;
  locale?: string | null;
  plan?: string | null;
  onceKey?: string;
}): void {
  if (typeof window !== 'undefined') {
    try {
      const key = `${SIGNUP_COMPLETED_KEY}:${input?.onceKey || 'default'}`;
      if (sessionStorage.getItem(key) === '1') return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  }
  const language =
    normalizeLanguage(input?.language) || normalizeLanguage(input?.locale);
  const plan = normalizePlan(input?.plan);
  trackFunnelEvent('signup_completed', {
    ...(language ? { language } : {}),
    ...(plan ? { plan } : {}),
  });
}

export function trackGuideViewed(input: {
  guideType: 'company' | 'role';
  guideSlug: string;
  language?: string | null;
  locale?: string | null;
}): void {
  const language =
    normalizeLanguage(input.language) || normalizeLanguage(input.locale);
  trackFunnelEvent('guide_viewed', {
    guide_type: input.guideType,
    guide_slug: input.guideSlug,
    ...(language ? { language } : {}),
  });
}

/**
 * Legacy GA-only events (passport / payment extras). Funnel names dual-write.
 */
export function trackGaEvent(
  name: GaEventName,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return;
  if (
    name === 'interview_started' ||
    name === 'interview_completed' ||
    name === 'guide_viewed' ||
    name === 'signup_initiated' ||
    name === 'signup_completed'
  ) {
    trackFunnelEvent(name, params as FunnelEventParams);
    return;
  }
  if (!hasAnalyticsConsent()) return;
  if (!getGaId()) return;
  pushToGa(name, compactRecord(params));
}

/** Meta Pixel — only if pixel id exists AND analytics consent granted. */
export function trackMetaEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', event, params);
}

export type { FunnelLanguage, FunnelPlan, FunnelSignupLocation };
