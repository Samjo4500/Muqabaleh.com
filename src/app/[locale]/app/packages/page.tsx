'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Check, CreditCard, Zap, Infinity } from 'lucide-react';
import { GlowCard } from '@/components/brand';
import { PayPalCheckoutButton, PlanType } from '@/components/PayPalCheckoutButton';

export default function PackagesPage() {
  const t = useTranslations('app.packages');
  const tLanding = useTranslations('landing');
  const tPaypal = useTranslations('paypal');
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('title')}
      </h1>

      {/* Current plan indicator */}
      <GlowCard className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <CreditCard size={24} strokeWidth={1.75} className="text-gold" />
          </div>
          <div>
            <span className="text-lg font-bold text-[var(--text-primary)]">
              {t('currentPlan')}
            </span>
            <p className="text-xs text-[var(--text-faint)]">
              {t('freeLabel')}
            </p>
          </div>
        </div>
      </GlowCard>

      {/* Plans grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Pro Plan ── */}
        <GlowCard className="relative flex flex-col items-center p-6 border-gold/50 ring-1 ring-gold/30">
          <span className="absolute -top-3 rounded-full border border-gold/30 bg-gold/20 px-3 py-0.5 text-xs font-bold text-gold">
            {tLanding('proBadge')}
          </span>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10">
            <Zap size={20} strokeWidth={1.75} className="text-gold" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {tLanding('proTitle')}
          </h3>
          <p className="mb-1 text-xs text-[var(--text-faint)]">{tLanding('proSub')}</p>
          <div className="my-4 text-3xl font-extrabold text-gold">{tLanding('proPrice')}</div>
          <ul className="mb-6 w-full space-y-3">
            {['proFeature', 'proCriteria', 'featureCertificate', 'featurePdf', 'featureLinkedin'].map((k) => (
              <li key={k} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
                {tLanding(k)}
              </li>
            ))}
          </ul>
          <PayPalCheckoutButton plan="pro" className="w-full" />
        </GlowCard>

        {/* ── Unlimited Plan ── */}
        <GlowCard className="relative flex flex-col items-center p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald/10">
            <Infinity size={20} strokeWidth={1.75} className="text-emerald" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            {tLanding('unlimitedTitle')}
          </h3>
          <p className="mb-1 text-xs text-[var(--text-faint)]">{tLanding('unlimitedSub')}</p>
          <div className="my-4 text-3xl font-extrabold text-gold">{tLanding('unlimitedPrice')}</div>
          <ul className="mb-6 w-full space-y-3">
            {['unlimitedFeature', 'unlimitedCriteria', 'featureCertificate', 'featurePdf', 'featureLinkedin', 'featurePrioritySupport'].map((k) => (
              <li key={k} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald" />
                {tLanding(k)}
              </li>
            ))}
          </ul>
          <PayPalCheckoutButton plan="unlimited" className="w-full" />
        </GlowCard>
      </div>
    </div>
  );
}
