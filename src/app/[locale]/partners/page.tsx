'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  Globe2,
  KeyRound,
  Palette,
  ShieldCheck,
  Sparkles,
  Webhook,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { PartnerBrandConsole } from '@/components/partners/PartnerBrandConsole';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

const FEATURES = [
  { icon: Palette, key: 'featBrand', accent: 'amber' },
  { icon: Globe2, key: 'featDomain', accent: 'teal' },
  { icon: KeyRound, key: 'featApi', accent: 'cyan' },
  { icon: Webhook, key: 'featWebhooks', accent: 'teal' },
  { icon: ShieldCheck, key: 'featRevenue', accent: 'amber' },
  { icon: Sparkles, key: 'featClients', accent: 'cyan' },
] as const;

const PATH_VISUALS = [
  { en: 'Apply · we review your fit', ar: 'قدّم · نراجع ملاءمتك' },
  { en: 'Brand studio · your domain live', ar: 'استوديو الهوية · نطاقك يعمل' },
  { en: 'Clients · revenue on autopilot', ar: 'عملاء · إيرادات تلقائية' },
];

const PARTNER_PLANS = [
  {
    titleKey: 'planAgencyTitle' as const,
    descKey: 'planAgencyDesc' as const,
    priceKey: 'planCustomPrice' as const,
    features: ['planAgencyF1', 'planAgencyF2', 'planAgencyF3'] as const,
    ctaKey: 'applyCta' as const,
    href: '/partners/apply',
    popular: false,
  },
  {
    titleKey: 'planPlatformTitle' as const,
    descKey: 'planPlatformDesc' as const,
    priceKey: 'planCustomPrice' as const,
    features: ['planPlatformF1', 'planPlatformF2', 'planPlatformF3', 'planPlatformF4'] as const,
    ctaKey: 'quoteCta' as const,
    href: '/request-demo?from=partners-platform&intent=quote',
    popular: true,
  },
  {
    titleKey: 'planEnterpriseTitle' as const,
    descKey: 'planEnterpriseDesc' as const,
    priceKey: 'planCustomPrice' as const,
    features: ['planEnterpriseF1', 'planEnterpriseF2', 'planEnterpriseF3', 'planEnterpriseF4'] as const,
    ctaKey: 'quoteCta' as const,
    href: '/request-demo?from=partners-enterprise&intent=quote',
    popular: false,
  },
];

function LanguageSwitcherFixed() {
  const locale = useLocale();
  const pathname = usePathname() || '/';
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const href = getLocaleSwitchPath(pathname, locale, nextLocale);

  return (
    <div className="fixed top-4 right-4 z-[70]">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-amber-300/40 hover:bg-white/12"
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={locale === 'en' ? 'text-amber-200' : 'text-white/45'}>EN</span>
        <span className="text-white/35">/</span>
        <span className={locale === 'ar' ? 'text-amber-200' : 'text-white/45'} dir="rtl" lang="ar">
          عربي
        </span>
      </a>
    </div>
  );
}

function LivePulse({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/35 bg-amber-200/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-100">
      <motion.span
        className="relative flex h-2 w-2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        <span className="absolute inset-0 rounded-full bg-amber-300 opacity-60 blur-[2px]" />
        <span className="relative h-2 w-2 rounded-full bg-amber-300" />
      </motion.span>
      {label}
    </span>
  );
}

export default function PartnersLandingPage() {
  const t = useTranslations('partnersMarketing');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const [pathBeat, setPathBeat] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setPathBeat((b) => (b + 1) % 3), 2800);
    return () => window.clearInterval(id);
  }, []);

  const enterDemo = async () => {
    const res = await fetch('/api/auth/demo-partner-login', { method: 'POST' });
    if (res.ok) {
      window.location.href = localePath('/partner', locale);
    }
  };

  return (
    <div
      className="mq-atelier relative min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <LanguageSwitcherFixed />
      <CrystalNavbar />

      <main>
        {/* Full-bleed brand hero */}
        <section className="relative min-h-[100svh] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.1, opacity: 0.5 }}
            animate={{ scale: 1.03, opacity: 1 }}
            transition={{ duration: 1.5, ease: easeCrystal }}
          >
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/hero-interview-hired.webp"
                alt={
                  isAr
                    ? 'مقابلة — شراكة علامة بيضاء للمقابلات'
                    : 'Muqabaleh — white-label interviewing partnership'
                }
                fill
                priority
                className="object-cover"
                style={{ objectPosition: 'center 28%' }}
                sizes="100vw"
                quality={74}
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, rgba(5,8,15,0.93) 0%, rgba(5,8,15,0.64) 48%, rgba(5,8,15,0.38) 100%), linear-gradient(180deg, rgba(5,8,15,0.22) 0%, rgba(5,8,15,0.8) 100%)',
              }}
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <motion.div
              className="absolute -start-16 top-[18%] h-64 w-64 rounded-full bg-amber-300/18 blur-3xl"
              animate={{ opacity: [0.25, 0.55, 0.25], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute -end-10 bottom-[22%] h-72 w-72 rounded-full bg-teal-400/14 blur-3xl"
              animate={{ opacity: [0.2, 0.45, 0.2], y: [0, 24, 0] }}
              transition={{ duration: 10, repeat: Infinity }}
            />
          </div>

          <div className="mq-wrap relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="max-w-3xl text-white"
            >
              <motion.div variants={fadeUp} className="mb-5">
                <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
                  <BrandLogo
                    size="hero"
                    priority
                    className="mq-logo-glow drop-shadow-[0_12px_40px_rgba(245,193,108,0.3)]"
                  />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-3">
                <p className="mq-kicker !text-amber-200/90">{t('eyebrow')}</p>
                <LivePulse label={isAr ? 'علامة بيضاء' : 'White-label'} />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mq-display mb-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {t('title')}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mb-8 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
              >
                {t('sub')}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={localePath('/partners/apply', locale)}
                  className="mq-btn mq-btn-on-dark mq-btn-shimmer inline-flex items-center justify-center gap-2"
                >
                  {t('applyCta')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/request-demo?from=partners&intent=quote', locale)}
                  className="mq-btn mq-btn-on-dark-ghost inline-flex items-center justify-center"
                >
                  {t('quoteCta')}
                </Link>
                <button
                  type="button"
                  onClick={enterDemo}
                  className="mq-btn mq-btn-on-dark-ghost inline-flex items-center justify-center"
                >
                  {t('demoCta')}
                </button>
              </motion.div>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--mq-paper)] to-transparent" />
        </section>

        <section className="mq-section !pt-8 md:!pt-12">
          <div className="mq-wrap">
            <div className="mb-8 max-w-2xl">
              <p className="mq-kicker mb-3 !text-amber-200/85">{t('audienceKicker')}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('audienceTitle')}
              </h2>
            </div>
            <ul className="grid gap-4 md:grid-cols-3">
              <li className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6">
                <h3 className="mq-display text-lg font-bold text-white md:text-xl">
                  {t('audAcademyTitle')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t('audAcademyBody')}</p>
              </li>
              <li className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6">
                <h3 className="mq-display text-lg font-bold text-white md:text-xl">
                  {t('audAgencyTitle')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t('audAgencyBody')}</p>
              </li>
              <li className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6">
                <h3 className="mq-display text-lg font-bold text-white md:text-xl">
                  {t('audPlatformTitle')}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{t('audPlatformBody')}</p>
              </li>
            </ul>
            <Link
              href={localePath('/how-scores-work', locale)}
              className="mt-6 inline-flex text-sm font-semibold text-amber-200/90 hover:text-amber-100"
            >
              {t('scoresLink')}
            </Link>
          </div>
        </section>

        {/* Brand studio stage */}
        <section className="mq-section !pt-6 md:!pt-10">
          <div className="mq-wrap">
            <motion.div
              className="mx-auto mb-8 max-w-2xl text-center md:mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="mq-kicker mb-3 !text-amber-200/85">{t('studioKicker')}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('studioTitle')}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">{t('studioSub')}</p>
            </motion.div>
            <PartnerBrandConsole />
          </div>
        </section>

        {/* Path — cinematic beats */}
        <section id="path" className="mq-section scroll-mt-28">
          <div className="mq-wrap">
            <div className="mb-10 max-w-2xl">
              <p className="mq-kicker mb-3 !text-amber-200/85">{t('pathKicker')}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('pathTitle')}
              </h2>
            </div>

            <div className="mq-partner-stage overflow-hidden rounded-[2rem] border border-amber-200/15">
              <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                <ol className="space-y-1 border-b border-white/10 p-4 md:p-6 lg:border-b-0 lg:border-e">
                  {([1, 2, 3] as const).map((step, i) => {
                    const on = pathBeat === i;
                    return (
                      <li key={step}>
                        <button
                          type="button"
                          onClick={() => setPathBeat(i)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-3.5 text-start transition',
                            on
                              ? 'border border-amber-200/30 bg-amber-200/10'
                              : 'border border-transparent hover:bg-white/[0.04]',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                              on
                                ? 'bg-amber-200/20 text-amber-100'
                                : 'bg-white/5 text-white/40',
                            )}
                          >
                            {step}
                          </span>
                          <span>
                            <span
                              className={cn(
                                'mq-display block text-base font-bold',
                                on ? 'text-white' : 'text-white/65',
                              )}
                            >
                              {t(`pathStep${step}Title`)}
                            </span>
                            <span className="mt-1 block text-sm text-white/45">
                              {t(`pathStep${step}Desc`)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                <div className="relative flex min-h-[280px] items-center justify-center p-6 md:min-h-[340px] md:p-10">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pathBeat}
                      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                      transition={{ duration: 0.45, ease: easeCrystal }}
                      className="w-full max-w-md text-center"
                    >
                      <motion.div
                        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-200/35 bg-amber-200/12 text-2xl font-black text-amber-100"
                        animate={{ scale: [0.96, 1.05, 1] }}
                        transition={{ duration: 1.4 }}
                      >
                        {String(pathBeat + 1).padStart(2, '0')}
                      </motion.div>
                      <p className="mq-display text-xl font-bold text-white md:text-2xl">
                        {isAr ? PATH_VISUALS[pathBeat].ar : PATH_VISUALS[pathBeat].en}
                      </p>
                      <div className="mx-auto mt-6 h-1.5 max-w-[200px] overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          key={`bar-${pathBeat}`}
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-teal-300"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2.6, ease: 'linear' }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities filmstrip */}
        <section id="capabilities" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mb-10 max-w-2xl">
              <p className="mq-kicker mb-3 !text-amber-200/85">{t('capsKicker')}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('capsTitle')}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">{t('capsSub')}</p>
            </div>

            <div className="space-y-3">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                const amber = f.accent === 'amber';
                return (
                  <motion.article
                    key={f.key}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 md:px-7 md:py-6"
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.05, duration: 0.45, ease: easeCrystal }}
                  >
                    <motion.div
                      className={cn(
                        'pointer-events-none absolute inset-y-0 start-0 w-1 opacity-0 transition group-hover:opacity-100',
                        amber
                          ? 'bg-gradient-to-b from-amber-300 via-amber-200 to-transparent'
                          : 'bg-gradient-to-b from-teal-300 via-cyan-300 to-transparent',
                      )}
                      aria-hidden
                    />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      <div
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                          amber
                            ? 'border-amber-200/25 bg-amber-200/12'
                            : 'border-teal-300/25 bg-teal-400/12',
                        )}
                      >
                        <Icon
                          size={22}
                          strokeWidth={1.75}
                          className={amber ? 'text-amber-200' : 'text-teal-300'}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mq-display text-lg font-bold text-white md:text-xl">
                          {t(`${f.key}Title`)}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/55 md:text-base">
                          {t(`${f.key}Body`)}
                        </p>
                      </div>
                      <span className="hidden text-xs font-bold tracking-[0.18em] text-white/25 sm:block">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Partnership models — custom pricing */}
        <section id="plans" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
              <p className="mq-kicker mb-3 !text-amber-200/85">{t('plansKicker')}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('plansTitle')}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">{t('plansSub')}</p>
            </div>

            <div className="grid items-stretch gap-4 md:grid-cols-3 md:gap-5">
              {PARTNER_PLANS.map((plan, idx) => (
                <motion.article
                  key={plan.titleKey}
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 p-6 md:p-7',
                    plan.popular
                      ? 'bg-amber-200/[0.07] shadow-[0_0_48px_rgba(245,193,108,0.1)] ring-1 ring-amber-200/30 md:-translate-y-2'
                      : 'bg-white/[0.03]',
                  )}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.45, ease: easeCrystal }}
                >
                  {plan.popular ? (
                    <span className="mb-3 inline-flex w-fit rounded-lg border border-amber-200/30 bg-amber-200/15 px-3 py-1 text-[11px] font-bold text-amber-100">
                      {t('planPopular')}
                    </span>
                  ) : (
                    <span className="mb-3 inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
                      {isAr ? 'نموذج' : 'Model'}
                    </span>
                  )}
                  <h3 className="mq-display text-xl font-bold text-white">{t(plan.titleKey)}</h3>
                  <p className="mt-1 text-sm text-white/45">{t(plan.descKey)}</p>
                  <p className="mq-display my-5 text-2xl font-bold text-white md:text-3xl">
                    {t(plan.priceKey)}
                  </p>
                  <ul className="mb-7 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((fk) => (
                      <li key={fk} className="flex items-start gap-2 text-sm text-white/60">
                        <Check size={15} className="mt-0.5 shrink-0 text-amber-200" />
                        <span>{t(fk)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={localePath(plan.href, locale)}
                    className={cn(
                      'inline-flex min-h-[48px] w-full items-center justify-center rounded-xl px-4 text-sm font-bold',
                      plan.popular ? 'mq-btn mq-btn-primary mq-btn-shimmer' : 'mq-btn mq-btn-ghost',
                    )}
                  >
                    {t(plan.ctaKey)}
                  </Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mq-section !pt-6">
          <div className="mq-wrap">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] border border-amber-200/25 px-6 py-16 text-center md:px-12 md:py-24"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(245,193,108,0.18), transparent 55%), linear-gradient(180deg, rgba(8,14,26,0.95) 0%, rgba(5,8,15,0.98) 100%)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeCrystal }}
            >
              <motion.div
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent"
                animate={{ x: ['-60%', '220%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <p className="mq-kicker relative mb-3 !text-amber-200/80">Muqabaleh</p>
              <h2 className="mq-display relative text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t('ctaTitle')}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-base text-white/55">{t('ctaBody')}</p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={localePath('/partners/apply', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
                >
                  {t('applyCta')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/request-demo?from=partners-final&intent=quote', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center px-7 text-sm font-bold"
                >
                  {t('quoteCta')}
                </Link>
                <button
                  type="button"
                  onClick={enterDemo}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center px-7 text-sm font-bold"
                >
                  {t('demoCta')}
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}
