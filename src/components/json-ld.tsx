import { getTranslations } from 'next-intl/server';
import { SITE_URL } from '@/lib/seo';

const LOGO_URL = `${SITE_URL}/images/logos/muqabaleh-wordmark.webp`;

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
        name: 'Muqabaleh',
        alternateName: 'مقابلة',
        url: SITE_URL,
        logo: LOGO_URL,
        description:
          'AI-powered mock interview practice for MENA job seekers',
        foundingLocation: {
          '@type': 'Place',
          name: 'Saudi Arabia',
        },
        areaServed: 'MENA',
        sameAs: [
          'https://www.linkedin.com/company/muqabaleh',
          'https://twitter.com/muqabaleh',
          'https://www.instagram.com/muqabaleh2026',
          'https://www.tiktok.com/@muqabaleh2026',
        ],
      }}
    />
  );
}

export function WebSiteJsonLd({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Muqabaleh',
        url: isEn ? `${SITE_URL}/en` : SITE_URL,
        inLanguage: isEn ? 'en' : 'ar',
        publisher: {
          '@type': 'Organization',
          name: 'Muqabaleh',
          url: SITE_URL,
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}${isEn ? '/en' : ''}/jobs?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function SoftwareApplicationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Muqabaleh AI Interviews',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      }}
    />
  );
}

/** Homepage @graph: Organization + WebSite + SoftwareApplication */
export function HomeGraphJsonLd({ locale }: { locale: string }) {
  const isEn = locale === 'en';
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            name: 'Muqabaleh',
            url: SITE_URL,
            logo: LOGO_URL,
            sameAs: [
              'https://www.linkedin.com/company/muqabaleh',
              'https://twitter.com/muqabaleh',
              'https://www.instagram.com/muqabaleh2026',
              'https://www.tiktok.com/@muqabaleh2026',
            ],
            description:
              'AI-powered mock interview practice for MENA job seekers',
          },
          {
            '@type': 'WebSite',
            name: 'Muqabaleh',
            url: isEn ? `${SITE_URL}/en` : SITE_URL,
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}${isEn ? '/en' : ''}/jobs?q={search_term_string}`,
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'SoftwareApplication',
            name: 'Muqabaleh AI Interviews',
            applicationCategory: 'BusinessApplication',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
        ],
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
        },
        publisher: {
          '@type': 'Organization',
          name: 'Muqabaleh',
          logo: {
            '@type': 'ImageObject',
            url: LOGO_URL,
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

export function CompanyOrganizationJsonLd({
  name,
  slug,
  description,
  logoUrl,
  website,
  locale,
}: {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  website?: string | null;
  locale: string;
}) {
  const prefix = locale === 'en' ? '/en' : '';
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: `${SITE_URL}${prefix}/companies/${slug}`,
    description:
      description ||
      (locale === 'en'
        ? `${name} jobs and interview practice on Muqabaleh`
        : `وظائف ${name} وتدريب مقابلات على مقابلة`),
  };
  if (logoUrl) data.logo = logoUrl;
  if (website) data.sameAs = [website];
  return <JsonLd data={data} />;
}

export function ProductOffersJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Muqabaleh AI Interview Practice',
        description: 'AI-powered mock interviews for MENA job seekers',
        brand: {
          '@type': 'Brand',
          name: 'Muqabaleh',
        },
        offers: [
          {
            '@type': 'Offer',
            name: 'Free',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Jeannie',
            price: '14.99',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
          {
            '@type': 'Offer',
            name: 'Jeannie Pro',
            price: '29.99',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        ],
      }}
    />
  );
}

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'full time': 'FULL_TIME',
  fulltime: 'FULL_TIME',
  'دوام كامل': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'part time': 'PART_TIME',
  parttime: 'PART_TIME',
  'دوام جزئي': 'PART_TIME',
  contract: 'CONTRACTOR',
  contractor: 'CONTRACTOR',
  temporary: 'TEMPORARY',
  intern: 'INTERN',
  internship: 'INTERN',
  freelance: 'CONTRACTOR',
};

export function mapEmploymentType(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const key = raw.trim().toLowerCase();
  if (EMPLOYMENT_TYPE_MAP[key]) return EMPLOYMENT_TYPE_MAP[key];
  const upper = raw.trim().toUpperCase().replace(/\s+/g, '_');
  if (
    ['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'TEMPORARY', 'INTERN', 'VOLUNTEER', 'OTHER'].includes(
      upper,
    )
  ) {
    return upper;
  }
  return undefined;
}

const COUNTRY_ISO: Record<string, string> = {
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
};

/** JobPosting for listed board roles — Muqabaleh page URL + short summary only. */
export function JobPostingJsonLd({
  title,
  description,
  datePosted,
  validThrough,
  hiringOrganization,
  hiringOrganizationUrl,
  jobLocation,
  addressCountry,
  employmentType,
  pageUrl,
  applyUrl,
  salaryLabel,
  locale,
}: {
  title: string;
  description: string;
  datePosted?: string | null;
  validThrough?: string | null;
  hiringOrganization: string;
  hiringOrganizationUrl?: string;
  jobLocation: string;
  addressCountry?: string | null;
  employmentType?: string | null;
  pageUrl: string;
  applyUrl: string;
  salaryLabel?: string | null;
  locale: string;
}) {
  const posted =
    datePosted || new Date().toISOString().slice(0, 10);
  const through =
    validThrough ||
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const isoCountry =
    addressCountry && COUNTRY_ISO[addressCountry]
      ? COUNTRY_ISO[addressCountry]
      : undefined;
  const mappedType = mapEmploymentType(employmentType);

  const org: Record<string, unknown> = {
    '@type': 'Organization',
    name: hiringOrganization,
  };
  if (hiringOrganizationUrl) org.sameAs = hiringOrganizationUrl;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description: description.slice(0, 5000),
    datePosted: posted.slice(0, 10),
    validThrough: through.slice(0, 10),
    hiringOrganization: org,
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: jobLocation,
        ...(isoCountry ? { addressCountry: isoCountry } : {}),
      },
    },
    url: pageUrl,
    directApply: false,
    applicationContact: {
      '@type': 'ContactPoint',
      url: applyUrl,
    },
    inLanguage: locale === 'en' ? 'en' : 'ar',
  };
  if (mappedType) data.employmentType = mappedType;
  if (salaryLabel) data.incentiveCompensation = salaryLabel;
  return <JsonLd data={data} />;
}
