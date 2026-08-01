'use client';

import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Check, X, Zap, Crown, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard, PriceTag } from '@/components/brand';
import {
  PayPalSubscriptionButton,
  UpgradeCta,
} from '@/components/PayPalSubscriptionButton';

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
] as const;

export default function PackagesPage() {
  const t = useTranslations('app.packages');
  const tLanding = useTranslations('landing');
  const { data: session } = useSession();

  const isPremium =
    (session?.user as Record<string, unknown> | undefined)?.subscriptionTier ===
    'PREMIUM';

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('title')}
      </h1>

      {/* Premium subscription CTA — always on top */}
      <GlowCard className="relative overflow-hidden p-6 border-gold/30 shadow-[var(--ring-gold)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold/10">
              <Crown size={28} className="text-gold" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {tLanding('premiumTitle')}
                </h2>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-bold text-emerald">
                    <Check size={12} />
                    {t('active')}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                {tLanding('premiumDesc')}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-faint)]">
                <span className="flex items-center gap-1">
                  <Zap size={12} className="text-gold" />
                  {tLanding('premiumF1')}
                </span>
                <span className="flex items-center gap-1">
                  <Check size={12} className="text-gold" />
                  {tLanding('premiumF2')}
                </span>
                <span className="flex items-center gap-1">
                  <Check size={12} className="text-gold" />
                  {tLanding('premiumF3')}
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 w-full md:w-72">
            {isPremium ? (
              <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald/20 bg-emerald/5 px-5 py-3 text-sm font-bold text-emerald">
                <Crown size={18} />
                {t('premiumActive')}
              </div>
            ) : (
              <PayPalSubscriptionButton />
            )}
          </div>
        </div>
      </GlowCard>

      {/* Session balance */}
      <GlowCard className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <CreditCard size={24} strokeWidth={1.75} className="text-gold" />
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {isPremium
                ? t('unlimitedSessions')
                : t('sessionBalance', { count: 1 })}
            </span>
            <p className="text-xs text-[var(--text-faint)]">
              {isPremium ? t('premiumLabel') : t('freeLabel')}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* One-time session packages (legacy) */}
      {!isPremium && (
        <>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {t('oneTimeTitle')}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                <PriceTag
                  usd={tLanding(pkg.priceKey)}
                  className="mb-6"
                />
                <ul className="mb-6 w-full space-y-3 text-start">
                  {pkg.features.map((fKey) => (
                    <li
                      key={fKey}
                      className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                    >
                      <Check
                        size={16}
                        strokeWidth={1.75}
                        className="shrink-0 text-emerald"
                      />
                      {tLanding(fKey)}
                    </li>
                  ))}
                  {pkg.exclude.map((fKey) => (
                    <li
                      key={fKey}
                      className="flex items-center gap-2 text-sm text-[var(--text-faint)]"
                    >
                      <X size={16} strokeWidth={1.75} className="shrink-0" />
                      {tLanding(fKey)}
                    </li>
                  ))}
                </ul>
                <Button
                  disabled
                  className="w-full border border-white/10 bg-white/5 text-[var(--text-faint)] cursor-not-allowed"
                >
                  {t('comingSoon')}
                </Button>
              </GlowCard>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
