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
        logo: `${SITE_URL}/images/logos/v2-balanced-a-T.webp`,
        description:
          'AI-powered mock interview practice platform for Arabic and English speakers across MENA.',
        foundingLocation: {
          '@type': 'Place',
          name: 'Saudi Arabia',
        },
        areaServed: 'MENA',
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

export async function FaqJsonLd({ locale }: { locale: string }) {
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
            url: `${SITE_URL}/images/logos/v2-balanced-a-T.webp`,
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
