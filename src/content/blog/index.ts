import { enPosts } from './en';
import { arPosts } from './ar';

export interface BlogPost {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  date: string;
  readingTime: number;
  image: string;
  keywords: string[];
  relatedSlugs: string[];
  content: string;
}

export function getAllPosts(locale: string): BlogPost[] {
  return locale === 'en' ? enPosts : arPosts;
}

export function getPost(locale: string, slug: string): BlogPost | undefined {
  const posts = getAllPosts(locale);
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(locale: string, slug: string, limit = 3): BlogPost[] {
  const post = getPost(locale, slug);
  if (!post) return [];
  const posts = getAllPosts(locale).filter((p) => p.slug !== slug);
  return posts.filter((p) => post.relatedSlugs.includes(p.slug)).slice(0, limit);
}

export function getAllSlugs(): { locale: string; slug: string }[] {
  const slugs: { locale: string; slug: string }[] = [];
  for (const p of enPosts) slugs.push({ locale: 'en', slug: p.slug });
  for (const p of arPosts) slugs.push({ locale: 'ar', slug: p.slug });
  return slugs;
}
