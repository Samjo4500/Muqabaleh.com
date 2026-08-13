'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Clock,
  Linkedin,
  MessageCircle,
  Share2,
} from 'lucide-react';
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
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const pageUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://muqabaleh.com${locale === 'en' ? '/en' : ''}/blog/${post.slug}`;

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
      <CrystalNavbar />

      <main>
        {/* Article hero */}
        <section className="relative overflow-hidden pb-8 pt-8 md:pb-10 md:pt-12">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 30% 0%, rgba(45,212,191,0.14), transparent 55%), radial-gradient(ellipse 40% 35% at 100% 40%, rgba(232,201,122,0.1), transparent 50%)',
            }}
          />
          <div className="mq-wrap relative">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="mx-auto max-w-3xl"
            >
              <motion.div variants={fadeUp} className="mb-6">
                <Link href={localePath('/', locale)} aria-label="Muqabaleh">
                  <BrandLogo
                    size="hero"
                    priority
                    className="mq-logo-glow relative drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
                  />
                </Link>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/45"
              >
                <Link
                  href={localePath('/blog', locale)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-semibold text-teal-100/90 transition hover:border-teal-300/40 hover:bg-teal-400/10"
                >
                  {t('eyebrow')}
                </Link>
                <span>{t('author')}</span>
                <span>·</span>
                <span>{formatDate(post.date, locale)}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={12} />
                  {post.readingTime} {t('minRead')}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mq-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl"
              >
                {post.title}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-4 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg"
              >
                {post.excerpt}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-white/40">
                  <Share2 size={14} />
                  {t('share')}
                </span>
                {(
                  [
                    { id: 'twitter', label: 'X' },
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleShare(p.id, pageUrl, post.title)}
                    className="rounded-full border border-white/12 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-white/65 transition hover:border-teal-300/35 hover:text-white"
                  >
                    {p.label}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Cover plane */}
        <section className="relative pb-8">
          <div className="mq-wrap">
            <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] border border-white/12">
              <div
                className="aspect-[21/9] sm:aspect-[2.4/1]"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 80% at 25% 40%, rgba(45,212,191,0.3), transparent 55%), radial-gradient(ellipse 50% 60% at 85% 70%, rgba(232,201,122,0.2), transparent 50%), linear-gradient(160deg, #0b1220 0%, #05080f 100%)',
                }}
              />
              <div className="absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:32px_32px]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/40 to-transparent p-6 sm:p-8">
                <div className="mq-display text-5xl font-bold text-white/20 sm:text-7xl">
                  {post.title.trim().slice(0, 1)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Prose */}
        <section className="relative pb-12 md:pb-16">
          <div className="mq-wrap">
            <article className="mx-auto max-w-3xl">
              <div
                className="prose-blog mq-atelier-prose text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="mq-facet mq-facet-gold relative mt-12 overflow-hidden rounded-[1.75rem] border border-amber-200/25 px-6 py-10 text-center md:px-10">
                <h2 className="mq-display text-2xl font-bold text-white md:text-3xl">
                  {t('ctaTitle')}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/55">{t('ctaSubtitle')}</p>
                <Link
                  href={localePath('/demo', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer mt-6 inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
                >
                  {t('ctaButton')}
                  <Arrow size={16} />
                </Link>
              </div>
            </article>
          </div>
        </section>

        <section className="mq-section !pt-0 !pb-6">
          <div className="mq-wrap">
            <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-2xl border border-teal-300/20 bg-teal-400/[0.06] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  {isAr ? 'أدلة مقابلات ذات صلة' : 'Related interview guides'}
                </p>
                <p className="mt-1 text-sm text-white/55">
                  {isAr
                    ? 'أسئلة ونصائح قبل التقديم — للشركات والأدوار.'
                    : 'Questions and tips before you apply — by company and role.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <Link
                  href={localePath('/interview-guide', locale)}
                  className="text-teal-300 hover:text-teal-200"
                >
                  {isAr ? 'أدلة الشركات' : 'Company guides'}
                </Link>
                <Link
                  href={localePath('/interview-guide/role', locale)}
                  className="text-teal-300 hover:text-teal-200"
                >
                  {isAr ? 'أدلة الأدوار' : 'Role guides'}
                </Link>
                <Link
                  href={localePath('/interview-guide/role/software-engineer', locale)}
                  className="text-teal-300 hover:text-teal-200"
                >
                  {isAr ? 'مهندس برمجيات' : 'Software Engineer'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 ? (
          <section className="mq-section !pt-0">
            <div className="mq-wrap">
              <h2 className="mq-display mb-6 text-2xl font-bold text-white md:text-3xl">
                {t('relatedArticles')}
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                {related.map((r, i) => (
                  <motion.div
                    key={r.slug}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.45, ease: easeCrystal }}
                  >
                    <Link
                      href={localePath(`/blog/${r.slug}`, locale)}
                      className={cn(
                        'mq-panel group relative flex h-full flex-col overflow-hidden p-5',
                        FACETS[i % FACETS.length],
                      )}
                    >
                      <div className="mb-3 flex items-center gap-2 text-[11px] text-white/40">
                        <Clock size={11} />
                        {r.readingTime} {t('minRead')}
                      </div>
                      <h3 className="mq-display text-base font-bold leading-snug text-white transition group-hover:text-teal-100">
                        {r.title}
                      </h3>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300/90">
                        {t('readMore')}
                        <Arrow size={14} />
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <CrystalFooter />
    </div>
  );
}
