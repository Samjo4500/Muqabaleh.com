'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Check, X, Crown, Loader2 } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { localePath } from '@/i18n/navigation';

type TierKey = 'free' | 'pro' | 'unlimited';

const COMPARISON_FEATURES: {
  key:
    | 'featureInterviews'
    | 'featureReport'
    | 'featureBadge'
    | 'featureHumanDiscount'
    | 'featureHumanAccess'
    | 'featureDatabase';
  tiers: Record<TierKey, boolean>;
}[] = [
  { key: 'featureInterviews', tiers: { free: true, pro: true, unlimited: true } },
  { key: 'featureReport', tiers: { free: false, pro: true, unlimited: true } },
  { key: 'featureBadge', tiers: { free: false, pro: true, unlimited: true } },
  { key: 'featureHumanDiscount', tiers: { free: false, pro: false, unlimited: true } },
  { key: 'featureHumanAccess', tiers: { free: false, pro: false, unlimited: true } },
  { key: 'featureDatabase', tiers: { free: true, pro: true, unlimited: true } },
];

const TIER_KEYS: TierKey[] = ['free', 'pro', 'unlimited'];
const TIER_NAME_KEYS: Record<TierKey, 'freeName' | 'proName' | 'unlimitedName'> = {
  free: 'freeName',
  pro: 'proName',
  unlimited: 'unlimitedName',
};

export default function PricingContent() {
  const t = useTranslations('pricing');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <AtelierShell showHeroLogo>
      <section className="mq-section pb-8 pt-6">
        <div className="mq-wrap mx-auto max-w-3xl text-center">
          <p className="mq-kicker mb-3">Muqabaleh</p>
          <h1 className="mq-display text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-4 text-white/60 md:text-lg">{t('sub')}</p>
        </div>

        <div className="mq-wrap mt-12 grid gap-5 md:grid-cols-3">
          <PlanCard
            name={t('freeName')}
            price={t('freePrice')}
            features={[
              { text: t('freeSessions'), included: true },
              { text: t('freeReport'), included: false },
              { text: t('freePdf'), included: false },
              { text: t('freeBadge'), included: false },
            ]}
            cta={
              <Link href={localePath('/demo', locale)} className="mq-btn mq-btn-ghost mt-8 w-full text-center">
                {t('freeCta')}
              </Link>
            }
          />

          <PlanCard
            featured
            badge={
              <span className="absolute -top-3 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1 text-xs font-semibold text-amber-100">
                <Crown size={12} />
                {t('proPopular')}
              </span>
            }
            name={t('proName')}
            price={t('proPrice')}
            period={t('proPeriod')}
            features={[
              { text: t('proSessions'), included: true },
              { text: t('proReport'), included: true },
              { text: t('proPdf'), included: true },
              { text: t('proBadge'), included: true },
            ]}
            cta={<PayPalPlanButton plan="PRO" className="mt-8 w-full" label={t('proCta')} featured />}
          />

          <PlanCard
            name={t('unlimitedName')}
            price={t('unlimitedPrice')}
            period={t('unlimitedPeriod')}
            features={[
              { text: t('unlimitedSessions'), included: true },
              { text: t('unlimitedReport'), included: true },
              { text: t('unlimitedPdf'), included: true },
              { text: t('unlimitedBadge'), included: true },
              { text: t('unlimitedDiscount'), included: true },
              { text: t('unlimitedHuman'), included: true },
            ]}
            cta={<PayPalPlanButton plan="UNLIMITED" className="mt-8 w-full" label={t('unlimitedCta')} />}
          />
        </div>
      </section>

      <section className="mq-section border-t border-white/10">
        <div className="mq-wrap mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="mq-display text-3xl text-white md:text-4xl">{t('comparisonTitle')}</h2>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.03]">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className={`px-4 py-4 ${isRTL ? 'text-start' : 'text-start'} font-medium text-white/45`}>
                    &nbsp;
                  </th>
                  {TIER_KEYS.map((tk) => (
                    <th
                      key={tk}
                      className={`px-4 py-4 text-center font-semibold ${
                        tk === 'pro' ? 'text-amber-200' : 'text-white'
                      }`}
                    >
                      {t(TIER_NAME_KEYS[tk])}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((row) => (
                  <tr key={row.key} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3.5 text-white/55">{t(row.key)}</td>
                    {TIER_KEYS.map((tk) => (
                      <td key={tk} className="px-4 py-3.5 text-center">
                        {row.tiers[tk] ? (
                          <Check size={18} className="mx-auto text-teal-300" strokeWidth={1.75} />
                        ) : (
                          <X size={18} className="mx-auto text-white/25" strokeWidth={1.75} />
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
    </AtelierShell>
  );
}

function PlanCard({
  name,
  price,
  period,
  features,
  cta,
  featured,
  badge,
}: {
  name: string;
  price: string;
  period?: string;
  features: Array<{ text: string; included: boolean }>;
  cta: React.ReactNode;
  featured?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 backdrop-blur ${
        featured
          ? 'border-amber-300/40 bg-gradient-to-b from-amber-300/10 to-white/[0.03]'
          : 'border-white/10 bg-white/[0.03]'
      }`}
    >
      {badge}
      <h3 className="text-lg font-bold text-white">{name}</h3>
      <p className="mt-2 text-4xl font-extrabold text-white">
        {price}
        {period ? <span className="ms-1 text-base font-normal text-white/45">{period}</span> : null}
      </p>
      <ul className="mt-6 flex w-full flex-col gap-3">
        {features.map((f) => (
          <li
            key={f.text}
            className={`flex items-center gap-2 text-sm ${f.included ? 'text-white/70' : 'text-white/35'}`}
          >
            {f.included ? (
              <Check size={16} className="shrink-0 text-teal-300" strokeWidth={1.75} />
            ) : (
              <X size={16} className="shrink-0" strokeWidth={1.75} />
            )}
            {f.text}
          </li>
        ))}
      </ul>
      {cta}
    </div>
  );
}

function PayPalPlanButton({
  plan,
  className,
  label,
  featured = false,
}: {
  plan: string;
  className?: string;
  label: string;
  featured?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const t = useTranslations('paypal');

  const handleClick = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/paypal/create-order?plan=${plan}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || t('createError'));
        setLoading(false);
        return;
      }
      const baseUrl =
        process.env.PAYPAL_MODE === 'live'
          ? 'https://www.paypal.com'
          : 'https://www.sandbox.paypal.com';
      window.location.href = `${baseUrl}/checkoutnow?token=${data.orderId}`;
    } catch {
      setError(t('generalError'));
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      {error ? <p className="mb-2 text-center text-xs text-rose-300">{error}</p> : null}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 ${
          featured
            ? 'bg-teal-300 text-[var(--bg-deep)]'
            : 'border border-white/20 bg-white/5 text-white hover:border-teal-300/40'
        }`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {error ? t('retry') : label}
      </button>
    </div>
  );
}
