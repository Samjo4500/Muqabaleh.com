'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard, SectionHeading, PriceTag } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRICING_PLANS = [
  {
    titleKey: 'session1Title' as const,
    priceKey: 'session1Price' as const,
    badge: null,
    subKey: null,
    featureKey: 'feature1Session' as const,
    criteriaKey: 'feature4Criteria' as const,
    sar: '71', aed: '70', egp: '912', jod: '13',
    popular: false,
    planSlug: '1-session',
  },
  {
    titleKey: 'session3Title' as const,
    priceKey: 'session3Price' as const,
    badge: 'session3Badge' as const,
    subKey: null,
    featureKey: 'feature3Sessions' as const,
    criteriaKey: 'feature4Criteria' as const,
    sar: '183', aed: '180', egp: '2352', jod: '35',
    popular: true,
    planSlug: '3-sessions',
  },
  {
    titleKey: 'session5Title' as const,
    priceKey: 'session5Price' as const,
    badge: null,
    subKey: null,
    featureKey: 'feature5Sessions' as const,
    criteriaKey: 'feature4Criteria' as const,
    sar: '258', aed: '253', egp: '3312', jod: '49',
    popular: false,
    planSlug: '5-sessions',
  },
  {
    titleKey: 'vipTitle' as const,
    priceKey: 'vipPrice' as const,
    badge: null,
    subKey: 'vipSub' as const,
    featureKey: 'featureVipSession' as const,
    criteriaKey: 'feature6CriteriaHuman' as const,
    sar: '108', aed: '106', egp: '1392', jod: '21',
    popular: false,
    planSlug: 'vip',
  },
] as const;

/* Comparison table rows: rowKey, then values for [1 Session, 3 Sessions, 5 Sessions, VIP] */
type CellValue = 'val' | 'text';

const COMPARISON_ROWS: { rowKey: string; cells: ('val1' | 'val3' | 'val5' | 'val1Vip' | 'val4' | 'val6' | 'included' | 'notIncluded')[] }[] = [
  { rowKey: 'rowSessionCount', cells: ['val1', 'val3', 'val5', 'val1Vip'] },
  { rowKey: 'rowCriteria', cells: ['val4', 'val4', 'val4', 'val6'] },
  { rowKey: 'rowCertificate', cells: ['included', 'included', 'included', 'included'] },
  { rowKey: 'rowHumanReview', cells: ['notIncluded', 'notIncluded', 'notIncluded', 'included'] },
  { rowKey: 'rowPdf', cells: ['included', 'included', 'included', 'included'] },
  { rowKey: 'rowLinkedin', cells: ['included', 'included', 'included', 'included'] },
];

const COLUMN_KEYS = ['colSession', 'col3Session', 'col5Session', 'colVip'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
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

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

                  <PriceTag
                    usd={t(plan.priceKey)}
                    localApprox={t('localApprox', {
                      sar: plan.sar,
                      aed: plan.aed,
                      egp: plan.egp,
                      jod: plan.jod,
                    })}
                    className="my-5"
                  />

                  <ul className="mb-6 flex w-full flex-col gap-3">
                    <PricingCheck text={t(plan.featureKey)} />
                    <PricingCheck text={t(plan.criteriaKey)} />
                    <PricingCheck text={t('featureCertificate')} />
                    <PricingCheck text={t('featurePdf')} />
                    <PricingCheck text={t('featureLinkedin')} />
                  </ul>

                  <Link href={`/auth/register?plan=${plan.planSlug}`} className="btn-gold w-full text-center text-sm">
                    {t('choosePlan')}
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
