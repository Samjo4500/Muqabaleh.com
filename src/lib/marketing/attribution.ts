/** Client-side UTM / acquisition capture (localStorage). */

const STORAGE_KEY = 'mq_attribution_v1';

export type Attribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  landingPath?: string;
  referrer?: string;
  capturedAt?: string;
};

function pick(params: URLSearchParams, key: string): string | undefined {
  const v = params.get(key)?.trim();
  return v || undefined;
}

export function captureAttributionFromLocation(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const next: Attribution = {
      utmSource: pick(params, 'utm_source'),
      utmMedium: pick(params, 'utm_medium'),
      utmCampaign: pick(params, 'utm_campaign'),
      utmContent: pick(params, 'utm_content'),
      utmTerm: pick(params, 'utm_term'),
      landingPath: window.location.pathname + window.location.search,
      referrer: document.referrer || undefined,
      capturedAt: new Date().toISOString(),
    };
    const hasUtm = Boolean(
      next.utmSource || next.utmMedium || next.utmCampaign || next.utmContent || next.utmTerm,
    );
    const existing = readAttribution();
    // First-touch: keep original UTMs; refresh landing/referrer only if empty.
    const merged: Attribution = {
      utmSource: existing?.utmSource || next.utmSource,
      utmMedium: existing?.utmMedium || next.utmMedium,
      utmCampaign: existing?.utmCampaign || next.utmCampaign,
      utmContent: existing?.utmContent || next.utmContent,
      utmTerm: existing?.utmTerm || next.utmTerm,
      landingPath: existing?.landingPath || next.landingPath,
      referrer: existing?.referrer || next.referrer,
      capturedAt: existing?.capturedAt || next.capturedAt,
    };
    if (hasUtm || !existing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return null;
  }
}

export function readAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Attribution;
  } catch {
    return null;
  }
}

/** Spread into JSON bodies for register / newsletter / talent. */
export function attributionPayload(): Record<string, string> {
  const a = readAttribution() || captureAttributionFromLocation();
  if (!a) return {};
  const out: Record<string, string> = {};
  if (a.utmSource) out.utmSource = a.utmSource;
  if (a.utmMedium) out.utmMedium = a.utmMedium;
  if (a.utmCampaign) out.utmCampaign = a.utmCampaign;
  if (a.utmContent) out.utmContent = a.utmContent;
  if (a.utmTerm) out.utmTerm = a.utmTerm;
  if (a.landingPath) out.landingPath = a.landingPath;
  if (a.referrer) out.referrer = a.referrer;
  return out;
}
