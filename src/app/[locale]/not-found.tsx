'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export default function NotFound() {
  const t = useTranslations('errors');
  const tc = useTranslations('common');

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-16 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">
          <span className="gold-gradient-text">{t('404Title')}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[var(--text-muted)]">
          {t('404Sub')}
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link href="/" className="btn-gold flex items-center gap-2">
            {t('404Cta')}
            <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
          <p className="text-sm text-[var(--text-faint)]">{t('404Alt')}</p>
          <Link href="/auth/register" className="btn-gold text-sm">
            {tc('startFree')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
