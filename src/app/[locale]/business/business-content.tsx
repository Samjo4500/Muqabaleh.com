'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Users, ListChecks, FileDown, LayoutDashboard, UserCheck, Lock, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard, SectionHeading, CountUpStat, PriceTag } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BusinessContent() {
  const t = useTranslations('business');
  const tc = useTranslations('common');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* ── 1. Hero ── */}
        <section className="aurora-bg relative overflow-hidden py-24 md:py-32">
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="eyebrow">{t('heroEyebrow')}</p>
            <h1 className="mt-4 text-4xl font-extrabold md:text-6xl">
              <span className="gold-gradient-text">{t('heroH1')}</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--text-muted)]">
              {t('heroSub')}
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/demo" className="btn-gold">
                {t('ctaTitle')}
              </Link>
              <Link href="#how" className="btn-ghost">
                {t('heroCta2')}
              </Link>
            </div>
          </div>
        </section>

        {/* ── 2. Stats ── */}
        <section className="border-y border-white/5 py-16">
          <div className="mx-auto grid max-w-3xl grid-cols-2 gap-8 px-4 sm:px-6 lg:px-8">
            <CountUpStat value={t('statsTime')} label={t('statsTime')} />
            <CountUpStat value={t('statsDuration')} label={t('statsDuration')} />
          </div>
        </section>

        {/* ── 3. How It Works ── */}
        <section id="how" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('howTitle')}
              title={t('howTitle')}
              titleHighlight={t('howTitle')}
            />
            <div className="relative mx-auto mt-16 max-w-2xl">
              <div className={`absolute top-0 bottom-0 w-px bg-gradient-to-b from-gold/40 via-gold/10 to-transparent ${isRTL ? 'start-6 md:start-8' : 'start-6 md:start-8'}`} />
              {([1, 2, 3] as const).map((step) => (
                <div key={step} className="relative mb-12 flex gap-6 last:mb-0 md:gap-8">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold bg-void text-base font-bold text-gold md:h-16 md:w-16 md:text-lg">
                    {step}
                  </div>
                  <div className="pt-1 md:pt-3">
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {t(`howStep${step}Title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                      {t(`howStep${step}Desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. Features ── */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('featuresTitle')}
              title={t('featuresTitle')}
              titleHighlight={t('featuresTitle')}
              sub={t('featuresSub')}
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {([1, 2, 3, 4, 5, 6] as const).map((i) => {
                const Icon = FEATURE_ICONS[i - 1];
                return (
                  <GlowCard key={i} className="flex flex-col gap-4 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
                      <Icon size={20} strokeWidth={1.75} className="text-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      {t(`f${i}Title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                      {t(`f${i}Desc`)}
                    </p>
                  </GlowCard>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. Pricing ── */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('pricingTitle')}
              title={t('pricingTitle')}
              titleHighlight={t('pricingTitle')}
              sub={t('pricingSub')}
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PRICING_PLANS.map((plan, idx) => (
                <GlowCard
                  key={idx}
                  className={`relative flex flex-col items-center p-6 ${plan.popular ? 'border-gold/50 ring-1 ring-gold/30' : ''}`}
                >
                  {plan.badge && (
                    <Badge className="absolute -top-3 bg-gold text-void hover:bg-gold-hover">
                      {t(plan.badge)}
                    </Badge>
                  )}
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {t(plan.titleKey)}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">{t(plan.descKey)}</p>
                  <PriceTag
                    usd={`${t(plan.priceKey)}${plan.unitKey ? t(plan.unitKey) : ''}`}
                    className="my-5"
                  />
                  <ul className="mb-6 flex w-full flex-col gap-3">
                    {plan.features.map((fk) => (
                      <li key={fk} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
                        {t(fk)}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="btn-gold w-full text-center text-sm">
                    {t(plan.ctaKey)}
                  </Link>
                </GlowCard>
              ))}
            </div>

            {/* Human Service Card */}
            <div className="mx-auto mt-10 max-w-md">
              <GlowCard id="human" className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan/10">
                    <UserCheck size={24} strokeWidth={1.75} className="text-cyan" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">
                    {t('humanServiceTitle')}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-cyan">
                    {t('humanServicePrice')}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                    {t('humanServiceDesc')}
                  </p>
                </div>
              </GlowCard>
            </div>
          </div>
        </section>

        {/* ── 6. Final CTA ── */}
        <section className="aurora-bg relative overflow-hidden py-24">
          <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold md:text-5xl">
              <span className="gold-gradient-text">{t('ctaTitle')}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--text-muted)]">
              {t('ctaSub')}
            </p>
            <Link href="/demo" className="btn-gold mt-8 inline-block">
              {t('ctaTitle')}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
