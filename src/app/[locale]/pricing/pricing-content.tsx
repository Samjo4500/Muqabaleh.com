'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard, SectionHeading } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRICING_PLANS = [
  {
    titleKey: 'freeTitle' as const,
    priceKey: 'freePrice' as const,
    badge: null,
    subKey: 'freeSub' as const,
    features: ['freeFeature', 'freeCriteria', 'feature10Questions', 'featureNoCertificate'] as const,
    popular: false,
    link: '/demo',
    linkLabel: 'startFreeTrial' as const,
  },
  {
    titleKey: 'proTitle' as const,
    priceKey: 'proPrice' as const,
    badge: 'proBadge' as const,
    subKey: 'proSub' as const,
    features: ['proFeature', 'proCriteria', 'featureCertificate', 'featurePdf', 'featureLinkedin'] as const,
    popular: true,
    link: '/app/packages?checkout=pro',
    linkLabel: 'choosePlan' as const,
  },
  {
    titleKey: 'unlimitedTitle' as const,
    priceKey: 'unlimitedPrice' as const,
    badge: null,
    subKey: 'unlimitedSub' as const,
    features: ['unlimitedFeature', 'unlimitedCriteria', 'featureCertificate', 'featurePdf', 'featureLinkedin', 'featurePrioritySupport'] as const,
    popular: false,
    link: '/app/packages?checkout=unlimited',
    linkLabel: 'choosePlan' as const,
  },
] as const;

/* Comparison table rows */
const COMPARISON_ROWS: { rowKey: string; cells: ('included' | 'notIncluded')[] }[] = [
  { rowKey: 'rowSessionCount', cells: ['included', 'included', 'included'] },
  { rowKey: 'rowCriteria', cells: ['included', 'included', 'included'] },
  { rowKey: 'rowCertificate', cells: ['notIncluded', 'included', 'included'] },
  { rowKey: 'rowPdf', cells: ['notIncluded', 'included', 'included'] },
  { rowKey: 'rowLinkedin', cells: ['notIncluded', 'included', 'included'] },
  { rowKey: 'rowHumanReview', cells: ['notIncluded', 'notIncluded', 'notIncluded'] },
];

const COLUMN_KEYS = ['colFree', 'colPro', 'colUnlimited'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingContent() {
  const t = useTranslations('landing');
  const tp = useTranslations('pricing');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* ── Pricing Cards ── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('pricingTitle')}
              title={t('pricingTitle')}
              titleHighlight={t('pricingTitle')}
              sub={t('pricingSub')}
            />

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
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
                  {plan.subKey && (
                    <p className="mt-1 text-xs text-[var(--text-faint)]">{t(plan.subKey)}</p>
                  )}

                  <div className="my-5 text-3xl font-extrabold text-gold">
                    {t(plan.priceKey)}
                  </div>

                  <ul className="mb-6 flex w-full flex-col gap-3">
                    {plan.features.map((fk) => (
                      <PricingCheck key={fk} text={t(fk)} />
                    ))}
                  </ul>

                  <Link href={`/${locale}${plan.link}`} className="btn-gold w-full text-center text-sm">
                    {t(plan.linkLabel)}
                  </Link>
                </GlowCard>
              ))}
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Table ── */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={tp('comparisonTitle')}
              title={tp('comparisonTitle')}
              titleHighlight={tp('comparisonTitle')}
            />

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="py-3 pe-4 text-start font-semibold text-[var(--text-muted)]">
                      {tp('sessions')}
                    </th>
                    {COLUMN_KEYS.map((ck) => (
                      <th key={ck} className="px-4 py-3 text-center font-semibold text-[var(--text-primary)]">
                        {tp(ck)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row.rowKey} className="border-b border-white/5">
                      <td className="py-3 pe-4 text-start text-[var(--text-muted)]">
                        {tp(row.rowKey)}
                      </td>
                      {row.cells.map((cell, ci) => (
                        <td key={ci} className="px-4 py-3 text-center">
                          <CellValueCell value={cell} t={tp} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function PricingCheck({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
      <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
      {text}
    </li>
  );
}

function CellValueCell({ value, t }: { value: string; t: ReturnType<typeof useTranslations> }) {
  if (value === 'included') {
    return (
      <span className="inline-flex items-center justify-center text-emerald">
        <Check size={18} strokeWidth={1.75} />
      </span>
    );
  }
  if (value === 'notIncluded') {
    return (
      <span className="inline-flex items-center justify-center text-[var(--text-faint)]">
        <X size={18} strokeWidth={1.75} />
      </span>
    );
  }
  return (
    <span className="text-[var(--text-primary)] font-medium">
      {t(value as Parameters<typeof t>[0])}
    </span>
  );
}
