import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getAllPosts } from '@/content/blog';
import BlogListingClient from './blog-listing-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'المدونة — نصائح مقابلات | مقابلة'
        : 'Blog — Interview Tips & Guides | Muqabaleh',
    },
    description: isAr
      ? 'أدلة ونصائح متخصصة لمقابلات العمل، التواصل، والنمو المهني — بالعربية والإنجليزية.'
      : 'Expert guides on job interviews, communication, and career growth — in Arabic and English.',
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const posts = getAllPosts(locale);

  return <BlogListingClient posts={posts} locale={locale} />;
}
