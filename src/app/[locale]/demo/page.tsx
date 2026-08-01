'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const t = useTranslations('demo');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const startDemo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/guest/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: locale }),
      });

      if (!res.ok) {
        throw new Error('Failed to create demo interview');
      }

      const data = await res.json();
      router.push(`/interview/guest/${data.token}/room`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-4 py-12">
      <div className="aurora-bg pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)] cursor-pointer"
        >
          {locale === 'ar' ? <ArrowRight size={16} strokeWidth={1.75} /> : <ArrowLeft size={16} strokeWidth={1.75} />}
        </button>

        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10">
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M14 2L26 8v12l-12 6-12-6V8l12-6z"
                stroke="#D4A843"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M14 8l6 3v6l-6 3-6-3v-6l6-3z"
                fill="#D4A843"
                opacity="0.2"
              />
              <circle cx="14" cy="14" r="2" fill="#D4A843" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="mt-2 text-center text-sm text-[var(--text-muted)]">{t('subtitle')}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <Button
            onClick={startDemo}
            disabled={loading}
            className="btn-gold w-full cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="me-2 animate-spin" />
                {t('starting')}
              </>
            ) : (
              t('start')
            )}
          </Button>

          <p className="mt-4 text-center text-xs text-[var(--text-faint)]">{t('note')}</p>
        </div>
      </div>
    </div>
  );
}
