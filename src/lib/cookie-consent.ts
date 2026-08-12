export type CookieConsent = {
  essential: true;
  analytics: boolean;
  updatedAt: string;
};

export const COOKIE_CONSENT_KEY = 'mq_cookie_consent_v1';

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieConsent>;
    if (typeof parsed.analytics !== 'boolean') return null;
    return {
      essential: true,
      analytics: parsed.analytics,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsent {
  const value: CookieConsent = {
    essential: true,
    analytics,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('mq-cookie-consent', { detail: value }));
  }
  return value;
}

export function hasAnalyticsConsent(): boolean {
  return readCookieConsent()?.analytics === true;
}
