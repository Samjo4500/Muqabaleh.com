/**
 * MENA / GCC location helpers for legal ATS ingest + board UI.
 * Full country set for filters — inventory grows as verified boards are added.
 */

const MENA_RE =
  /\b(dubai|abu dhabi|abu-dhabi|sharjah|ajman|ras al khaimah|ras alkhaimah|fujairah|umm al quwain|al ain|al-ain|uae|u\.a\.e\.|united arab emirates|emirates|riyadh|jeddah|dammam|khobar|dhahran|jubail|yanbu|madinah|medina|makkah|mecca|taif|abha|tabuk|hail|neom|qiddiya|diriyah|red sea|saudi|ksa|kingdom of saudi|qatar|doha|lusail|kuwait|kuwait city|bahrain|manama|oman|muscat|salalah|sohar|cairo|giza|alexandria|new cairo|6th of october|nasr city|heliopolis|maadi|mansoura|tanta|assiut|ismailia|port said|suez|hurghada|sharm|egypt|amman|irbid|zarqa|aqaba|jordan|beirut|lebanon|casablanca|rabat|marrakech|marrakesh|tangier|fez|fes|agadir|morocco|tunis|sfax|sousse|tunisia|algiers|oran|constantine|algeria|baghdad|basra|erbil|mosul|najaf|sulaymaniyah|iraq|ramallah|palestine|gaza|west bank|tripoli|libya|sana'?a|yemen|khartoum|sudan|mena|middle east|gcc|gcc region|levant|maghreb)\b/i;

/** Extra signals often present in titles/descriptions for MENA-facing roles. */
const MENA_ROLE_RE =
  /\b(mena|middle east|gcc|gulf|arabic[- ]speaking|arabic speaker|based in (the )?uae|based in (saudi|ksa|egypt|qatar|dubai|riyadh|cairo|doha)|uae & oman|ksa & uae|egypt & gulf)\b/i;

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
  if (/\b(dubai|abu dhabi|sharjah|ajman|uae|united arab|emirates|al ain)\b/.test(hay)) return 'uae';
  if (/\b(riyadh|jeddah|dammam|khobar|dhahran|neom|qiddiya|saudi|ksa|madinah|makkah)\b/.test(hay))
    return 'ksa';
  if (/\b(cairo|giza|alexandria|egypt|new cairo|mansoura)\b/.test(hay)) return 'egypt';
  if (/\b(doha|qatar|lusail)\b/.test(hay)) return 'qatar';
  if (/\b(kuwait)\b/.test(hay)) return 'kuwait';
  if (/\b(bahrain|manama)\b/.test(hay)) return 'bahrain';
  if (/\b(muscat|oman|salalah|sohar)\b/.test(hay)) return 'oman';
  if (/\b(amman|jordan|irbid|aqaba)\b/.test(hay)) return 'jordan';
  if (/\b(beirut|lebanon)\b/.test(hay)) return 'lebanon';
  if (/\b(casablanca|rabat|marrakech|marrakesh|tangier|morocco)\b/.test(hay)) return 'morocco';
  if (/\b(tunis|tunisia|sfax|sousse)\b/.test(hay)) return 'tunisia';
  if (/\b(algiers|oran|algeria)\b/.test(hay)) return 'algeria';
  if (/\b(baghdad|basra|erbil|iraq)\b/.test(hay)) return 'iraq';
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

const NON_MENA_CITY_RE =
  /\b(poland|warsaw|berlin|germany|deutschland|bucharest|romania|london|paris|amsterdam|dublin|toronto|vancouver|sydney|melbourne|singapore|tokyo|seoul|bangalore|bengaluru|hyderabad|mumbai|delhi|nairobi|lagos|accra|cape town|johannesburg|sao paulo|mexico city|stockholm|oslo|helsinki|copenhagen|vienna|prague|budapest|lisbon|madrid|barcelona|milan|rome|athens)\b/i;

/**
 * Keep a listed role if it is clearly MENA-facing.
 * Optional description helps catch "Remote — MENA" / "Arabic-speaking" postings.
 */
export function isMenaListedRole(
  location: string | null | undefined,
  title?: string | null,
  companyCountry?: string | null,
  extras?: { department?: string | null; description?: string | null },
): boolean {
  const haystack = [location, title, extras?.department, extras?.description]
    .filter(Boolean)
    .join(' ');

  if (isMenaLocation(location, title, extras?.department)) return true;
  if (MENA_ROLE_RE.test(haystack) && !NON_MENA_CITY_RE.test(haystack)) return true;

  if (
    isRegionalMenaHq(companyCountry) &&
    /\b(remote|hybrid|anywhere|emea)\b/i.test(`${location || ''} ${title || ''}`) &&
    !NON_MENA_CITY_RE.test(`${location || ''} ${title || ''}`)
  ) {
    return true;
  }

  // Global boards: keep remote rows only when MENA is explicit in title/description
  if (
    companyCountry &&
    /global/i.test(companyCountry) &&
    /\b(remote|hybrid|anywhere|emea)\b/i.test(`${location || ''} ${title || ''}`) &&
    MENA_ROLE_RE.test(haystack) &&
    !NON_MENA_CITY_RE.test(haystack)
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
