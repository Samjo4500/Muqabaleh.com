import {
  NURTURE_CITIES,
  NURTURE_EXPERIENCE,
  NURTURE_LANGUAGES,
  type NurtureCity,
  type NurtureExperience,
  type NurtureLanguage,
} from './constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value: unknown): string | null {
  const email = String(value || '')
    .trim()
    .toLowerCase();
  if (!email || email.length > 190 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function normalizeName(value: unknown): string | null {
  const name = String(value || '').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 120) return null;
  return name;
}

export function normalizeCity(value: unknown): NurtureCity | null {
  const city = String(value || '').trim();
  return (NURTURE_CITIES as readonly string[]).includes(city)
    ? (city as NurtureCity)
    : null;
}

export function normalizeExperience(value: unknown): NurtureExperience | null {
  const exp = String(value || '').trim();
  return (NURTURE_EXPERIENCE as readonly string[]).includes(exp)
    ? (exp as NurtureExperience)
    : null;
}

export function normalizeLanguage(value: unknown): NurtureLanguage | null {
  const lang = String(value || '').trim().toUpperCase();
  return (NURTURE_LANGUAGES as readonly string[]).includes(lang)
    ? (lang as NurtureLanguage)
    : null;
}

export function normalizeOptional(value: unknown, max = 160): string | null {
  const text = String(value || '').trim();
  if (!text) return null;
  return text.slice(0, max);
}

export function parseTags(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((t) => typeof t === 'string')
      : [];
  } catch {
    return [];
  }
}

export function parseStringList(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed)
      ? parsed.map((t) => String(t)).filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

export function parseCompetencies(
  raw: string | null | undefined,
): Record<string, number> {
  try {
    const parsed = JSON.parse(raw || '{}') as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed)) {
      const n = Number(v);
      if (Number.isFinite(n)) out[k] = n;
    }
    return out;
  } catch {
    return {};
  }
}
