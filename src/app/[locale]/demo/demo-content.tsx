'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Loader2, ArrowLeft, ArrowRight, AlertTriangle, Zap, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { easeCrystal } from '@/components/landing/crystal/motion';

export default function DemoContent() {
  const t = useTranslations('demo');
  const tLanding = useTranslations('landing');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<{ demoMode: boolean; services: Record<string, boolean> } | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((data: { demoMode?: boolean; services?: Record<string, boolean> }) => {
        setConfig({
          demoMode: Boolean(data?.demoMode),
          services: data?.services ?? {},
        });
      })
      .catch(() => setConfig({ demoMode: false, services: {} }));
  }, []);

  const goHome = () => {
    router.push('/');
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    goHome();
  };

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--aurora-1)]/35 blur-[100px] will-change-transform"
          animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[var(--aurora-2)]/30 blur-[110px] will-change-transform"
          animate={{ x: [0, -50, 20, 0], y: [0, -25, 35, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Top bar: Home logo + Back */}
      <header className="relative z-20 px-4 pt-4 md:px-6">
        <div className="glass mx-auto flex h-14 max-w-3xl items-center justify-between rounded-2xl px-4">
          <Link
            href="/"
            className="font-display inline-flex items-center gap-2 text-base font-bold tracking-[-0.02em] text-[var(--text-primary)] transition hover:text-white"
            aria-label={t('home')}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/15">
              <Home size={16} className="text-[var(--aurora-2)]" />
            </span>
            {tLanding('brand')}
          </Link>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:border-white/20 hover:text-[var(--text-primary)] cursor-pointer"
          >
            {locale === 'ar' ? <ArrowRight size={16} strokeWidth={1.75} /> : <ArrowLeft size={16} strokeWidth={1.75} />}
            {t('back')}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: easeCrystal }}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15">
              <span className="text-lg font-bold gradient-text">AI</span>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{t('subtitle')}</p>
          </div>

          <div className="glass-strong rounded-3xl p-6 md:p-8">
            {config && (
              <div className="relative z-10 mb-4 space-y-2">
                {config.demoMode && (
                  <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
                    <Zap size={14} />
                    {t('demoMode')}
                  </div>
                )}
                {(!config.services?.database || !config.services?.gemini) && !config.demoMode && (
                  <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-[var(--text-muted)]">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-400" />
                    <span>{t('servicesUnavailable')}</span>
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={startDemo}
              disabled={loading}
              className="glass-button relative z-10 w-full cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center">
                  <Loader2 size={16} className="me-2 animate-spin" />
                  {t('starting')}
                </span>
              ) : (
                t('start')
              )}
            </button>

            <p className="relative z-10 mt-4 text-center text-xs text-[var(--text-muted)]">{t('note')}</p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/"
              className="glass flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:border-white/20 hover:text-[var(--text-primary)]"
            >
              <Home size={16} />
              {t('home')}
            </Link>
            <Link
              href="/pricing"
              className="glass flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-[var(--text-muted)] transition hover:border-white/20 hover:text-[var(--text-primary)]"
            >
              {t('pricingLink')}
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
