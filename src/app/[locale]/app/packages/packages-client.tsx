'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Check, CreditCard, Sparkles, Crown, Package } from 'lucide-react';
import { GlowCard } from '@/components/brand';
import { PayPalCheckoutButton, type PlanType } from '@/components/PayPalCheckoutButton';

export function PackagesClient({ isSandbox }: { isSandbox: boolean }) {
  const t = useTranslations('app.packages');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isAr = locale === 'ar';

  const plans: Array<{
    key: PlanType;
    popular: boolean;
    icon: typeof Sparkles;
    name: string;
    price: string;
    period: string;
    sub: string;
    features: string[];
  }> = [
    {
      key: 'jeannie',
      popular: true,
      icon: Sparkles,
      name: isAr ? 'جيني' : 'Jeannie',
      price: '$14.99',
      period: isAr ? '/شهر' : '/mo',
      sub: isAr
        ? 'مقابلات بلا حدود · جواز كامل · أدوات تحضير'
        : 'Unlimited mocks · full passport · prep tools',
      features: isAr
        ? [
            'مقابلات تجريبية بلا حدود',
            'جواز موثّق كامل',
            'متتبّع تقديمات يدوي',
            'مولّد خطاب التقديم',
            'مؤشرات الرواتب',
          ]
        : [
            'Unlimited mock interviews',
            'Full verified passport',
            'Manual application tracker',
            'Cover letter generator',
            'Salary benchmarks',
          ],
    },
    {
      key: 'jeannie_pro',
      popular: false,
      icon: Crown,
      name: isAr ? 'جيني برو' : 'Jeannie Pro',
      price: '$29.99',
      period: isAr ? '/شهر' : '/mo',
      sub: isAr
        ? 'استوديو سيرة · تفاوض · ترتيب أولوية'
        : 'CV studio · negotiation · priority ranking',
      features: isAr
        ? [
            'كل مزايا جيني',
            'استوديو سيرة كامل',
            'سكربتات تفاوض بالذكاء الاصطناعي',
            'ترتيب أولوية لدى أصحاب العمل',
            'شارة أعلى ١٠٪',
          ]
        : [
            'Everything in Jeannie',
            'Full CV studio',
            'AI negotiation scripts',
            'Priority employer ranking',
            '“Top 10%” badge',
          ],
    },
    {
      key: 'mastery_pack',
      popular: false,
      icon: Package,
      name: isAr ? 'باقة الإتقان' : 'Mastery Pack',
      price: '$44.99',
      period: isAr ? ' مرة واحدة' : ' once',
      sub: isAr
        ? '٥ مقابلات شركات + باقة تفاوض — بلا اشتراك'
        : '5 company mocks + negotiation pack — no subscription',
      features: isAr
        ? [
            '٥ مقابلات تجريبية خاصة بشركات',
            'باقة سكربتات التفاوض',
            'بلا اشتراك شهري',
            'تحتفظ بتدريب الأساسي المجاني',
          ]
        : [
            '5 company-specific mock interviews',
            'Negotiation script pack',
            'No monthly subscription',
            'Keep your free Basic practice',
          ],
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-white/55">
          {isAr
            ? 'فعّل التجهيز والتوثيق عبر PayPal. مقابلة لا تقدّم نيابةً عنك — أنت تقدّم على موقع الشركة.'
            : 'Unlock Prepare-and-Verify via PayPal. Muqabaleh never applies for you — you apply on the company site.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {isSandbox ? (
          <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-100">
            {tCommon('paymentMock')}
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1 text-xs font-bold text-teal-100">
          {isAr ? 'أنت تقدّم' : 'YOU APPLY'}
        </span>
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
        <div className="text-end">
          <p className="mq-display text-xl font-bold text-teal-200">FREE</p>
          <p className="text-[11px] text-white/40">{isAr ? 'الخطة الأساسية' : 'Basic plan'}</p>
        </div>
      </GlowCard>

      <div className="grid gap-6 md:grid-cols-3">
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
              <div className="my-4 text-3xl font-extrabold text-teal-200">
                {plan.price}
                <span className="text-sm font-medium text-white/45">{plan.period}</span>
              </div>
              <ul className="mb-6 w-full space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <Check size={16} strokeWidth={1.75} className="shrink-0 text-emerald-300" />
                    {f}
                  </li>
                ))}
              </ul>
              <PayPalCheckoutButton plan={plan.key} className="w-full" />
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}
