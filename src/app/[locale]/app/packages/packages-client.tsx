'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Check, CreditCard, Zap, Infinity } from 'lucide-react';
import { GlowCard } from '@/components/brand';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';

export function PackagesClient({ isSandbox }: { isSandbox: boolean }) {
  const t = useTranslations('app.packages');
  const tLanding = useTranslations('landing');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-white/55">
          {isAr
            ? 'اشترِ باقات الجلسات عبر PayPal. تظهر عمليات الشراء المكتملة في الدفعات.'
            : 'Buy session packs via PayPal. Completed purchases appear under Payments.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isSandbox ? (
          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
            {tCommon('paymentMock')}
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
          {tCommon('currencyNote')}
        </span>
      </div>

      <GlowCard className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
            <CreditCard size={24} strokeWidth={1.75} />
          </div>
          <div>
            <span className="text-lg font-bold text-white">{t('currentPlan')}</span>
            <p className="text-xs text-white/45">{t('freeLabel')}</p>
          </div>
        </div>
      </GlowCard>

      <div className="grid gap-6 md:grid-cols-2">
        <GlowCard className="relative flex flex-col items-center border-teal-300/40 p-6 ring-1 ring-teal-300/20">
          <span className="absolute -top-3 rounded-full border border-teal-300/30 bg-teal-400/15 px-3 py-0.5 text-xs font-bold text-teal-200">
            {tLanding('proBadge')}
          </span>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
            <Zap size={20} strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-bold text-white">{tLanding('proTitle')}</h3>
          <p className="mb-1 text-xs text-white/45">{tLanding('proSub')}</p>
          <div className="my-4 text-3xl font-extrabold text-teal-200">{tLanding('proPrice')}</div>
          <ul className="mb-6 w-full space-y-3">
            {['proFeature', 'proCriteria', 'featureCertificate', 'featurePdf', 'featureLinkedin'].map(
              (k) => (
                <li key={k} className="flex items-center gap-2 text-sm text-white/60">
                  <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald-300" />
                  {tLanding(k)}
                </li>
              ),
            )}
          </ul>
          <PayPalCheckoutButton plan="pro" className="w-full" />
        </GlowCard>

        <GlowCard className="relative flex flex-col items-center p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
            <Infinity size={20} strokeWidth={1.75} />
          </div>
          <h3 className="text-lg font-bold text-white">{tLanding('unlimitedTitle')}</h3>
          <p className="mb-1 text-xs text-white/45">{tLanding('unlimitedSub')}</p>
          <div className="my-4 text-3xl font-extrabold text-teal-200">
            {tLanding('unlimitedPrice')}
          </div>
          <ul className="mb-6 w-full space-y-3">
            {[
              'unlimitedFeature',
              'unlimitedCriteria',
              'featureCertificate',
              'featurePdf',
              'featureLinkedin',
              'featurePrioritySupport',
            ].map((k) => (
              <li key={k} className="flex items-center gap-2 text-sm text-white/60">
                <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald-300" />
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
