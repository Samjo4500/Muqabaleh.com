import type { MetadataRoute } from 'next';
import { getAllSlugs } from '@/content/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh-com.vercel.app';

const PUBLIC_ROUTES = [
  '',
  '/pricing',
  '/business',
  '/jobs',
  '/demo',
  '/about',
  '/support',
  '/privacy',
  '/terms',
  '/refund',
  '/join-as-interviewer',
  '/interviewers',
  '/blog',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();

  // Static pages
  for (const route of PUBLIC_ROUTES) {
    // Arabic (default)
    entries.push({
      url: `${SITE_URL}${route || '/'}`,
      lastModified: now,
      changeFrequency: route === '' ? 'weekly' : route === '/blog' ? 'weekly' : 'monthly',
      priority: route === '' ? 1 : route === '/blog' ? 0.9 : 0.8,
    });
    // English
    entries.push({
      url: `${SITE_URL}/en${route}`,
      lastModified: now,
      changeFrequency: route === '' ? 'weekly' : route === '/blog' ? 'weekly' : 'monthly',
      priority: route === '' ? 0.9 : 0.7,
    });
  }

  // Blog articles
  for (const { locale, slug } of getAllSlugs()) {
    const prefix = locale === 'en' ? '/en' : '';
    entries.push({
      url: `${SITE_URL}${prefix}/blog/${slug}`,
      lastModified: '2026-08-03',
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
