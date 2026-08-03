'use client';

import { useTranslations, useLocale } from 'next-intl';
import { XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const t = useTranslations('paypal');
  const locale = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-void px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10">
        <XCircle size={48} className="text-red-400" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('cancelTitle')}
      </h1>
      <p className="max-w-md text-center text-[var(--text-muted)]">
        {t('cancelDesc')}
      </p>

      <div className="flex gap-3 mt-2">
        <Link href={`/${locale}/app/packages`}>
          <Button className="btn-gold cursor-pointer gap-2">
            {t('tryAgain')}
            <ArrowRight size={16} />
          </Button>
        </Link>
        <Link href={`/${locale}`}>
          <Button
            variant="outline"
            className="cursor-pointer border-white/10 text-[var(--text-muted)] hover:border-white/20"
          >
            {t('goHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
