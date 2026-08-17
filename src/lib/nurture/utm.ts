import { appBaseUrl, localePath } from '@/lib/brand/comms';

export type NurtureCampaign =
  | 'new_signup_sequence'
  | 'active_practicers'
  | 'job_seekers';

export function nurtureUtm(opts: {
  campaign: NurtureCampaign;
  emailNumber: number;
  extra?: Record<string, string>;
}): string {
  const params = new URLSearchParams({
    utm_source: 'nurture',
    utm_medium: 'email',
    utm_campaign: opts.campaign,
    utm_content: `email${opts.emailNumber}`,
    ...opts.extra,
  });
  return params.toString();
}

export function nurtureHref(opts: {
  path: string;
  locale: 'en' | 'ar';
  campaign: NurtureCampaign;
  emailNumber: number;
  extra?: Record<string, string>;
}): string {
  const base = localePath(opts.path, opts.locale);
  const utm = nurtureUtm({
    campaign: opts.campaign,
    emailNumber: opts.emailNumber,
    extra: opts.extra,
  });
  return base.includes('?') ? `${base}&${utm}` : `${base}?${utm}`;
}

export function prefsHref(token: string, locale: 'en' | 'ar'): string {
  return localePath(`/preferences?token=${encodeURIComponent(token)}`, locale);
}

export function unsubscribeHref(token: string, locale: 'en' | 'ar'): string {
  return localePath(`/unsubscribe?token=${encodeURIComponent(token)}`, locale);
}

export function openPixelHref(token: string, enrollmentId: string): string {
  return `${appBaseUrl()}/api/nurture/open?t=${encodeURIComponent(token)}&e=${encodeURIComponent(enrollmentId)}`;
}
