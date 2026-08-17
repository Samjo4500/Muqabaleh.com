/**
 * GA4 helpers — only fire when analytics cookie consent is granted.
 */

import { hasAnalyticsConsent } from '@/lib/cookie-consent';

export type GaEventName =
  | 'interview_started'
  | 'interview_completed'
  | 'passport_downloaded'
  | 'upgrade_clicked'
  | 'payment_completed'
  | 'signup_completed'
  | 'nurture_gate1_unlocked'
  | 'nurture_gate2_start';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export function getGaId(): string | null {
  const id = process.env.NEXT_PUBLIC_GA_ID?.trim();
  return id || null;
}

export function trackGaEvent(
  name: GaEventName,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (!getGaId()) return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, params || {});
}

/** Meta Pixel — only if pixel id exists AND analytics consent granted. */
export function trackMetaEvent(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (typeof window.fbq !== 'function') return;
  window.fbq('track', event, params);
}
