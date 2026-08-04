'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Loader2, ArrowLeft, ArrowRight, AlertTriangle, Zap, Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { easeCrystal } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';

export default function DemoContent() {
  const t = useTranslations('demo');
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
    router.push(localePath('/', locale));
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    goHome();
  };

  const BackIcon = locale === 'ar' ? ArrowRight : ArrowLeft;

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
        <motion.div
          className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-cyan-400/15 blur-[120px] will-change-transform"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Top bar: brand logo (Home) + Back */}
      <header className="relative z-20 px-4 pt-4 md:px-6">
        <div className="glass mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 rounded-2xl px-3 sm:px-4">
          <Link
            href={localePath('/', locale)}
            className="group inline-flex min-w-0 items-center gap-2.5 rounded-xl py-1 pe-2 transition hover:bg-white/[0.04]"
            aria-label={t('home')}
          >
            <Image
              src="/images/logos/v2-balanced-a-T.webp"
              alt="Muqabaleh"
              width={160}
              height={44}
              className="h-10 w-auto sm:h-11"
              priority
            />
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)]">
              <Home size={12} className="text-[var(--aurora-2)]" />
              {t('home')}
            </span>
          </Link>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-white/25 hover:bg-white/[0.1]"
          >
            <BackIcon size={16} strokeWidth={2} />
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
            <motion.div
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--aurora-2)]/15 ring-1 ring-white/10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: easeCrystal }}
            >
              <span className="text-lg font-bold gradient-text">AI</span>
            </motion.div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">{t('subtitle')}</p>
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
              href={localePath('/', locale)}
              className="glass flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:border-white/20 hover:text-[var(--text-primary)]"
            >
              <Home size={16} />
              {t('home')}
            </Link>
            <Link
              href={localePath('/pricing', locale)}
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
