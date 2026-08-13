import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';
export const DEFAULT_OG_IMAGE = '/og-image.png';
export const DEFAULT_OG_IMAGE_ABS = `${SITE_URL}${DEFAULT_OG_IMAGE}`;

/** Soft-trim meta titles (~60) and descriptions (~155–160). */
export function clipMeta(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function absoluteImage(image?: string): string {
  if (!image) return DEFAULT_OG_IMAGE_ABS;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;
}

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
  ogType?: 'website' | 'article';
}): Metadata {
  const isAr = opts.locale !== 'en';
  const path = opts.path === '/' ? '' : opts.path;
  const arUrl = path ? `${SITE_URL}${path}` : SITE_URL;
  const enUrl = `${SITE_URL}/en${path}`;
  const url = isAr ? arUrl : enUrl;
  const title = clipMeta(isAr ? opts.titleAr : opts.titleEn, 60);
  const description = clipMeta(isAr ? opts.descAr : opts.descEn, 160);
  const image = absoluteImage(opts.ogImage);

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
        // Ticket + Google: ISO 639-1 codes + x-default → Arabic (default locale)
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
      siteName: 'Muqabaleh',
      locale: isAr ? 'ar_SA' : 'en_US',
      alternateLocale: isAr ? ['en_US'] : ['ar_SA'],
      type: opts.ogType || 'website',
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
