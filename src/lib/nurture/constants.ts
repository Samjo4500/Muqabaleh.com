export const NURTURE_CITIES = [
  'Dubai',
  'Abu Dhabi',
  'Riyadh',
  'Jeddah',
  'Cairo',
  'Amman',
  'Other',
] as const;

export type NurtureCity = (typeof NURTURE_CITIES)[number];

export const NURTURE_EXPERIENCE = ['0-2', '3-5', '5+'] as const;
export type NurtureExperience = (typeof NURTURE_EXPERIENCE)[number];

export const NURTURE_LANGUAGES = ['EN', 'AR', 'BOTH'] as const;
export type NurtureLanguage = (typeof NURTURE_LANGUAGES)[number];

export const NURTURE_SEQUENCES = [
  'NEW_SIGNUP',
  'ACTIVE_PRACTICERS',
  'JOB_SEEKERS',
  'JOB_CLICK',
  'APPLY_FOLLOWUP',
] as const;
export type NurtureSequence = (typeof NURTURE_SEQUENCES)[number];

export const NURTURE_FREQUENCIES = [
  'NORMAL',
  'LESS_OFTEN',
  'MONTHLY_DIGEST',
  'PAUSED',
  'UNSUBSCRIBED',
] as const;
export type NurtureFrequency = (typeof NURTURE_FREQUENCIES)[number];

export const STORAGE_KEY = 'mq_nurture';

export const CITY_TIMEZONES: Record<string, string> = {
  Dubai: 'Asia/Dubai',
  'Abu Dhabi': 'Asia/Dubai',
  Riyadh: 'Asia/Riyadh',
  Jeddah: 'Asia/Riyadh',
  Cairo: 'Africa/Cairo',
  Amman: 'Asia/Amman',
  Other: 'Asia/Dubai',
};

export function timezoneForCity(city?: string | null): string {
  if (!city) return 'Asia/Dubai';
  return CITY_TIMEZONES[city] || 'Asia/Dubai';
}

export function localeFromPreferred(
  preferred?: string | null,
  fallback: 'en' | 'ar' = 'en',
): 'en' | 'ar' {
  const v = String(preferred || '').toUpperCase();
  if (v === 'AR') return 'ar';
  if (v === 'EN' || v === 'BOTH') return 'en';
  return fallback;
}
