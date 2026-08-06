'use client';

import { useLocale, useTranslations } from 'next-intl';
import { XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { localePath } from '@/i18n/navigation';

export default function PaymentCancelPage() {
  const t = useTranslations('paypal');
  const locale = useLocale();

  return (
    <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-hidden px-4">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/10">
        <XCircle size={48} className="text-rose-300" />
      </div>

      <h1 className="mq-display text-2xl font-bold text-white">
        {t('cancelTitle')}
      </h1>
      <p className="max-w-md text-center text-white/55">
        {t('cancelDesc')}
      </p>

      <div className="mt-2 flex gap-3">
        <Link href={localePath('/app/packages', locale)} className="mq-btn mq-btn-primary inline-flex items-center gap-2 px-5">
          {t('tryAgain')}
          <ArrowRight size={16} />
        </Link>
        <Link
          href={localePath('/', locale)}
          className="inline-flex items-center rounded-xl border border-white/15 px-5 py-2.5 text-sm text-white/60 hover:border-teal-300/40 hover:text-teal-200"
        >
          {t('goHome')}
        </Link>
      </div>
    </div>
  );
}
