import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getPost, getRelatedPosts, getAllSlugs } from '@/content/blog';
import ArticleClient from './article-client';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/json-ld';
import type { Metadata } from 'next';
import { pageMetadata, SITE_URL } from '@/lib/seo';

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

  const isAr = locale !== 'en';
  const titleAr = `${post.title} | مدونة مقابلة`;
  const titleEn = `${post.title} | Muqabaleh Blog`;

  const meta = pageMetadata({
    locale,
    path: `/blog/${slug}`,
    titleAr: isAr ? post.metaTitle || titleAr : titleAr,
    titleEn: !isAr ? post.metaTitle || titleEn : titleEn,
    descAr: post.metaDescription,
    descEn: post.metaDescription,
    keywords: post.keywords,
    ogImage: post.image,
    ogType: 'article',
  });

  return {
    ...meta,
    authors: [{ name: 'Muqabaleh' }],
    openGraph: {
      ...meta.openGraph,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ['Muqabaleh'],
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
