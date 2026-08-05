'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Check,
  FileDown,
  LayoutDashboard,
  ListChecks,
  Lock,
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
const FEATURE_FACETS = [
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-cut',
  'mq-facet mq-facet-amber mq-facet-shape-cap',
  'mq-facet mq-facet-rose mq-facet-shape-soft',
  'mq-facet mq-facet-teal mq-facet-shape-wave',
] as const;

const PRICING_PLANS = [
  {
    titleKey: 'starterTitle' as const,
    priceKey: 'starterPrice' as const,
    unitKey: 'starterUnit' as const,
    descKey: 'starterDesc' as const,
    badge: null,
    features: ['starterF1', 'starterF2', 'starterF3'] as const,
    ctaKey: 'chooseStarter' as const,
    href: '/request-demo',
    facet: 'mq-facet mq-facet-cyan mq-facet-shape-soft',
  },
  {
    titleKey: 'businessTitle' as const,
    priceKey: 'businessPrice' as const,
    unitKey: 'businessUnit' as const,
    descKey: 'businessDesc' as const,
    badge: 'businessBadge' as const,
    features: ['businessF1', 'businessF2', 'businessF3', 'businessF4', 'businessF5', 'businessF6'] as const,
    ctaKey: 'chooseBusiness' as const,
    href: '/request-demo',
    popular: true,
    facet: 'mq-facet mq-facet-teal mq-facet-shape-soft',
  },
  {
    titleKey: 'enterpriseTitle' as const,
    priceKey: 'enterprisePrice' as const,
    unitKey: '' as const,
    descKey: 'enterpriseDesc' as const,
    badge: null,
    features: ['enterpriseF1', 'enterpriseF2', 'enterpriseF3', 'enterpriseF4', 'enterpriseF5', 'enterpriseF6'] as const,
    ctaKey: 'chooseEnterprise' as const,
    href: '/request-demo',
    facet: 'mq-facet mq-facet-gold mq-facet-shape-wave',
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

export default function BusinessContent() {
  const t = useTranslations('business');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;

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
        {/* Hero — brand + copy + laptop product stage */}
        <section className="relative overflow-hidden pb-10 pt-6 md:pb-14 md:pt-8">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(45,212,191,0.16), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 70%, rgba(232,201,122,0.1), transparent 50%)',
            }}
          />

          <div className="mq-wrap relative">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeUp} className="mb-5 flex justify-center">
                <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
                  <BrandLogo size="hero" priority className="mq-logo-glow" />
                </Link>
              </motion.div>
              <motion.p variants={fadeUp} className="mq-kicker mb-3">
                {t('heroEyebrow')}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                {t('heroH1')}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mx-auto mb-8 max-w-xl text-base text-white/60 md:text-lg"
              >
                {t('heroSub')}
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="mb-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  href={localePath('/request-demo', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-bold"
                >
                  {t('ctaTitle')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href="#how"
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-bold"
                >
                  {t('heroCta2')}
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: easeCrystal }}
              className="relative"
            >
              <HiringCommandCenter />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative border-y border-white/8 py-10 md:py-12">
          <div className="mq-wrap grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {[t('statsTime'), t('statsDuration')].map((label, i) => (
              <motion.div
                key={label}
                className={cn(
                  'mq-panel p-6 text-center',
                  i === 0 ? 'mq-facet mq-facet-teal mq-facet-shape-soft' : 'mq-facet mq-facet-gold mq-facet-shape-wave',
                )}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: easeCrystal }}
              >
                <p className="mq-display text-2xl font-bold text-teal-300 md:text-3xl">
                  {label.split(' ')[0]}
                </p>
                <p className="mt-2 text-sm text-white/55">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mq-section scroll-mt-28">
          <div className="mq-wrap">
            <motion.div
              className="mx-auto mb-12 max-w-2xl text-center"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 variants={fadeUp} className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t('howTitle')}
              </motion.h2>
            </motion.div>

            <div className="relative mx-auto max-w-2xl">
              <div className="absolute inset-y-2 start-6 w-px bg-gradient-to-b from-teal-300/50 via-teal-300/15 to-transparent md:start-8" />
              {([1, 2, 3] as const).map((step, i) => (
                <motion.div
                  key={step}
                  className="relative mb-8 flex gap-5 last:mb-0 md:gap-7"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45, ease: easeCrystal }}
                >
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/15 text-base font-bold text-teal-200 shadow-[0_0_24px_rgba(45,212,191,0.25)] md:h-16 md:w-16 md:text-lg">
                    {step}
                  </div>
                  <div
                    className={cn(
                      'mq-panel flex-1 p-5 md:p-6',
                      FEATURE_FACETS[i],
                    )}
                  >
                    <h3 className="mq-display text-lg font-bold text-white">
                      {t(`howStep${step}Title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {t(`howStep${step}Desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t('featuresTitle')}
              </h2>
              <p className="mt-3 text-base text-white/60 md:text-lg">{t('featuresSub')}</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {([1, 2, 3, 4, 5, 6] as const).map((i) => {
                const Icon = FEATURE_ICONS[i - 1];
                return (
                  <motion.article
                    key={i}
                    className={cn('mq-panel flex flex-col gap-4 p-6 md:p-7', FEATURE_FACETS[i - 1])}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i - 1) * 0.06, duration: 0.4, ease: easeCrystal }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/25 bg-teal-400/12">
                      <Icon size={20} strokeWidth={1.75} className="text-teal-300" />
                    </div>
                    <h3 className="mq-display text-lg font-bold text-white">{t(`f${i}Title`)}</h3>
                    <p className="text-sm leading-relaxed text-white/60">{t(`f${i}Desc`)}</p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mq-section scroll-mt-28 !pt-4">
          <div className="mq-wrap">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t('pricingTitle')}
              </h2>
              <p className="mt-3 text-base text-white/60 md:text-lg">{t('pricingSub')}</p>
            </div>
            <div className="grid items-stretch gap-5 overflow-visible md:grid-cols-3">
              {PRICING_PLANS.map((plan, idx) => (
                <motion.article
                  key={plan.titleKey}
                  className={cn(
                    'mq-panel relative flex h-full flex-col overflow-visible p-6 md:p-7',
                    plan.facet,
                    plan.popular && 'ring-1 ring-teal-300/30 shadow-[0_0_40px_rgba(45,212,191,0.12)] md:-translate-y-1',
                  )}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.45, ease: easeCrystal }}
                  whileHover={{ y: -4 }}
                >
                  <div className="mb-3 min-h-[28px]">
                    {plan.badge ? (
                      <span className="inline-flex rounded-lg border border-teal-300/30 bg-teal-400/15 px-3 py-1 text-[11px] font-bold text-teal-300">
                        {t(plan.badge)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mq-display text-lg font-bold text-white">{t(plan.titleKey)}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/45">{t(plan.descKey)}</p>
                  <p className="mq-display my-5 text-3xl font-bold text-white">
                    {t(plan.priceKey)}
                    {plan.unitKey ? (
                      <span className="ms-1 text-base font-semibold text-white/45">{t(plan.unitKey)}</span>
                    ) : null}
                  </p>
                  <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                    {plan.features.map((fk) => (
                      <li key={fk} className="flex items-start gap-2 text-sm leading-snug text-white/60">
                        <Check size={15} className="mt-0.5 shrink-0 text-teal-300" />
                        <span>{t(fk)}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={localePath(plan.href, locale)}
                    className={cn(
                      'inline-flex min-h-[44px] w-full items-center justify-center rounded-xl px-4 text-sm font-bold transition',
                      plan.popular
                        ? 'mq-btn mq-btn-primary'
                        : 'mq-btn mq-btn-ghost',
                    )}
                  >
                    {t(plan.ctaKey)}
                  </Link>
                </motion.article>
              ))}
            </div>

            <motion.div
              id="human"
              className="mq-panel mq-facet mq-facet-gold mq-facet-shape-cap mx-auto mt-10 max-w-md p-7 text-center"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200/25 bg-amber-200/10">
                <UserCheck size={22} className="text-amber-100" />
              </div>
              <h3 className="mq-display mt-4 text-lg font-bold text-white">{t('humanServiceTitle')}</h3>
              <p className="mt-1 text-sm font-semibold text-amber-100/90">{t('humanServicePrice')}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/55">{t('humanServiceDesc')}</p>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mq-section !pt-6">
          <div className="mq-wrap">
            <motion.div
              className="mq-facet mq-facet-teal relative overflow-hidden rounded-[2rem] border border-teal-300/25 px-6 py-14 text-center md:px-12 md:py-20"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(45,212,191,0.16), transparent 55%), linear-gradient(180deg, rgba(8,14,26,0.92) 0%, rgba(5,8,15,0.96) 100%)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: easeCrystal }}
            >
              <motion.div
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/6 to-transparent"
                animate={{ x: ['-60%', '220%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <h2 className="mq-display relative text-3xl font-bold tracking-tight text-white md:text-5xl">
                {t('ctaTitle')}
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-base text-white/55">{t('ctaSub')}</p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href={localePath('/request-demo', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
                >
                  {t('ctaTitle')}
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/b2b', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center px-7 text-sm font-bold"
                >
                  {locale === 'ar' ? 'معاينة اللوحة' : 'Preview console'}
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
