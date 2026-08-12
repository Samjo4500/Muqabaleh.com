'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { trackGaEvent } from '@/lib/analytics-ga';

const PLANS = [
  {
    id: 'free',
    nameEn: 'Free',
    nameAr: 'مجاني',
    price: '$0',
    highlight: false,
    disabled: true,
    featuresEn: ['1 mock interview', 'Basic scorecard'],
    featuresAr: ['مقابلة تجريبية واحدة', 'بطاقة تقييم أساسية'],
  },
  {
    id: 'pro',
    nameEn: 'Pro',
    nameAr: 'Pro',
    price: 'Pro',
    highlight: true,
    disabled: false,
    featuresEn: ['More interviews / month', 'Passport by email', 'Priority coaching tips'],
    featuresAr: ['مقابلات أكثر شهرياً', 'جواز بالبريد', 'نصائح تدريب أولوية'],
  },
  {
    id: 'premium',
    nameEn: 'Premium',
    nameAr: 'Premium',
    price: 'Premium',
    highlight: true,
    disabled: false,
    featuresEn: ['Highest monthly quota', 'Passport + advanced reports', 'Best for serious candidates'],
    featuresAr: ['أعلى حصة شهرية', 'جواز + تقارير متقدمة', 'للمرشحين الجادين'],
  },
] as const;

type Props = {
  open: boolean;
  reason?: string | null;
};

export function FreeInterviewPaywall({ open, reason }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/12 bg-[#0B1220] p-5 shadow-2xl sm:p-8">
        <p className="text-sm font-medium text-teal-300/90">Muqabaleh</p>
        <h2 className="mq-display mt-2 text-2xl font-bold text-white sm:text-3xl">
          {isAr
            ? 'لقد استخدمت مقابلتك المجانية. اختر خطتك للمتابعة.'
            : "You've used your free interview. Choose a plan to continue."}
        </h2>
        {reason ? (
          <p className="mt-2 text-sm text-white/55">{reason}</p>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl border p-4 ${
                plan.disabled
                  ? 'border-white/8 bg-white/[0.02] opacity-55'
                  : plan.highlight
                    ? 'border-teal-400/40 bg-teal-400/10'
                    : 'border-white/12 bg-white/[0.03]'
              }`}
            >
              <p className="text-sm font-semibold text-white">
                {isAr ? plan.nameAr : plan.nameEn}
              </p>
              <p className="mt-1 text-lg text-teal-200">{plan.price}</p>
              <ul className="mt-3 space-y-1.5 text-xs text-white/65">
                {(isAr ? plan.featuresAr : plan.featuresEn).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={localePath('/#pricing', locale)}
            onClick={() => trackGaEvent('upgrade_clicked', { source: 'free_paywall' })}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl bg-teal-500 px-5 text-sm font-semibold text-[#041016] hover:bg-teal-400"
          >
            {isAr ? 'الترقية إلى Pro' : 'Upgrade to Pro'}
          </Link>
          <Link
            href={localePath('/app', locale)}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 text-sm text-white/80 hover:bg-white/5"
          >
            {isAr ? 'العودة للوحة التحكم' : 'Back to dashboard'}
          </Link>
        </div>
      </div>
    </div>
  );
}
