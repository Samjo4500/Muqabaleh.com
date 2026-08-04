import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPost, getRelatedPosts, getAllSlugs } from '@/content/blog';
import ArticleClient from './article-client';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh-com.vercel.app';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map(({ locale, slug }) => ({ locale, slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(locale, slug);
  if (!post) return {};

  const url = `${SITE_URL}${locale === 'en' ? '/en' : ''}/blog/${slug}`;

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      type: 'article',
      publishedTime: post.date,
      authors: ['Muqabaleh Team'],
      images: [{ url: post.image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.image],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = getPost(locale, slug);
  if (!post) notFound();

  const related = getRelatedPosts(locale, slug);

  return <ArticleClient post={post} related={related} locale={locale} />;
}
