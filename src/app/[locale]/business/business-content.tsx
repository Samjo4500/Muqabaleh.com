'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  FileDown,
  LayoutDashboard,
  ListChecks,
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { cn } from '@/lib/utils';
import { HiringCommandCenter } from './HiringCommandCenter';

const FEATURE_ICONS = [Users, ListChecks, FileDown, LayoutDashboard, UserCheck, Lock] as const;

const PRICING_PLANS = [
  {
    titleKey: 'starterTitle' as const,
    priceKey: 'starterPrice' as const,
    descKey: 'starterDesc' as const,
    badge: null,
    features: ['starterF1', 'starterF2', 'starterF3'] as const,
    ctaKey: 'chooseStarter' as const,
    href: '/request-demo?from=business-starter',
    accent: 'cyan' as const,
  },
  {
    titleKey: 'businessTitle' as const,
    priceKey: 'businessPrice' as const,
    descKey: 'businessDesc' as const,
    badge: 'businessBadge' as const,
    features: ['businessF1', 'businessF2', 'businessF3', 'businessF4', 'businessF5', 'businessF6'] as const,
    ctaKey: 'chooseBusiness' as const,
    href: '/request-demo?from=business-plan',
    popular: true,
    accent: 'teal' as const,
  },
  {
    titleKey: 'enterpriseTitle' as const,
    priceKey: 'enterprisePrice' as const,
    descKey: 'enterpriseDesc' as const,
    badge: null,
    features: ['enterpriseF1', 'enterpriseF2', 'enterpriseF3', 'enterpriseF4', 'enterpriseF5', 'enterpriseF6'] as const,
    ctaKey: 'chooseEnterprise' as const,
    href: '/request-demo?from=business-enterprise&intent=quote',
    accent: 'gold' as const,
  },
];

const HOW_VISUALS = [
  { en: 'Create role · invite link', ar: 'أنشئ الدور · رابط الدعوة' },
  { en: 'Jeannie interviews live', ar: 'جيني تُجري المقابلة مباشرة' },
  { en: 'Scores land on your desk', ar: 'الدرجات تصل إلى مكتبك' },
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

function LivePulse({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-teal-300/35 bg-teal-400/12 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-100">
      <motion.span
        className="relative flex h-2 w-2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        <span className="absolute inset-0 rounded-full bg-teal-300 opacity-60 blur-[2px]" />
        <span className="relative h-2 w-2 rounded-full bg-teal-300" />
      </motion.span>
      {label}
    </span>
  );
}

export default function BusinessContent() {
  const t = useTranslations('business');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const [howBeat, setHowBeat] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setHowBeat((b) => (b + 1) % 3), 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className="mq-atelier relative min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <LanguageSwitcherFixed />
      <CrystalNavbar />

      <main>
        {/* Full-bleed brand hero — one composition */}
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
                src="/images/hero-interview-meeting.webp"
                alt={
                  isAr
                    ? 'مقابلة — لوحة توظيف بمقابلات جيني'
                    : 'Muqabaleh — hiring desk powered by Jeannie interviews'
                }
                fill
                priority
                className="object-cover"
                style={{ objectPosition: 'center 22%' }}
                sizes="100vw"
                quality={74}
              />
            </motion.div>
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(105deg, rgba(5,8,15,0.92) 0%, rgba(5,8,15,0.62) 48%, rgba(5,8,15,0.35) 100%), linear-gradient(180deg, rgba(5,8,15,0.2) 0%, rgba(5,8,15,0.78) 100%)',
              }}
            />
          </motion.div>

          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <motion.div
              className="absolute -start-16 top-[20%] h-64 w-64 rounded-full bg-teal-400/20 blur-3xl"
              animate={{ opacity: [0.25, 0.55, 0.25], y: [0, -20, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            />
            <motion.div
              className="absolute -end-10 bottom-[25%] h-72 w-72 rounded-full bg-amber-300/12 blur-3xl"
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
                    className="mq-logo-glow drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]"
                  />
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mb-4 flex flex-wrap items-center gap-3">
                <p className="mq-kicker text-teal-200/90">{t('heroEyebrow')}</p>
                <LivePulse label={isAr ? 'فرز مباشر' : 'Live screening'} />
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="mq-display mb-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
              >
                {t('heroH1')}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mb-8 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
              >
                {t('heroSub')}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={localePath('/request-demo?from=business', locale)}
                  className="mq-btn mq-btn-on-dark mq-btn-shimmer inline-flex items-center justify-center gap-2"
                >
                  {t('ctaTitle')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/request-demo?from=business&intent=quote', locale)}
                  className="mq-btn mq-btn-on-dark-ghost inline-flex items-center justify-center"
                >
                  {t('heroCta2')}
                </Link>
                <Link
                  href={localePath('/b2b', locale)}
                  className="mq-btn mq-btn-on-dark-ghost inline-flex items-center justify-center"
                >
                  {isAr ? 'معاينة اللوحة' : 'Preview console'}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--mq-paper)] to-transparent" />
        </section>

        {/* Product stage — command center */}
        <section className="mq-section !pt-6 md:!pt-10">
          <div className="mq-wrap">
            <motion.div
              className="mx-auto mb-8 max-w-2xl text-center md:mb-10"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="mq-kicker mb-3">{isAr ? 'لوحة التوظيف' : 'Hiring desk'}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {isAr ? 'شاهد المرشحين يتحركون — مباشرة' : 'Watch your pipeline move — live'}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">
                {isAr
                  ? 'جيني تُجري المقابلات. الدرجات والجوازات تصل إلى مكتبك في ثوانٍ.'
                  : 'Jeannie runs the interviews. Scores and passports land on your desk in seconds.'}
              </p>
            </motion.div>
            <HiringCommandCenter />

            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
              {[t('statsTime'), t('statsDuration')].map((label, i) => (
                <motion.div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-center"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <p className="mq-display text-2xl font-bold text-teal-300 md:text-3xl">
                    {label.split(' ')[0]}
                  </p>
                  <p className="mt-1 text-sm text-white/50">{label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — cinematic beats, not a card farm */}
        <section id="how" className="mq-section scroll-mt-28">
          <div className="mq-wrap">
            <div className="mb-10 max-w-2xl">
              <p className="mq-kicker mb-3">{isAr ? 'كيف يعمل' : 'How it works'}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">{t('howTitle')}</h2>
            </div>

            <div className="mq-biz-stage overflow-hidden rounded-[2rem] border border-white/10">
              <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
                <ol className="space-y-1 border-b border-white/10 p-4 md:p-6 lg:border-b-0 lg:border-e">
                  {([1, 2, 3] as const).map((step, i) => {
                    const on = howBeat === i;
                    return (
                      <li key={step}>
                        <button
                          type="button"
                          onClick={() => setHowBeat(i)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl px-3 py-3.5 text-start transition',
                            on
                              ? 'border border-teal-300/30 bg-teal-400/10'
                              : 'border border-transparent hover:bg-white/[0.04]',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                              on
                                ? 'bg-teal-300/20 text-teal-100'
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
                              {t(`howStep${step}Title`)}
                            </span>
                            <span className="mt-1 block text-sm text-white/45">
                              {t(`howStep${step}Desc`)}
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
                      key={howBeat}
                      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                      transition={{ duration: 0.45, ease: easeCrystal }}
                      className="w-full max-w-md text-center"
                    >
                      <motion.div
                        className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-teal-300/35 bg-teal-400/12 text-2xl font-black text-teal-100"
                        animate={{ scale: [0.96, 1.05, 1] }}
                        transition={{ duration: 1.4 }}
                      >
                        {String(howBeat + 1).padStart(2, '0')}
                      </motion.div>
                      <p className="mq-display text-xl font-bold text-white md:text-2xl">
                        {isAr ? HOW_VISUALS[howBeat].ar : HOW_VISUALS[howBeat].en}
                      </p>
                      <div className="mx-auto mt-6 h-1.5 max-w-[200px] overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          key={`bar-${howBeat}`}
                          className="h-full rounded-full bg-gradient-to-r from-teal-300 to-cyan-300"
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

        {/* Capabilities — one continuous filmstrip, not a dashboard of cards */}
        <section id="features" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mb-10 max-w-2xl">
              <p className="mq-kicker mb-3">{isAr ? 'القدرات' : 'Capabilities'}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('featuresTitle')}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">{t('featuresSub')}</p>
            </div>

            <div className="space-y-3">
              {([1, 2, 3, 4, 5, 6] as const).map((i) => {
                const Icon = FEATURE_ICONS[i - 1];
                return (
                  <motion.article
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 md:px-7 md:py-6"
                    initial={{ opacity: 0, x: isAr ? 20 : -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: (i - 1) * 0.05, duration: 0.45, ease: easeCrystal }}
                  >
                    <motion.div
                      className="pointer-events-none absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-teal-300 via-cyan-300 to-transparent opacity-0 transition group-hover:opacity-100"
                      aria-hidden
                    />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-300/25 bg-teal-400/12">
                        <Icon size={22} strokeWidth={1.75} className="text-teal-300" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mq-display text-lg font-bold text-white md:text-xl">
                          {t(`f${i}Title`)}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/55 md:text-base">
                          {t(`f${i}Desc`)}
                        </p>
                      </div>
                      <span className="hidden text-xs font-bold tracking-[0.18em] text-white/25 sm:block">
                        {String(i).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security & compliance — enterprise procurement signal */}
        <section id="compliance" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mb-8 max-w-2xl md:mb-10">
              <p className="mq-kicker mb-3">{t('complianceKicker')}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('complianceTitle')}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">{t('complianceSub')}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  ['complianceItem1Title', 'complianceItem1Body'],
                  ['complianceItem2Title', 'complianceItem2Body'],
                  ['complianceItem3Title', 'complianceItem3Body'],
                  ['complianceItem4Title', 'complianceItem4Body'],
                ] as const
              ).map(([titleKey, bodyKey], idx) => (
                <motion.div
                  key={titleKey}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06, duration: 0.4, ease: easeCrystal }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/25 bg-teal-400/12">
                    <ShieldCheck size={18} className="text-teal-300" />
                  </div>
                  <h3 className="mq-display text-base font-bold text-white">{t(titleKey)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{t(bodyKey)}</p>
                </motion.div>
              ))}
            </div>

            <p className="mt-5 max-w-3xl text-sm text-white/40">{t('complianceFootnote')}</p>
          </div>
        </section>

        {/* Plans — custom pricing */}
        <section id="pricing" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
              <p className="mq-kicker mb-3">{isAr ? 'الخطط' : 'Plans'}</p>
              <h2 className="mq-display text-3xl font-bold text-white md:text-5xl">
                {t('pricingTitle')}
              </h2>
              <p className="mt-3 text-base text-white/55 md:text-lg">{t('pricingSub')}</p>
            </div>

            <div className="grid items-stretch gap-4 md:grid-cols-3 md:gap-5">
              {PRICING_PLANS.map((plan, idx) => (
                <motion.article
                  key={plan.titleKey}
                  className={cn(
                    'relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/10 p-6 md:p-7',
                    plan.popular
                      ? 'bg-teal-400/[0.07] ring-1 ring-teal-300/30 shadow-[0_0_48px_rgba(45,212,191,0.12)] md:-translate-y-2'
                      : 'bg-white/[0.03]',
                  )}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.45, ease: easeCrystal }}
                >
                  {plan.popular ? (
                    <span className="mb-3 inline-flex w-fit rounded-lg border border-teal-300/30 bg-teal-400/15 px-3 py-1 text-[11px] font-bold text-teal-200">
                      {t(plan.badge!)}
                    </span>
                  ) : (
                    <span className="mb-3 inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-white/30">
                      {isAr ? 'خطة' : 'Plan'}
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
                        <Check size={15} className="mt-0.5 shrink-0 text-teal-300" />
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

            <motion.div
              id="human"
              className="mx-auto mt-8 max-w-2xl rounded-2xl border border-amber-200/20 bg-amber-200/[0.05] px-6 py-6 text-center md:px-8"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-200/10">
                <UserCheck size={20} className="text-amber-100" />
              </div>
              <h3 className="mq-display mt-3 text-lg font-bold text-white">{t('humanServiceTitle')}</h3>
              <p className="mt-1 text-sm font-semibold text-amber-100/85">{t('humanServicePrice')}</p>
              <p className="mt-2 text-sm text-white/50">{t('humanServiceDesc')}</p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mq-section !pt-6">
          <div className="mq-wrap">
            <motion.div
              className="relative overflow-hidden rounded-[2rem] border border-teal-300/25 px-6 py-16 text-center md:px-12 md:py-24"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(45,212,191,0.2), transparent 55%), linear-gradient(180deg, rgba(8,14,26,0.95) 0%, rgba(5,8,15,0.98) 100%)',
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
              <p className="mq-kicker relative mb-3 text-teal-200/80">Muqabaleh</p>
              <h2 className="mq-display relative text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t('ctaTitle')}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-base text-white/55">{t('ctaSub')}</p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={localePath('/request-demo?from=business-final', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
                >
                  {t('ctaTitle')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/request-demo?from=business-final&intent=quote', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center px-7 text-sm font-bold"
                >
                  {t('heroCta2')}
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}
