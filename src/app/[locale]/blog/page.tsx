import { setRequestLocale } from 'next-intl/server';
import { getAllPosts } from '@/content/blog';
import BlogListingClient from './blog-listing-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = getAllPosts(locale);

  return <BlogListingClient posts={posts} locale={locale} />;
}
