import type { MetadataRoute } from 'next';
import { getAllPosts, getAllSlugs } from '@/content/blog';
import { buildStaticSitemapEntries } from '@/lib/sitemaps/static-urls';

/**
 * Static + blog URLs only. Jobs and interview guides live in their own
 * sitemaps and are generated at request/cron time — not during `next build`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const entries: MetadataRoute.Sitemap = buildStaticSitemapEntries(now).map((e) => ({
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency,
    priority: e.priority,
  }));

  const postsBySlug = new Map<string, string>();
  for (const post of [...getAllPosts('en'), ...getAllPosts('ar')]) {
    if (!postsBySlug.has(post.slug) || post.date > (postsBySlug.get(post.slug) || '')) {
      postsBySlug.set(post.slug, post.date);
    }
  }

  for (const { locale, slug } of getAllSlugs()) {
    const prefix = locale === 'en' ? '/en' : '';
    entries.push({
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com'}${prefix}/blog/${slug}`,
      lastModified: postsBySlug.get(slug) || now,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  return entries;
}
