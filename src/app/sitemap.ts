import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh-com.vercel.app';

const PUBLIC_ROUTES = [
  '',
  '/pricing',
  '/business',
  '/demo',
  '/about',
  '/support',
  '/privacy',
  '/terms',
  '/refund',
  '/join-as-interviewer',
  '/interviewers',
  '/auth/signin',
  '/auth/register',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();

  for (const route of PUBLIC_ROUTES) {
    // Arabic (default)
    entries.push({
      url: `${SITE_URL}${route || '/'}`,
      lastModified: now,
      changeFrequency: route === '' ? 'weekly' : 'monthly',
      priority: route === '' ? 1 : 0.8,
    });
    // English
    entries.push({
      url: `${SITE_URL}/en${route}`,
      lastModified: now,
      changeFrequency: route === '' ? 'weekly' : 'monthly',
      priority: route === '' ? 0.9 : 0.7,
    });
  }

  return entries;
}
