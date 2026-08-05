import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { setRequestLocale } from 'next-intl/server';
import { getAllPosts } from '@/content/blog';
import BlogListingClient from './blog-listing-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/blog',
    titleAr: 'المدونة — مقابلة | نصائح مقابلات العمل',
    titleEn: 'Blog — Muqabaleh Interview Tips',
    descAr: 'مقالات ونصائح حول مقابلات العمل، الإنجليزية، وطريقة STAR لمرشّحي المنطقة.',
    descEn: 'Articles and tips on job interviews, English practice, and STAR method for MENA candidates.',
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = getAllPosts(locale);

  return <BlogListingClient posts={posts} locale={locale} />;
}
