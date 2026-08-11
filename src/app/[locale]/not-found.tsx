'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { localePath } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('errors');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <AtelierShell>
      <main className="mq-wrap flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
        <p className="text-xs font-bold tracking-[0.2em] text-teal-300/80">404</p>
        <h1 className="mq-display mt-4 text-3xl font-extrabold text-white md:text-5xl">
          {t('404Title')}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/55">{t('404Sub')}</p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href={localePath('/', locale)}
            className="mq-btn mq-btn-primary inline-flex items-center gap-2"
          >
            {t('404Cta')}
            <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
          <p className="text-sm text-white/40">{t('404Alt')}</p>
          <Link
            href={localePath('/auth/register', locale)}
            className="mq-btn mq-btn-ghost text-sm"
          >
            {tc('startFree')}
          </Link>
        </div>
      </main>
    </AtelierShell>
  );
}
