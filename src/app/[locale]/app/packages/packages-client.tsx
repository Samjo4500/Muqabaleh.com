'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Check, CreditCard, Sparkles, Crown } from 'lucide-react';
import { GlowCard } from '@/components/brand';
import { localePath } from '@/i18n/navigation';

export function PackagesClient({ isSandbox }: { isSandbox: boolean }) {
  const t = useTranslations('app.packages');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const plans = [
    {
      key: 'jeannie' as const,
      popular: true,
      icon: Sparkles,
      name: isAr ? 'جيني' : 'Jeannie',
      sub: isAr ? '١٠ تقديمات بموافقتك — بلا عشوائية' : '10 approve-gated applies — NOT SPAM',
      features: isAr
        ? [
            'تدريب ذكي بلا حدود مع جيني',
            'جواز موثّق كامل',
            'جيني تقدّم — ١٠ / شهر',
            'رفع السيرة وخطاب التقديم',
            'متتبّع الطلبات',
          ]
        : [
            'Unlimited practice with Jeannie',
            'Full verified passport',
            'Jeannie applies — 10 / month',
            'Upload CV + cover letter',
            'Application tracker',
          ],
      primaryHref: '/request-demo?from=packages-jeannie',
      primaryLabel: isAr ? 'اطلب عرضاً' : 'Request demo',
      secondaryHref: '/request-demo?from=packages-jeannie&intent=quote',
      secondaryLabel: isAr ? 'احصل على عرض سعر' : 'Get a quote',
    },
    {
      key: 'jeannie_pro' as const,
      popular: false,
      icon: Crown,
      name: isAr ? 'جيني برو' : 'Jeannie Pro',
      sub: isAr ? '٢٠ تقديماً + استوديو سيرة وخطاب' : '20 applies + CV studio & cover letter AI',
      features: isAr
        ? [
            'كل مزايا جيني',
            'جيني تقدّم — ٢٠ / شهر',
            'استوديو سيرة كامل',
            'توليد ومساعدة خطاب التقديم',
            'متتبّع كامل مع رؤى',
          ]
        : [
            'Everything in Jeannie',
            'Jeannie applies — 20 / month',
            'Full CV studio',
            'Cover letter generate + assist',
            'Full tracker + insights',
          ],
      primaryHref: '/request-demo?from=packages-pro&intent=quote',
      primaryLabel: isAr ? 'احصل على عرض سعر' : 'Get a quote',
      secondaryHref: '/request-demo?from=packages-pro',
      secondaryLabel: isAr ? 'اطلب عرضاً' : 'Request demo',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-white/55">
          {isAr
            ? 'الأسعار عند الطلب. اطلب عرضاً أو احصل على عرض سعر — كل تقديم يحتاج موافقتك.'
            : 'Pricing on request. Request a demo or get a quote — every apply needs your approval.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isSandbox ? (
          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
            {isAr ? 'بيئة تجريبية' : 'Sandbox'}
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1 text-xs font-bold text-teal-100">
          NOT SPAM
        </span>
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
          {isAr ? 'تسعير مخصّص' : 'Custom pricing'}
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
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <GlowCard
              key={plan.key}
              className={`relative flex flex-col items-center p-6 ${
                plan.popular ? 'border-teal-300/40 ring-1 ring-teal-300/20' : ''
              }`}
            >
              {plan.popular ? (
                <span className="absolute -top-3 rounded-full border border-teal-300/30 bg-teal-400/15 px-3 py-0.5 text-xs font-bold text-teal-200">
                  {isAr ? 'الأكثر طلباً' : 'Most popular'}
                </span>
              ) : null}
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                <Icon size={20} strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-bold text-white">{plan.name}</h3>
              <p className="mb-1 text-xs text-white/45">{plan.sub}</p>
              <div className="my-4 text-center">
                <p className="text-2xl font-extrabold text-teal-200">
                  {isAr ? 'تسعير مخصّص' : 'Custom pricing'}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {isAr ? 'أخبرنا بأهدافك وسنجهّز العرض' : 'Tell us your goals and we’ll tailor access'}
                </p>
              </div>
              <ul className="mb-6 w-full space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex w-full flex-col gap-2">
                <Link
                  href={localePath(plan.primaryHref, locale)}
                  className="mq-btn mq-btn-primary w-full justify-center text-sm"
                >
                  {plan.primaryLabel}
                </Link>
                <Link
                  href={localePath(plan.secondaryHref, locale)}
                  className="mq-btn mq-btn-ghost w-full justify-center text-sm"
                >
                  {plan.secondaryLabel}
                </Link>
              </div>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}
