import type { MetadataRoute } from 'next';
import { getAllPosts, getAllSlugs } from '@/content/blog';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

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
  '/partners',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();

  for (const route of PUBLIC_ROUTES) {
    const priority =
      route === '' ? 1 : route === '/blog' || route === '/demo' ? 0.9 : route === '/pricing' ? 0.85 : 0.75;

    entries.push({
      url: `${SITE_URL}${route || '/'}`,
      lastModified: now,
      changeFrequency: route === '' || route === '/blog' ? 'weekly' : 'monthly',
      priority,
    });
    entries.push({
      url: `${SITE_URL}/en${route}`,
      lastModified: now,
      changeFrequency: route === '' || route === '/blog' ? 'weekly' : 'monthly',
      priority: Math.max(0.5, priority - 0.1),
    });
  }

  const postsBySlug = new Map<string, string>();
  for (const post of [...getAllPosts('en'), ...getAllPosts('ar')]) {
    if (!postsBySlug.has(post.slug) || post.date > (postsBySlug.get(post.slug) || '')) {
      postsBySlug.set(post.slug, post.date);
    }
  }

  for (const { locale, slug } of getAllSlugs()) {
    const prefix = locale === 'en' ? '/en' : '';
    entries.push({
      url: `${SITE_URL}${prefix}/blog/${slug}`,
      lastModified: postsBySlug.get(slug) || now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
