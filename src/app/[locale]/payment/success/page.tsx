'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage() {
  const t = useTranslations('paypal');
  const tCommon = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-void px-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald/10">
        <CheckCircle2 size={48} className="text-emerald" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('successTitle')}
      </h1>
      <p className="max-w-md text-center text-[var(--text-muted)]">
        {t('successDesc')}
      </p>

      <Link href="/app">
        <Button className="btn-gold mt-2 cursor-pointer gap-2">
          {t('goToDashboard')}
          <ArrowRight size={16} />
        </Button>
      </Link>
    </div>
  );
}
