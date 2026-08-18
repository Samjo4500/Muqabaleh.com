'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowUpLeft, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import type { BlogPost } from '@/content/blog';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const FACETS = [
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-soft',
  'mq-facet mq-facet-amber mq-facet-shape-cap',
  'mq-facet mq-facet-rose mq-facet-shape-wave',
] as const;

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function LanguageSwitcherFixed() {
  const locale = useLocale();
  const pathname = usePathname() || '/';
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const href = getLocaleSwitchPath(pathname, locale, nextLocale);

  return (
    <div className="fixed top-4 right-4 z-[70]">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-teal-300/40 hover:bg-white/12"
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={locale === 'en' ? 'text-teal-300' : 'text-white/45'}>EN</span>
        <span className="text-white/35">/</span>
        <span className={locale === 'ar' ? 'text-teal-300' : 'text-white/45'} dir="rtl" lang="ar">
          عربي
        </span>
      </a>
    </div>
  );
}

function CoverPlane({
  index,
  featured,
  title,
}: {
  index: number;
  featured?: boolean;
  title: string;
}) {
  const initial = title.trim().slice(0, 1).toUpperCase();
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/12',
        featured ? 'aspect-[16/10] md:aspect-auto md:h-full md:min-h-[280px]' : 'aspect-[16/10]',
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            index % 2 === 0
              ? 'radial-gradient(ellipse 80% 70% at 20% 20%, rgba(45,212,191,0.28), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(232,201,122,0.18), transparent 50%), linear-gradient(160deg, #0b1220 0%, #05080f 100%)'
              : 'radial-gradient(ellipse 70% 60% at 80% 10%, rgba(232,201,122,0.22), transparent 50%), radial-gradient(ellipse 55% 55% at 10% 90%, rgba(103,232,249,0.16), transparent 50%), linear-gradient(160deg, #0b1220 0%, #05080f 100%)',
        }}
      />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="absolute inset-0 flex items-end p-5 md:p-6">
        <span className="mq-display text-6xl font-bold leading-none text-white/15 md:text-7xl">
          {initial}
        </span>
      </div>
      <div className="absolute end-4 top-4 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-100/80 backdrop-blur-md">
        Guide
      </div>
    </div>
  );
}

export default function BlogListingClient({
  posts,
  locale,
}: {
  posts: BlogPost[];
  locale: string;
}) {
  const t = useTranslations('blog');
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const [featured, ...rest] = posts;

  return (
    <div
      className="mq-atelier relative min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <LanguageSwitcherFixed />
      <CrystalNavbar locale={locale} />

      <main>
        {/* Hero — one composition */}
        <section className="relative overflow-hidden pb-10 pt-8 md:pb-14 md:pt-12">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(45,212,191,0.16), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 60%, rgba(232,201,122,0.1), transparent 50%)',
            }}
          />
          <div className="mq-wrap relative">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeUp} className="mb-6 flex justify-center">
                <Link href={localePath('/', locale)} aria-label="Muqabaleh">
                  <BrandLogo
                    size="hero"
                    priority
                    className="mq-logo-glow relative drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
                  />
                </Link>
              </motion.div>
              <motion.p variants={fadeUp} className="mq-kicker mb-3">
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-200" />
                  {t('eyebrow')}
                </span>
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                {t('title')}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mx-auto mb-8 max-w-xl text-base text-white/60 md:text-lg"
              >
                {t('subtitle')}
              </motion.p>
              <motion.div variants={fadeUp}>
                <a
                  href="#guides"
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
                >
                  {t('browseCta')}
                  <Arrow size={16} />
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Featured + grid */}
        <section id="guides" className="mq-section scroll-mt-28 !pt-4 md:!pt-6">
          <div className="mq-wrap">
            {featured ? (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: easeCrystal }}
                className="mb-6"
              >
                <Link
                  href={localePath(`/blog/${featured.slug}`, locale)}
                  className={cn(
                    'mq-panel group relative grid overflow-hidden md:grid-cols-[1.05fr_1fr]',
                    FACETS[0],
                  )}
                >
                  <CoverPlane index={0} featured title={featured.title} />
                  <div className="relative flex flex-col justify-center p-6 md:p-8 lg:p-10">
                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/45">
                      <span className="rounded-full border border-teal-300/30 bg-teal-400/10 px-2.5 py-0.5 font-semibold uppercase tracking-wider text-teal-100">
                        {t('featured')}
                      </span>
                      <span>{formatDate(featured.date, locale)}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} />
                        {featured.readingTime} {t('minRead')}
                      </span>
                    </div>
                    <h2 className="mq-display text-2xl font-bold leading-tight text-white transition group-hover:text-teal-100 md:text-3xl lg:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55 md:text-base">
                      {featured.excerpt}
                    </p>
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-teal-300">
                      {t('readMore')}
                      <Arrow size={16} className="transition group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ) : null}

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {rest.map((post, i) => (
                <motion.div key={post.slug} variants={fadeUp}>
                  <Link
                    href={localePath(`/blog/${post.slug}`, locale)}
                    className={cn(
                      'mq-panel group relative flex h-full flex-col overflow-hidden transition',
                      FACETS[(i + 1) % FACETS.length],
                    )}
                  >
                    <CoverPlane index={i + 1} title={post.title} />
                    <div className="relative flex flex-1 flex-col p-5">
                      <div className="mb-2 flex items-center gap-2 text-[11px] text-white/40">
                        <span>{formatDate(post.date, locale)}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {post.readingTime} {t('minRead')}
                        </span>
                      </div>
                      <h3 className="mq-display text-lg font-bold leading-snug text-white transition group-hover:text-teal-100">
                        {post.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-white/50">
                        {post.excerpt}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300/90">
                        {t('readMore')}
                        <Arrow size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="mq-section !pt-6">
          <div className="mq-wrap">
            <motion.div
              className="mq-facet mq-facet-gold relative overflow-hidden rounded-[2rem] border border-amber-200/25 px-6 py-12 text-center md:px-12 md:py-16"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(232,201,122,0.14), transparent 55%), linear-gradient(180deg, rgba(8,14,26,0.92) 0%, rgba(5,8,15,0.96) 100%)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: easeCrystal }}
            >
              <h2 className="mq-display relative text-2xl font-bold text-white md:text-4xl">
                {t('ctaTitle')}
              </h2>
              <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/55 md:text-base">
                {t('ctaSubtitle')}
              </p>
              <Link
                href={localePath('/demo', locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer relative mt-8 inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
              >
                {t('ctaButton')}
                <Arrow size={16} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}
