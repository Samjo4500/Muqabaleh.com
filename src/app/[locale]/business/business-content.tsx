'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Users, ListChecks, FileDown, LayoutDashboard, UserCheck, Lock, Check } from 'lucide-react';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';

const FEATURE_ICONS = [Users, ListChecks, FileDown, LayoutDashboard, UserCheck, Lock] as const;

const PRICING_PLANS = [
  {
    titleKey: 'starterTitle' as const,
    priceKey: 'starterPrice' as const,
    unitKey: 'starterUnit' as const,
    descKey: 'starterDesc' as const,
    badge: null,
    features: ['starterF1', 'starterF2', 'starterF3'] as const,
    ctaKey: 'chooseStarter' as const,
    href: '/demo',
  },
  {
    titleKey: 'businessTitle' as const,
    priceKey: 'businessPrice' as const,
    unitKey: 'businessUnit' as const,
    descKey: 'businessDesc' as const,
    badge: 'businessBadge' as const,
    features: ['businessF1', 'businessF2', 'businessF3', 'businessF4', 'businessF5', 'businessF6'] as const,
    ctaKey: 'chooseBusiness' as const,
    href: '/demo',
    popular: true,
  },
  {
    titleKey: 'enterpriseTitle' as const,
    priceKey: 'enterprisePrice' as const,
    unitKey: '' as const,
    descKey: 'enterpriseDesc' as const,
    badge: null,
    features: ['enterpriseF1', 'enterpriseF2', 'enterpriseF3', 'enterpriseF4', 'enterpriseF5', 'enterpriseF6'] as const,
    ctaKey: 'chooseEnterprise' as const,
    href: '/support',
  },
];

function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--aurora-1)]/35 blur-[100px] will-change-transform"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[var(--aurora-2)]/30 blur-[110px] will-change-transform"
        animate={{ x: [0, -50, 20, 0], y: [0, -25, 35, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[var(--aurora-3)]/25 blur-[100px] will-change-transform"
        animate={{ x: [0, 30, -40, 0], y: [0, -40, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default function BusinessContent() {
  const t = useTranslations('business');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <CrystalNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-16 pt-32 md:px-8 md:pb-24">
          <Aurora />
          <motion.div
            className="glass-strong relative z-10 mx-auto max-w-4xl rounded-3xl px-6 py-12 text-center md:px-12 md:py-16"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: easeCrystal }}
          >
            <p className="relative z-10 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-muted)]">
              {t('heroEyebrow')}
            </p>
            <h1 className="font-display relative z-10 mt-4 text-[40px] font-bold leading-tight tracking-[-0.02em] md:text-6xl">
              <span className="gradient-text">{t('heroH1')}</span>
            </h1>
            <p className="relative z-10 mx-auto mt-6 max-w-2xl text-lg leading-7 text-[var(--text-secondary)]">
              {t('heroSub')}
            </p>
            <div className="relative z-10 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href={localePath('/demo', locale)} className="glass-button inline-flex justify-center">
                {t('ctaTitle')}
              </Link>
              <Link href="#how" className="btn-ghost-crystal inline-flex justify-center">
                {t('heroCta2')}
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="border-y border-white/5 py-14">
          <div className="content-wrap grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {[t('statsTime'), t('statsDuration')].map((label, i) => (
              <motion.div
                key={label}
                className="glass rounded-2xl p-6 text-center"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45, ease: easeCrystal }}
              >
                <p className="text-2xl font-bold gradient-text md:text-3xl">{label.split(' ')[0]}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="section-pad">
          <div className="content-wrap">
            <motion.div
              className="mx-auto mb-12 max-w-2xl text-center"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.h2 variants={fadeUp} className="font-display text-[32px] font-bold tracking-[-0.02em] md:text-4xl">
                {t('howTitle')}
              </motion.h2>
            </motion.div>
            <div className="relative mx-auto max-w-2xl">
              <div
                className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-indigo-400/50 via-cyan-400/20 to-transparent ${isRTL ? 'start-6 md:start-8' : 'start-6 md:start-8'}`}
              />
              {([1, 2, 3] as const).map((step, i) => (
                <motion.div
                  key={step}
                  className="relative mb-12 flex gap-6 last:mb-0 md:gap-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.45, ease: easeCrystal }}
                >
                  <div className="glass relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold gradient-text shadow-[0_0_24px_rgba(99,102,241,0.35)] md:h-16 md:w-16 md:text-lg">
                    {step}
                  </div>
                  <div className="glass flex-1 rounded-2xl p-5 pt-3 md:p-6 md:pt-4">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {t(`howStep${step}Title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                      {t(`howStep${step}Desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section-pad">
          <div className="content-wrap">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-display text-[32px] font-bold tracking-[-0.02em] md:text-4xl">
                {t('featuresTitle')}
              </h2>
              <p className="mt-3 text-lg text-[var(--text-secondary)]">{t('featuresSub')}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {([1, 2, 3, 4, 5, 6] as const).map((i) => {
                const Icon = FEATURE_ICONS[i - 1];
                return (
                  <motion.article
                    key={i}
                    className="glass flex flex-col gap-4 rounded-2xl p-8 transition duration-200 hover:-translate-y-1 hover:border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (i - 1) * 0.06, duration: 0.4, ease: easeCrystal }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15">
                      <Icon size={20} strokeWidth={1.75} className="text-[var(--aurora-2)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {t(`f${i}Title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      {t(`f${i}Desc`)}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="section-pad">
          <div className="content-wrap">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-display text-[32px] font-bold tracking-[-0.02em] md:text-4xl">
                {t('pricingTitle')}
              </h2>
              <p className="mt-3 text-lg text-[var(--text-secondary)]">{t('pricingSub')}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {PRICING_PLANS.map((plan, idx) => (
                <motion.article
                  key={plan.titleKey}
                  className={`relative flex flex-col items-center rounded-2xl border border-[var(--border-bright)] bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-xl transition duration-200 hover:-translate-y-2 hover:border-white/25 ${
                    plan.popular ? 'scale-[1.02] shadow-[0_0_40px_rgba(99,102,241,0.22)]' : ''
                  }`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.45, ease: easeCrystal }}
                >
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-px"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
                  />
                  {plan.badge && (
                    <span className="absolute -top-3 rounded-full border border-white/15 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
                      {t(plan.badge)}
                    </span>
                  )}
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t(plan.titleKey)}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{t(plan.descKey)}</p>
                  <div className="glass my-5 rounded-xl px-4 py-2">
                    <span className="text-3xl font-bold gradient-text">
                      {t(plan.priceKey)}
                      {plan.unitKey ? t(plan.unitKey) : ''}
                    </span>
                  </div>
                  <ul className="mb-6 flex w-full flex-col gap-3">
                    {plan.features.map((fk) => (
                      <li key={fk} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Check size={16} strokeWidth={1.75} className="shrink-0 text-[var(--aurora-2)]" />
                        {t(fk)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={localePath(plan.href, locale)}
                    className={`w-full text-center text-sm ${plan.popular ? 'glass-button' : 'btn-ghost-crystal'}`}
                  >
                    {t(plan.ctaKey)}
                  </Link>
                </motion.article>
              ))}
            </div>

            <motion.div
              id="human"
              className="glass mx-auto mt-10 max-w-md rounded-2xl p-8"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15">
                  <UserCheck size={24} strokeWidth={1.75} className="text-[var(--aurora-2)]" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                  {t('humanServiceTitle')}
                </h3>
                <p className="mt-1 text-sm font-semibold gradient-text">
                  {t('humanServicePrice')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {t('humanServiceDesc')}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-pad relative overflow-hidden">
          <Aurora />
          <motion.div
            className="glass-strong relative z-10 mx-auto max-w-3xl px-6 py-12 text-center md:px-12 md:py-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeCrystal }}
          >
            <h2 className="font-display relative z-10 text-3xl font-bold tracking-[-0.02em] md:text-5xl">
              <span className="gradient-text">{t('ctaTitle')}</span>
            </h2>
            <p className="relative z-10 mx-auto mt-6 max-w-xl text-lg text-[var(--text-secondary)]">
              {t('ctaSub')}
            </p>
            <Link href={localePath('/demo', locale)} className="glass-button relative z-10 mt-8 inline-flex">
              {t('ctaTitle')}
            </Link>
          </motion.div>
        </section>
      </main>
      <CrystalFooter />
    </div>
  );
}
