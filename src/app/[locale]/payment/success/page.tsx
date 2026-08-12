'use client';

import { useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { localePath } from '@/i18n/navigation';
import { trackGaEvent } from '@/lib/analytics-ga';

export default function PaymentSuccessPage() {
  const t = useTranslations('paypal');
  const locale = useLocale();

  useEffect(() => {
    trackGaEvent('payment_completed', { source: 'paypal_success_page' });
  }, []);

  return (
    <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
        <CheckCircle2 size={48} className="text-emerald-300" />
      </div>

      <h1 className="mq-display text-2xl font-bold text-white">{t('successTitle')}</h1>
      <p className="max-w-md text-center text-white/55">{t('successDesc')}</p>

      <Link
        href={localePath('/app?upgraded=true', locale)}
        className="mq-btn mq-btn-primary mt-2 inline-flex min-h-12 items-center gap-2 px-5"
      >
        {t('goToDashboard')}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
