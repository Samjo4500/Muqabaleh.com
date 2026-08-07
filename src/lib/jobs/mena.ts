/**
 * MENA / GCC location helpers for legal ATS ingest + board UI.
 * Full country set for filters — inventory grows as verified boards are added.
 */

const MENA_RE =
  /\b(dubai|abu dhabi|sharjah|ajman|ras al khaimah|fujairah|uae|united arab emirates|riyadh|jeddah|dammam|khobar|neom|saudi|ksa|kingdom of saudi|qatar|doha|kuwait|bahrain|manama|oman|muscat|cairo|giza|alexandria|egypt|amman|jordan|beirut|lebanon|casablanca|rabat|marrakech|morocco|tunis|tunisia|algiers|algeria|baghdad|iraq|ramallah|palestine|gaza|west bank|tripoli|libya|sana'?a|yemen|khartoum|sudan|mena|middle east|gcc|gcc region)\b/i;

export function isMenaLocation(...parts: Array<string | null | undefined>): boolean {
  const hay = parts.filter(Boolean).join(' ');
  if (!hay.trim()) return false;
  return MENA_RE.test(hay);
}

export type MenaCountryKey =
  | 'uae'
  | 'ksa'
  | 'egypt'
  | 'qatar'
  | 'kuwait'
  | 'bahrain'
  | 'oman'
  | 'jordan'
  | 'lebanon'
  | 'morocco'
  | 'tunisia'
  | 'algeria'
  | 'iraq'
  | 'palestine'
  | 'libya'
  | 'sudan'
  | 'yemen'
  | 'other';

/** Always show these in the jobs filter bar (even at 0). */
export const MENA_COUNTRY_ORDER: MenaCountryKey[] = [
  'uae',
  'ksa',
  'egypt',
  'qatar',
  'kuwait',
  'bahrain',
  'oman',
  'jordan',
  'lebanon',
  'morocco',
  'tunisia',
  'algeria',
  'iraq',
  'palestine',
  'libya',
  'sudan',
  'yemen',
  'other',
];

export function classifyMenaCountry(
  location: string,
  country?: string | null,
  title?: string | null,
): MenaCountryKey {
  // Include title — Greenhouse often puts "Egypt" / "UAE & Oman" only in the title
  // when location is a vague "Hybrid" / "Remote".
  const hay = `${location} ${country || ''} ${title || ''}`.toLowerCase();
  if (/\b(dubai|abu dhabi|sharjah|ajman|uae|united arab)\b/.test(hay)) return 'uae';
  if (/\b(riyadh|jeddah|dammam|khobar|neom|saudi|ksa)\b/.test(hay)) return 'ksa';
  if (/\b(cairo|giza|alexandria|egypt)\b/.test(hay)) return 'egypt';
  if (/\b(doha|qatar)\b/.test(hay)) return 'qatar';
  if (/\b(kuwait)\b/.test(hay)) return 'kuwait';
  if (/\b(bahrain|manama)\b/.test(hay)) return 'bahrain';
  if (/\b(muscat|oman)\b/.test(hay)) return 'oman';
  if (/\b(amman|jordan)\b/.test(hay)) return 'jordan';
  if (/\b(beirut|lebanon)\b/.test(hay)) return 'lebanon';
  if (/\b(casablanca|rabat|marrakech|morocco)\b/.test(hay)) return 'morocco';
  if (/\b(tunis|tunisia)\b/.test(hay)) return 'tunisia';
  if (/\b(algiers|algeria)\b/.test(hay)) return 'algeria';
  if (/\b(baghdad|iraq)\b/.test(hay)) return 'iraq';
  if (/\b(ramallah|palestine|gaza|west bank)\b/.test(hay)) return 'palestine';
  if (/\b(tripoli|libya)\b/.test(hay)) return 'libya';
  if (/\b(khartoum|sudan)\b/.test(hay)) return 'sudan';
  if (/\b(sana'?a|yemen)\b/.test(hay)) return 'yemen';
  if (MENA_RE.test(hay)) return 'other';
  return 'other';
}

export const MENA_COUNTRY_LABELS: Record<MenaCountryKey, { en: string; ar: string }> = {
  uae: { en: 'UAE', ar: 'الإمارات' },
  ksa: { en: 'Saudi', ar: 'السعودية' },
  egypt: { en: 'Egypt', ar: 'مصر' },
  qatar: { en: 'Qatar', ar: 'قطر' },
  kuwait: { en: 'Kuwait', ar: 'الكويت' },
  bahrain: { en: 'Bahrain', ar: 'البحرين' },
  oman: { en: 'Oman', ar: 'عُمان' },
  jordan: { en: 'Jordan', ar: 'الأردن' },
  lebanon: { en: 'Lebanon', ar: 'لبنان' },
  morocco: { en: 'Morocco', ar: 'المغرب' },
  tunisia: { en: 'Tunisia', ar: 'تونس' },
  algeria: { en: 'Algeria', ar: 'الجزائر' },
  iraq: { en: 'Iraq', ar: 'العراق' },
  palestine: { en: 'Palestine', ar: 'فلسطين' },
  libya: { en: 'Libya', ar: 'ليبيا' },
  sudan: { en: 'Sudan', ar: 'السودان' },
  yemen: { en: 'Yemen', ar: 'اليمن' },
  other: { en: 'Wider MENA', ar: 'دول أخرى' },
};

/** Flag emoji for country filter tiles (a11y label still uses MENA_COUNTRY_LABELS). */
export const MENA_COUNTRY_FLAGS: Record<MenaCountryKey, string> = {
  uae: '🇦🇪',
  ksa: '🇸🇦',
  egypt: '🇪🇬',
  qatar: '🇶🇦',
  kuwait: '🇰🇼',
  bahrain: '🇧🇭',
  oman: '🇴🇲',
  jordan: '🇯🇴',
  lebanon: '🇱🇧',
  morocco: '🇲🇦',
  tunisia: '🇹🇳',
  algeria: '🇩🇿',
  iraq: '🇮🇶',
  palestine: '🇵🇸',
  libya: '🇱🇾',
  sudan: '🇸🇩',
  yemen: '🇾🇪',
  other: '🌍',
};

/** True for a concrete regional HQ (UAE, KSA…) — not Global→MENA or bare “MENA” tags. */
export function isRegionalMenaHq(country: string | null | undefined): boolean {
  if (!country) return false;
  if (/global/i.test(country)) return false;
  // Board region tags are not HQs — would otherwise keep Poland/Berlin remotes
  if (/^\s*mena\s*$/i.test(country)) return false;
  return isMenaLocation(country);
}

/** Keep vague Remote/Hybrid rows only when the employer is a concrete MENA HQ. */
export function isMenaListedRole(
  location: string | null | undefined,
  title?: string | null,
  companyCountry?: string | null,
): boolean {
  if (isMenaLocation(location, title)) return true;
  if (
    isRegionalMenaHq(companyCountry) &&
    /\b(remote|hybrid|anywhere)\b/i.test(`${location || ''} ${title || ''}`) &&
    // Still drop obvious non-MENA cities even for HQ remotes
    !/\b(poland|warsaw|berlin|germany|deutschland|bucharest|romania|london|paris|amsterdam|dublin)\b/i.test(
      `${location || ''} ${title || ''}`,
    )
  ) {
    return true;
  }
  return false;
}

/** @deprecated use classifyMenaCountry */
export type MenaCityKey = MenaCountryKey;
/** @deprecated use classifyMenaCountry */
export const classifyMenaCity = classifyMenaCountry;
/** @deprecated use MENA_COUNTRY_LABELS */
export const MENA_CITY_LABELS = MENA_COUNTRY_LABELS;
