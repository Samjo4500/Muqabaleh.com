'use client';

import { useTranslations } from 'next-intl';
import { Check, X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard, PriceTag } from '@/components/brand';
import { toast } from 'sonner';

const packages = [
  {
    titleKey: 'session1Title',
    priceKey: 'session1Price',
    features: ['feature1Session', 'feature4Criteria', 'featureCertificate', 'featurePdf'],
    exclude: ['featureLinkedin'],
    popular: false,
  },
  {
    titleKey: 'session3Title',
    priceKey: 'session3Price',
    badgeKey: 'session3Badge',
    features: ['feature3Sessions', 'feature4Criteria', 'featureCertificate', 'featurePdf', 'featureLinkedin'],
    exclude: [],
    popular: true,
  },
  {
    titleKey: 'session5Title',
    priceKey: 'session5Price',
    features: ['feature5Sessions', 'feature4Criteria', 'featureCertificate', 'featurePdf', 'featureLinkedin'],
    exclude: [],
    popular: false,
  },
  {
    titleKey: 'vipTitle',
    priceKey: 'vipPrice',
    subKey: 'vipSub',
    features: ['featureVipSession', 'feature6CriteriaHuman', 'featureCertificate', 'featurePdf', 'featureLinkedin'],
    exclude: [],
    popular: false,
  },
] as const;

const balanceLog = [
  { dateKey: 'logD1', descKey: 'logDesc1', sessions: 3, change: '+' },
  { dateKey: 'logD2', descKey: 'logDesc2', sessions: 1, change: '-' },
  { dateKey: 'logD3', descKey: 'logDesc3', sessions: 1, change: '-' },
  { dateKey: 'logD4', descKey: 'logDesc4', sessions: 1, change: '+' },
  { dateKey: 'logD5', descKey: 'logDesc5', sessions: 5, change: '+' },
] as const;

export default function PackagesPage() {
  const t = useTranslations('app.packages');
  const tLanding = useTranslations('landing');
  const tCommon = useTranslations('common');

  const handleBuy = () => toast.info(tCommon('comingSoon'));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* Session balance */}
      <GlowCard className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <Zap size={24} strokeWidth={1.75} className="text-gold" />
          </div>
          <span className="text-lg font-bold text-[var(--text-primary)]">
            {t('sessionBalance', { count: 3 })}
          </span>
        </div>
      </GlowCard>

      {/* Pricing cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <GlowCard
            key={pkg.titleKey}
            className={`relative flex flex-col items-center p-6 text-center ${
              pkg.popular ? 'border-gold/30 shadow-[var(--ring-gold)]' : ''
            }`}
          >
            {pkg.popular && (
              <span className="absolute -top-3 start-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-gold/20 px-3 py-0.5 text-xs font-bold text-gold">
                {tLanding(pkg.badgeKey as string)}
              </span>
            )}
            <h3 className="mb-1 text-base font-bold text-[var(--text-primary)]">
              {tLanding(pkg.titleKey)}
            </h3>
            {'subKey' in pkg && (
              <p className="mb-3 text-xs text-[var(--text-faint)]">
                {tLanding(pkg.subKey)}
              </p>
            )}
            <PriceTag
              usd={tLanding(pkg.priceKey)}
              localApprox={tLanding('localApprox', { sar: '71', aed: '70', egp: '950', jod: '13.5' })}
              className="mb-6"
            />
            <ul className="mb-6 w-full space-y-3 text-start">
              {pkg.features.map((fKey) => (
                <li key={fKey} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
                  {tLanding(fKey)}
                </li>
              ))}
              {pkg.exclude.map((fKey) => (
                <li key={fKey} className="flex items-center gap-2 text-sm text-[var(--text-faint)]">
                  <X size={16} strokeWidth={1.75} className="shrink-0" />
                  {tLanding(fKey)}
                </li>
              ))}
            </ul>
            <Button
              onClick={handleBuy}
              className={`w-full cursor-pointer ${
                pkg.popular ? 'btn-gold' : 'border border-white/10 bg-white/5 hover:border-gold/30 hover:text-gold'
              }`}
            >
              {t('buy')}
            </Button>
          </GlowCard>
        ))}
      </div>

      {/* Balance log table */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">{t('balanceLog')}</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('date')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('description')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('sessions')}</th>
              </tr>
            </thead>
            <tbody>
              {balanceLog.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/[0.05] last:border-0 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 text-[var(--text-muted)]">{t(row.dateKey)}</td>
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{t(row.descKey)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-bold ${
                        row.change === '+' ? 'text-emerald' : 'text-red-400'
                      }`}
                    >
                      {row.change}{row.sessions}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
