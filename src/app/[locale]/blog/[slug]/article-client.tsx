'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Clock, ArrowLeft, ArrowRight, Share2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/content/blog';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function handleShare(platform: string, url: string, title: string) {
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  let shareUrl = '';
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encoded}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`;
      break;
    case 'whatsapp':
      shareUrl = `https://wa.me/?text=${text}%20${encoded}`;
      break;
  }
  if (shareUrl) window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
}

export default function ArticleClient({
  post,
  related,
  locale,
}: {
  post: BlogPost;
  related: BlogPost[];
  locale: string;
}) {
  const t = useTranslations('blog');
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Article Header */}
      <article className="border-b border-white/[0.06] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft size={16} className={locale === 'ar' ? 'rotate-180' : ''} />
            {t('backToBlog')}
          </Link>

          <div className="mb-6 flex items-center gap-3 text-xs text-[var(--text-faint)]">
            <span>{t('author')}</span>
            <span>·</span>
            <span>{formatDate(post.date, locale)}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {post.readingTime} {t('minRead')}
            </span>
          </div>

          <h1 className="text-3xl font-bold leading-tight text-[var(--text-primary)] sm:text-4xl" dir={dir}>
            {post.title}
          </h1>

          {/* Share buttons */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Share2 size={16} className="shrink-0 text-[var(--text-faint)]" />
            {['twitter', 'linkedin', 'whatsapp'].map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className="shrink-0 h-8 border border-white/10 text-xs text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)] capitalize"
                onClick={() => handleShare(p, pageUrl, post.title)}
              >
                {p}
              </Button>
            ))}
          </div>
        </div>
      </article>

      {/* Article Content */}
      <article className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Image placeholder */}
          <div className="mb-10 flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 border border-[var(--gold)]/10 sm:h-80">
            <BookOpen size={56} className="text-[var(--gold)]/30" strokeWidth={1.5} />
          </div>

          {/* Prose content */}
          <div
            className="prose-blog text-lg md:text-base"
            dir={dir}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Bottom CTA */}
          <div className="mt-12 rounded-2xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-8 text-center">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('ctaTitle')}</h2>
            <p className="mt-2 text-[var(--text-muted)]">{t('ctaSubtitle')}</p>
            <Link
              href="/demo"
              className="btn-gold mt-4 inline-flex items-center gap-2 px-8 py-3 text-base"
            >
              {t('ctaButton')}
              <ArrowRight size={18} className={locale === 'ar' ? 'rotate-180' : ''} />
            </Link>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="border-t border-white/[0.06] py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-xl font-bold text-[var(--text-primary)]">{t('relatedArticles')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 transition-all hover:border-[var(--gold)]/20 hover:bg-white/[0.04]"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs text-[var(--text-faint)]">
                    <Clock size={12} />
                    {r.readingTime} {t('minRead')}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors" dir={dir}>
                    {r.title}
                  </h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--gold)]">
                    {t('readMore')}
                    <ArrowRight size={12} className={locale === 'ar' ? 'rotate-180' : ''} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
