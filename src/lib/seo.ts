import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

export function pageMetadata(opts: {
  locale: string;
  path: string; // e.g. '/pricing' or '' or '/jobs'
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
}): Metadata {
  const isAr = opts.locale !== 'en';
  const path = opts.path === '/' ? '' : opts.path;
  const arUrl = path ? `${SITE_URL}${path}` : SITE_URL;
  const enUrl = `${SITE_URL}/en${path}`;
  const url = isAr ? arUrl : enUrl;
  const title = isAr ? opts.titleAr : opts.titleEn;
  const description = isAr ? opts.descAr : opts.descEn;
  const image = opts.ogImage || '/og-passport.jpg';

  return {
    title: { absolute: title },
    description,
    keywords: opts.keywords,
    robots: opts.noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    alternates: {
      canonical: url,
      languages: {
        ar: arUrl,
        en: enUrl,
        'ar-SA': arUrl,
        'en-US': enUrl,
        'x-default': arUrl,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'مقابلة | Muqabaleh',
      locale: isAr ? 'ar_SA' : 'en_US',
      alternateLocale: isAr ? ['en_US'] : ['ar_SA'],
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@muqabaleh',
    },
    category: 'career',
  };
}
