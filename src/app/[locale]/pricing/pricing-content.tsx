'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, X, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlowCard, SectionHeading } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Comparison table configuration                                     */
/* ------------------------------------------------------------------ */

type TierKey = 'free' | 'pro' | 'unlimited';

const COMPARISON_FEATURES: {
  key: 'featureInterviews' | 'featureReport' | 'featureBadge' | 'featureHumanDiscount' | 'featureHumanAccess' | 'featureDatabase';
  tiers: Record<TierKey, boolean>;
}[] = [
  {
    key: 'featureInterviews',
    tiers: { free: true, pro: true, unlimited: true },
  },
  {
    key: 'featureReport',
    tiers: { free: false, pro: true, unlimited: true },
  },
  {
    key: 'featureBadge',
    tiers: { free: false, pro: true, unlimited: true },
  },
  {
    key: 'featureHumanDiscount',
    tiers: { free: false, pro: false, unlimited: true },
  },
  {
    key: 'featureHumanAccess',
    tiers: { free: false, pro: false, unlimited: true },
  },
  {
    key: 'featureDatabase',
    tiers: { free: true, pro: true, unlimited: true },
  },
];

const TIER_KEYS: TierKey[] = ['free', 'pro', 'unlimited'];
const TIER_NAME_KEYS: Record<TierKey, 'freeName' | 'proName' | 'unlimitedName'> = {
  free: 'freeName',
  pro: 'proName',
  unlimited: 'unlimitedName',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PricingContent() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-void)]">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* ── Pricing Cards ── */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Muqabaleh"
              title={t('title')}
              titleHighlight={isRTL ? '' : ''}
              sub={t('sub')}
            />

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* ── Free Card ── */}
              <GlowCard className="flex flex-col items-center p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {t('freeName')}
                </h3>
                <p className="mt-2 text-4xl font-extrabold text-[var(--text-primary)]">
                  {t('freePrice')}
                </p>

                <ul className="mt-6 flex w-full flex-col gap-3">
                  <FeatureCheck text={t('freeSessions')} />
                  <FeatureItem text={t('freeReport')} included={false} />
                  <FeatureItem text={t('freePdf')} included={false} />
                  <FeatureItem text={t('freeBadge')} included={false} />
                </ul>

                <Link href="/demo" className="mt-8 w-full">
                  <Button variant="outline" className="w-full border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10">
                    {t('freeCta')}
                  </Button>
                </Link>
              </GlowCard>

              {/* ── Pro Card (Popular) ── */}
              <GlowCard className="relative flex flex-col items-center border-[var(--gold)]/50 p-6 ring-1 ring-[var(--gold)]/30">
                <Badge className="absolute -top-3 bg-[var(--gold)] text-[var(--bg-void)] hover:bg-[var(--gold)]">
                  <Crown size={14} className="me-1.5" />
                  {t('proPopular')}
                </Badge>

                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {t('proName')}
                </h3>
                <p className="mt-2 text-4xl font-extrabold text-[var(--text-primary)]">
                  {t('proPrice')}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {t('proPeriod')}
                </p>

                <ul className="mt-6 flex w-full flex-col gap-3">
                  <FeatureCheck text={t('proSessions')} />
                  <FeatureCheck text={t('proReport')} />
                  <FeatureCheck text={t('proPdf')} />
                  <FeatureCheck text={t('proBadge')} />
                </ul>

                <Link href="/api/paypal/create-order?plan=PRO" className="mt-8 w-full">
                  <Button className="btn-gold w-full">
                    {t('proCta')}
                  </Button>
                </Link>
              </GlowCard>

              {/* ── Unlimited Card ── */}
              <GlowCard className="flex flex-col items-center p-6">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  {t('unlimitedName')}
                </h3>
                <p className="mt-2 text-4xl font-extrabold text-[var(--text-primary)]">
                  {t('unlimitedPrice')}
                  <span className="text-base font-normal text-[var(--text-muted)]">
                    {t('unlimitedPeriod')}
                  </span>
                </p>

                <ul className="mt-6 flex w-full flex-col gap-3">
                  <FeatureCheck text={t('unlimitedSessions')} />
                  <FeatureCheck text={t('unlimitedReport')} />
                  <FeatureCheck text={t('unlimitedPdf')} />
                  <FeatureCheck text={t('unlimitedBadge')} />
                  <FeatureCheck text={t('unlimitedDiscount')} />
                  <FeatureCheck text={t('unlimitedHuman')} />
                </ul>

                <Link href="/api/paypal/create-order?plan=UNLIMITED" className="mt-8 w-full">
                  <Button variant="outline" className="w-full border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)]/10">
                    {t('unlimitedCta')}
                  </Button>
                </Link>
              </GlowCard>
            </div>
          </div>
        </section>

        {/* ── Feature Comparison Table ── */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('comparisonTitle')}
              title={t('comparisonTitle')}
              titleHighlight={isRTL ? '' : ''}
            />

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className={`py-3 ${isRTL ? 'pe-4 text-start' : 'pe-4 text-start'} font-semibold text-[var(--text-muted)]`}>
                      &nbsp;
                    </th>
                    {TIER_KEYS.map((tk) => (
                      <th
                        key={tk}
                        className={`px-4 py-3 text-center font-semibold text-[var(--text-primary)] ${tk === 'pro' ? 'text-[var(--gold)]' : ''}`}
                      >
                        {t(TIER_NAME_KEYS[tk])}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((row) => (
                    <tr key={row.key} className="border-b border-white/5">
                      <td className={`py-3 ${isRTL ? 'pe-4 text-start' : 'pe-4 text-start'} text-[var(--text-muted)]`}>
                        {t(row.key)}
                      </td>
                      {TIER_KEYS.map((tk) => (
                        <td key={tk} className="px-4 py-3 text-center">
                          {row.tiers[tk] ? (
                            <span className="inline-flex items-center justify-center text-emerald">
                              <Check size={18} strokeWidth={1.75} />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center text-[var(--text-faint)]">
                              <X size={18} strokeWidth={1.75} />
                            </span>
                          )}
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

function FeatureCheck({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
      <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
      {text}
    </li>
  );
}

function FeatureItem({ text, included }: { text: string; included: boolean }) {
  return (
    <li className="flex items-center gap-2 text-sm text-[var(--text-faint)]">
      <X size={16} strokeWidth={1.75} className="shrink-0" />
      {text}
    </li>
  );
}
