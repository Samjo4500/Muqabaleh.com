import type { MetadataRoute } from 'next';
import { getAllPosts, getAllSlugs } from '@/content/blog';
import { db } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

const PUBLIC_ROUTES = [
  '',
  '/jobs',
  '/employers',
  '/business',
  '/request-demo',
  '/demo',
  '/about',
  '/support',
  '/privacy',
  '/terms',
  '/refund',
  '/join-as-interviewer',
  '/interviewers',
  '/human-interviews',
  '/blog',
  '/partners',
  '/verify',
  '/legal/opt-out',
  '/interview-guide',
  '/interview-guide/role',
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date().toISOString();

  for (const route of PUBLIC_ROUTES) {
    const priority =
      route === ''
        ? 1
        : route === '/jobs' || route === '/blog' || route === '/employers'
          ? 0.95
          : route === '/demo' || route === '/business'
            ? 0.85
            : route === '/legal/opt-out'
              ? 0.3
              : 0.7;

    const freq: MetadataRoute.Sitemap[0]['changeFrequency'] =
      route === '' || route === '/jobs' || route === '/blog' || route === '/employers'
        ? 'daily'
        : 'monthly';

    entries.push({
      url: `${SITE_URL}${route || '/'}`,
      lastModified: now,
      changeFrequency: freq,
      priority,
    });
    entries.push({
      url: `${SITE_URL}/en${route}`,
      lastModified: now,
      changeFrequency: freq,
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

  // Per-guide URLs live in /sitemap-interview-guides.xml (see robots.txt).

  try {
    const companies = await db.listedCompany.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        jobs: {
          where: { isActive: true },
          select: { slug: true, updatedAt: true, postedAt: true },
          take: 80,
          orderBy: { postedAt: 'desc' },
        },
      },
      take: 60,
    });

    for (const company of companies) {
      for (const prefix of ['', '/en'] as const) {
        entries.push({
          url: `${SITE_URL}${prefix}/companies/${company.slug}`,
          lastModified: company.updatedAt.toISOString(),
          changeFrequency: 'daily',
          priority: 0.8,
        });
        for (const job of company.jobs) {
          entries.push({
            url: `${SITE_URL}${prefix}/companies/${company.slug}/${job.slug}`,
            lastModified: (job.updatedAt || job.postedAt).toISOString(),
            changeFrequency: 'daily',
            priority: 0.75,
          });
        }
      }
    }
  } catch (err) {
    console.error('[sitemap] listed jobs', err);
  }

  return entries;
}
