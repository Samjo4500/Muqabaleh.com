/**
 * MENA / GCC location helpers for legal ATS ingest + board UI.
 */

const MENA_RE =
  /\b(dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|uae|united arab emirates|riyadh|jeddah|dammam|khobar|neom|saudi|ksa|kingdom of saudi|qatar|doha|kuwait|bahrain|manama|oman|muscat|cairo|giza|alexandria|egypt|amman|jordan|beirut|lebanon|casablanca|rabat|morocco|tunis|tunisia|baghdad|iraq|mena|middle east|gcc|gcc region)\b/i;

/**
 * Boards that hire beyond MENA — only keep MENA/GCC-located postings.
 * Pure-MENA boards (Careem, Tamara, Aldar, Foodics, Jumia) keep all roles.
 */
export const MENA_FILTER_SLUGS = new Set([
  'stripe',
  'spotify',
  'fresha',
  'remotecom',
  'remote',
]);

export function isMenaLocation(...parts: Array<string | null | undefined>): boolean {
  const hay = parts.filter(Boolean).join(' ');
  if (!hay.trim()) return false;
  return MENA_RE.test(hay);
}

export type MenaCityKey =
  | 'uae'
  | 'ksa'
  | 'egypt'
  | 'qatar'
  | 'kuwait'
  | 'bahrain'
  | 'oman'
  | 'jordan'
  | 'remote'
  | 'other';

export function classifyMenaCity(location: string, country?: string | null): MenaCityKey {
  const hay = `${location} ${country || ''}`.toLowerCase();
  if (/\b(remote|anywhere|worldwide)\b/.test(hay) && !MENA_RE.test(hay)) return 'remote';
  if (/\b(dubai|abu dhabi|sharjah|uae|united arab)\b/.test(hay)) return 'uae';
  if (/\b(riyadh|jeddah|dammam|khobar|neom|saudi|ksa)\b/.test(hay)) return 'ksa';
  if (/\b(cairo|giza|alexandria|egypt)\b/.test(hay)) return 'egypt';
  if (/\b(doha|qatar)\b/.test(hay)) return 'qatar';
  if (/\b(kuwait)\b/.test(hay)) return 'kuwait';
  if (/\b(bahrain|manama)\b/.test(hay)) return 'bahrain';
  if (/\b(muscat|oman)\b/.test(hay)) return 'oman';
  if (/\b(amman|jordan)\b/.test(hay)) return 'jordan';
  if (MENA_RE.test(hay)) return 'other';
  return 'other';
}

export const MENA_CITY_LABELS: Record<MenaCityKey, { en: string; ar: string }> = {
  uae: { en: 'UAE', ar: 'الإمارات' },
  ksa: { en: 'Saudi', ar: 'السعودية' },
  egypt: { en: 'Egypt', ar: 'مصر' },
  qatar: { en: 'Qatar', ar: 'قطر' },
  kuwait: { en: 'Kuwait', ar: 'الكويت' },
  bahrain: { en: 'Bahrain', ar: 'البحرين' },
  oman: { en: 'Oman', ar: 'عُمان' },
  jordan: { en: 'Jordan', ar: 'الأردن' },
  remote: { en: 'Remote', ar: 'عن بُعد' },
  other: { en: 'MENA', ar: 'المنطقة' },
};
