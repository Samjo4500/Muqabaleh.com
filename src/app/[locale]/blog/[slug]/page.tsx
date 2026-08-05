import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPost, getRelatedPosts, getAllSlugs } from '@/content/blog';
import ArticleClient from './article-client';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

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
  const arUrl = `${SITE_URL}/blog/${slug}`;
  const enUrl = `${SITE_URL}/en/blog/${slug}`;

  return {
    title: { absolute: post.metaTitle },
    description: post.metaDescription,
    keywords: post.keywords,
    authors: [{ name: 'Muqabaleh' }],
    alternates: {
      canonical: url,
      languages: {
        'ar-SA': arUrl,
        'en-US': enUrl,
        'x-default': arUrl,
      },
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ['Muqabaleh'],
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
  const url = `${SITE_URL}${locale === 'en' ? '/en' : ''}/blog/${slug}`;
  const blogIndex = `${SITE_URL}${locale === 'en' ? '/en' : ''}/blog`;

  return (
    <>
      <ArticleJsonLd
        title={post.title}
        description={post.metaDescription}
        url={url}
        image={post.image}
        datePublished={post.date}
        locale={locale}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Muqabaleh', url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { name: locale === 'ar' ? 'المدونة' : 'Blog', url: blogIndex },
          { name: post.title, url },
        ]}
      />
      <ArticleClient post={post} related={related} locale={locale} />
    </>
  );
}
