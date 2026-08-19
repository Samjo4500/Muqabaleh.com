import { MENA_COUNTRIES } from '@/lib/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONSUMER_HOSTS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
]);

export type Eligibility = 'CURRENT_STUDENT' | 'GRADUATED_12M';

export function normalizeEmail(value: unknown): string | null {
  const email = String(value || '')
    .trim()
    .toLowerCase();
  if (!email || email.length > 190 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function emailHost(email: string): string {
  return email.split('@')[1] || '';
}

/** University / .edu / .ac. addresses — enough to auto-activate. */
export function isAcademicEmail(email: string): boolean {
  const host = emailHost(email);
  if (!host || CONSUMER_HOSTS.has(host)) return false;
  if (host.endsWith('.edu')) return true;
  if (host.includes('.edu.')) return true;
  if (host.includes('.ac.')) return true;
  return false;
}

export function normalizeText(value: unknown, min: number, max: number): string | null {
  const text = String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
  if (text.length < min || text.length > max) return null;
  return text;
}

export function normalizeCountry(value: unknown): string | null {
  const code = String(value || '')
    .trim()
    .toUpperCase();
  return MENA_COUNTRIES.some((c) => c.code === code) ? code : null;
}

export function normalizeEligibility(value: unknown): Eligibility | null {
  const raw = String(value || '').trim();
  if (raw === 'CURRENT_STUDENT' || raw === 'GRADUATED_12M') return raw;
  return null;
}

export function isMissingRelationError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string; message?: string };
  if (e.code === 'P2021' || e.code === 'P2010') return true;
  return /does not exist|relation .* does not exist/i.test(String(e.message ?? ''));
}
