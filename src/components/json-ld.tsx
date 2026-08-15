import { getTranslations } from 'next-intl/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'مقابلة | Muqabaleh',
        alternateName: 'Muqabaleh',
        url: SITE_URL,
        logo: `${SITE_URL}/images/logos/muqabaleh-wordmark.webp`,
        description:
          'AI-powered mock interview practice platform for Arabic and English speakers across MENA.',
        foundingLocation: {
          '@type': 'Place',
          name: 'Saudi Arabia',
        },
        areaServed: 'MENA',
        sameAs: [
          'https://www.instagram.com/muqabaleh2026',
          'https://www.tiktok.com/@muqabaleh2026',
          'https://linkedin.com/company/muqabaleh',
        ],
      }}
    />
  );
}

export function WebSiteJsonLd({ locale }: { locale: string }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'مقابلة | Muqabaleh',
        url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
        inLanguage: locale === 'en' ? 'en' : 'ar',
        publisher: {
          '@type': 'Organization',
          name: 'Muqabaleh',
          url: SITE_URL,
        },
      }}
    />
  );
}

/** Prefer landing copy FAQ so schema matches visible accordion. */
export function FaqJsonLd({
  locale,
  items,
}: {
  locale: string;
  items?: ReadonlyArray<{
    q: { readonly en: string; readonly ar: string };
    a: { readonly en: string; readonly ar: string };
  }>;
}) {
  const isAr = locale === 'ar';
  const source = items;
  if (!source?.length) return null;

  const faqs = source.map((item) => ({
    '@type': 'Question',
    name: isAr ? item.q.ar : item.q.en,
    acceptedAnswer: {
      '@type': 'Answer',
      text: isAr ? item.a.ar : item.a.en,
    },
  }));

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs,
      }}
    />
  );
}

/** @deprecated legacy message-namespace FAQ — kept for callers that still use getTranslations */
export async function FaqJsonLdFromMessages({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'landing' });
  const faqs = [1, 2, 3, 4, 5, 6].map((n) => ({
    '@type': 'Question',
    name: t(`faqQ${n}`),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(`faqA${n}`),
    },
  }));

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs,
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  locale,
}: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  locale: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image: image.startsWith('http') ? image : `${SITE_URL}${image}`,
        datePublished,
        dateModified: dateModified || datePublished,
        inLanguage: locale === 'en' ? 'en' : 'ar',
        author: {
          '@type': 'Organization',
          name: 'Muqabaleh',
          url: SITE_URL,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Muqabaleh',
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/images/logos/muqabaleh-wordmark.webp`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': url,
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  );
}

const SCHEMA_EMPLOYMENT_TYPES = new Set([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACTOR',
  'TEMPORARY',
  'INTERN',
  'VOLUNTEER',
  'OTHER',
]);

/** ISO 3166-1 alpha-2 from MENA country key. `other` → null (skip schema). */
const MENA_KEY_TO_ISO: Record<string, string | null> = {
  uae: 'AE',
  ksa: 'SA',
  egypt: 'EG',
  qatar: 'QA',
  kuwait: 'KW',
  bahrain: 'BH',
  oman: 'OM',
  jordan: 'JO',
  lebanon: 'LB',
  syria: 'SY',
  morocco: 'MA',
  tunisia: 'TN',
  algeria: 'DZ',
  iraq: 'IQ',
  palestine: 'PS',
  libya: 'LY',
  sudan: 'SD',
  yemen: 'YE',
  other: null,
};

const COUNTRY_NAME_TO_ISO: Array<{ re: RegExp; iso: string }> = [
  { re: /\b(united arab emirates|u\.?a\.?e\.?|emirates)\b/i, iso: 'AE' },
  { re: /\b(saudi arabia|kingdom of saudi|k\.?s\.?a\.?)\b/i, iso: 'SA' },
  { re: /\b(egypt|egypte)\b/i, iso: 'EG' },
  { re: /\b(qatar)\b/i, iso: 'QA' },
  { re: /\b(kuwait)\b/i, iso: 'KW' },
  { re: /\b(bahrain)\b/i, iso: 'BH' },
  { re: /\b((?<![a-z])oman(?![a-z])|sultanate of oman)\b/i, iso: 'OM' },
  { re: /\b(jordan)\b/i, iso: 'JO' },
  { re: /\b(lebanon)\b/i, iso: 'LB' },
  { re: /\b(syria|syrian)\b/i, iso: 'SY' },
  { re: /\b(morocco)\b/i, iso: 'MA' },
  { re: /\b(tunisia)\b/i, iso: 'TN' },
  { re: /\b(algeria)\b/i, iso: 'DZ' },
  { re: /\b(iraq)\b/i, iso: 'IQ' },
  { re: /\b(palestine|west bank|gaza)\b/i, iso: 'PS' },
  { re: /\b(libya)\b/i, iso: 'LY' },
  { re: /\b(sudan)\b/i, iso: 'SD' },
  { re: /\b(yemen)\b/i, iso: 'YE' },
];

function nonEmpty(value: string | null | undefined): string | undefined {
  const v = String(value ?? '').trim();
  return v ? v : undefined;
}

function toIsoDate(value: string | Date): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
  return d.toISOString().slice(0, 10);
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    const fallback = new Date();
    fallback.setUTCDate(fallback.getUTCDate() + days);
    return fallback.toISOString();
  }
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/** Map free-text / ATS employment labels → schema.org JobPosting.employmentType. */
export function normalizeEmploymentType(raw?: string | null): string {
  const v = String(raw ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  if (!v) return 'FULL_TIME';
  if (SCHEMA_EMPLOYMENT_TYPES.has(v)) return v;
  if (/FULL.?TIME|PERMANENT|FT\b/.test(v)) return 'FULL_TIME';
  if (/PART.?TIME|PT\b/.test(v)) return 'PART_TIME';
  if (/CONTRACT|FREELANCE|CONSULTANT/.test(v)) return 'CONTRACTOR';
  if (/TEMP|FIXED.?TERM|SEASONAL/.test(v)) return 'TEMPORARY';
  if (/INTERN|TRAINEE|TAMHEER|GRADUATE/.test(v)) return 'INTERN';
  if (/VOLUNTEER/.test(v)) return 'VOLUNTEER';
  return 'FULL_TIME';
}

/**
 * Resolve ISO country for JobPosting.addressCountry.
 * Prefer explicit ISO / country key, then parse location + company HQ text.
 */
export function resolveJobAddressCountry(opts: {
  addressCountry?: string | null;
  location?: string | null;
  companyCountry?: string | null;
  countryKey?: string | null;
}): string | null {
  const explicit = nonEmpty(opts.addressCountry)?.toUpperCase();
  if (explicit && /^[A-Z]{2}$/.test(explicit)) return explicit;

  const key = nonEmpty(opts.countryKey)?.toLowerCase();
  if (key && key in MENA_KEY_TO_ISO) {
    const iso = MENA_KEY_TO_ISO[key];
    if (iso) return iso;
  }

  const hay = [opts.location, opts.companyCountry].filter(Boolean).join(' ');
  for (const { re, iso } of COUNTRY_NAME_TO_ISO) {
    if (re.test(hay)) return iso;
  }

  // City-only signals common on ATS boards
  if (/\b(dubai|abu dhabi|sharjah|ajman|al ain)\b/i.test(hay)) return 'AE';
  if (/\b(riyadh|jeddah|dammam|khobar|neom|madinah|makkah|mecca)\b/i.test(hay)) return 'SA';
  if (/\b(cairo|giza|alexandria|new cairo)\b/i.test(hay)) return 'EG';
  if (/\b(doha|lusail)\b/i.test(hay)) return 'QA';
  if (/\b(amman|irbid|aqaba)\b/i.test(hay)) return 'JO';
  if (/\b(kuwait city)\b/i.test(hay)) return 'KW';
  if (/\b(manama)\b/i.test(hay)) return 'BH';
  if (/\b(muscat|salalah)\b/i.test(hay)) return 'OM';
  if (/\b(beirut)\b/i.test(hay)) return 'LB';

  return null;
}

/** City / region labels from free-text location; omit when remote/vague. */
export function parseJobAddressParts(location?: string | null): {
  locality?: string;
  region?: string;
} {
  const loc = nonEmpty(location);
  if (!loc) return {};
  if (
    /^(remote|hybrid|anywhere|emea|global|worldwide|multiple locations?|various|n\/?a|mena|gcc)\b/i.test(
      loc,
    )
  ) {
    return {};
  }
  const parts = loc
    .split(/[,·|]/)
    .map((p) => p.trim().replace(/\.+$/, ''))
    .filter(Boolean);
  if (!parts.length) return {};

  const isCountry = (p: string) =>
    COUNTRY_NAME_TO_ISO.some(({ re }) => re.test(p)) ||
    /^(remote|hybrid|anywhere|emea|global|worldwide|mena|gcc)$/i.test(p);

  const nonCountry = parts.filter((p) => !isCountry(p));
  if (!nonCountry.length) return {};

  // Google: addressLocality = city; addressRegion = state/province when present.
  const locality = nonCountry[0];
  const region =
    nonCountry.length > 1 && /province|state|governorate|emirate|region/i.test(nonCountry[1])
      ? nonCountry[1]
      : nonCountry.length > 1 && nonCountry[1] !== locality
        ? nonCountry[1]
        : undefined;

  return { locality, region };
}

/** @deprecated use parseJobAddressParts — kept for callers expecting city-as-region. */
export function parseAddressRegion(location?: string | null): string | undefined {
  return parseJobAddressParts(location).locality;
}

export type JobPostingLdInput = {
  title: string;
  description: string;
  datePosted?: string | null;
  validThrough?: string | null;
  hiringOrganization: string;
  /** Free-text job location (e.g. "Dubai, UAE") */
  jobLocation: string;
  employmentType?: string | null;
  applyUrl: string;
  salaryLabel?: string | null;
  locale: string;
  /** ListedCompany.slug — builds hiringOrganization.sameAs */
  companySlug?: string | null;
  companyCountry?: string | null;
  /** Precomputed MENA key from classifyMenaCountry */
  countryKey?: string | null;
  addressCountry?: string | null;
  addressRegion?: string | null;
  addressLocality?: string | null;
  streetAddress?: string | null;
  postalCode?: string | null;
};

/**
 * Build JobPosting JSON-LD for Google Jobs.
 * Returns null when addressCountry cannot be resolved (do not emit broken schema).
 * Omits null/empty optional fields entirely.
 */
export function buildJobPostingLd(
  input: JobPostingLdInput,
): Record<string, unknown> | null {
  const addressCountry = resolveJobAddressCountry({
    addressCountry: input.addressCountry,
    location: input.jobLocation,
    companyCountry: input.companyCountry,
    countryKey: input.countryKey,
  });
  if (!addressCountry) return null;

  const posted = toIsoDate(input.datePosted || new Date().toISOString());
  const validThrough = nonEmpty(input.validThrough)
    ? new Date(input.validThrough as string).toISOString()
    : addDaysIso(posted, 30);

  const address: Record<string, string> = {
    '@type': 'PostalAddress',
    addressCountry,
    postalCode: nonEmpty(input.postalCode) || '00000',
  };
  const parsed = parseJobAddressParts(input.jobLocation);
  const locality = nonEmpty(input.addressLocality) || parsed.locality;
  if (locality) address.addressLocality = locality;
  const region = nonEmpty(input.addressRegion) || parsed.region;
  if (region) address.addressRegion = region;
  const street = nonEmpty(input.streetAddress);
  if (street) address.streetAddress = street;

  const org: Record<string, string> = {
    '@type': 'Organization',
    name: input.hiringOrganization,
  };
  const slug = nonEmpty(input.companySlug);
  if (slug) {
    // Canonical company page on Muqabaleh.
    org.sameAs = `${SITE_URL}/companies/${slug}`;
  }

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: input.title,
    description: input.description.slice(0, 300),
    datePosted: posted,
    validThrough,
    employmentType: normalizeEmploymentType(input.employmentType),
    hiringOrganization: org,
    jobLocation: {
      '@type': 'Place',
      address,
    },
    url: input.applyUrl,
    directApply: false,
    inLanguage: input.locale === 'en' ? 'en' : 'ar',
  };

  // Only hint at pay when we have a published label — never invent currency/amount
  const salary = nonEmpty(input.salaryLabel);
  if (salary) data.incentiveCompensation = salary;

  return data;
}

/** JobPosting for listed board roles — employer apply URL, short summary only. */
export function JobPostingJsonLd(props: JobPostingLdInput) {
  const data = buildJobPostingLd(props);
  if (!data) return null;
  return <JsonLd data={data} />;
}
