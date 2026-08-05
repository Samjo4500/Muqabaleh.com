import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

export function pageMetadata(opts: {
  locale: string;
  path: string; // e.g. '/pricing' or ''
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  keywords?: string[];
}): Metadata {
  const isAr = opts.locale !== 'en';
  const path = opts.path === '/' ? '' : opts.path;
  const arUrl = `${SITE_URL}${path || '/'}`;
  const enUrl = `${SITE_URL}/en${path}`;
  const url = isAr ? (path ? `${SITE_URL}${path}` : SITE_URL) : enUrl;
  const title = isAr ? opts.titleAr : opts.titleEn;
  const description = isAr ? opts.descAr : opts.descEn;

  return {
    title: { absolute: title },
    description,
    keywords: opts.keywords,
    alternates: {
      canonical: url,
      languages: {
        'ar-SA': path ? `${SITE_URL}${path}` : SITE_URL,
        'en-US': enUrl,
        'x-default': path ? `${SITE_URL}${path}` : SITE_URL,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Muqabaleh' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
  };
}
