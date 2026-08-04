'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Clock, ArrowRight, BookOpen } from 'lucide-react';
import type { BlogPost } from '@/content/blog';
import { SectionHeading } from '@/components/brand';

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogListingClient({ posts, locale }: { posts: BlogPost[]; locale: string }) {
  const t = useTranslations('blog');
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      {/* Header */}
      <section className="border-b border-white/[0.06] py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading eyebrow={t('eyebrow')} title={t('title')} titleHighlight={t('titleHighlight')} />
          <p className="mt-4 text-[var(--text-muted)] max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className={`group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all hover:border-[var(--gold)]/30 hover:bg-white/[0.04] ${i === 0 ? 'md:col-span-2 md:flex md:items-start md:gap-8' : ''}`}
              >
                <div className={`mb-4 flex h-48 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 border border-[var(--gold)]/10 ${i === 0 ? 'md:mb-0 md:h-56 md:w-80 shrink-0' : ''}`}>
                  <BookOpen size={40} className="text-[var(--gold)]/40" strokeWidth={1.5} />
                </div>

                <div className={i === 0 ? 'flex-1' : ''}>
                  <div className="mb-3 flex items-center gap-3 text-xs text-[var(--text-faint)]">
                    <span>{formatDate(post.date, locale)}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {post.readingTime} {t('minRead')}
                    </span>
                  </div>
                  <h2 className={`font-bold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors ${i === 0 ? 'text-xl md:text-2xl' : 'text-lg'}`} dir={dir}>{post.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] line-clamp-2" dir={dir}>{post.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold)] group-hover:gap-2.5 transition-all">
                    {t('readMore')}
                    <ArrowRight size={14} className={locale === 'ar' ? 'rotate-180' : ''} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="border-t border-white/[0.06] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">{t('ctaTitle')}</h2>
          <p className="mt-3 text-[var(--text-muted)]">{t('ctaSubtitle')}</p>
          <Link href="/demo" className="btn-gold mt-6 inline-flex items-center gap-2 px-8 py-3 text-base">
            {t('ctaButton')}
            <ArrowRight size={18} className={locale === 'ar' ? 'rotate-180' : ''} />
          </Link>
        </div>
      </section>
    </div>
  );
}
