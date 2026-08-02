'use client';

import { useTranslations, useLocale } from 'next-intl';

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = 'https://muqabaleh-com.vercel.app';

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'مقابلة | Muqabaleh',
        url: SITE_URL,
        logo: `${SITE_URL}/images/logos/v2-balanced-a-T.webp`,
        description:
          'المنصة العربية الأولى للتدرّب على المقابلات الوظيفية بالذكاء الاصطناعي',
        foundingLocation: {
          '@type': 'Place',
          name: 'Saudi Arabia',
        },
        sameAs: [
          'https://x.com/muqabaleh',
          'https://linkedin.com/company/muqabaleh',
          'https://instagram.com/muqabaleh',
          'https://facebook.com/muqabaleh',
        ],
      }}
    />
  );
}

export function FaqJsonLd() {
  const t = useTranslations('landing');
  const locale = useLocale();

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

export function WebSiteJsonLd() {
  const locale = useLocale();

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'مقابلة | Muqabaleh',
        url: SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/${locale === 'ar' ? '' : 'en'}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function ProductJsonLd() {
  const t = useTranslations('landing');

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'مقابلة | Muqabaleh — AI Interview Practice',
        description: t('heroSub'),
        image: `${SITE_URL}/og-image.png`,
        brand: {
          '@type': 'Brand',
          name: 'Muqabaleh',
        },
        offers: {
          '@type': 'AggregateOffer',
          lowPrice: '19',
          highPrice: '69',
          priceCurrency: 'USD',
          offerCount: 3,
        },
      }}
    />
  );
}
