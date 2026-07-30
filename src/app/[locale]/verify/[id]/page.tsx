'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertCircle, Clock, Search } from 'lucide-react';
import { GlowCard, VerifiedBadge } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

type VerifyResult = 'idle' | 'valid' | 'expired' | 'notFound';

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('verify');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<VerifyResult>('idle');

  // Pre-fill from URL param
  useEffect(() => {
    params.then(({ id }) => {
      if (id) setInputValue(id);
    });
  }, [params]);

  const handleVerify = () => {
    const id = inputValue.trim();

    if (id === 'MQBL-DEMO-2026') {
      setResult('valid');
    } else if (id === 'MQBL-EXPIRED-2024') {
      setResult('expired');
    } else {
      setResult('notFound');
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="py-24">
          <div className="mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold md:text-4xl">
                <span className="gold-gradient-text">{t('title')}</span>
              </h1>
              <p className="mt-4 text-[var(--text-muted)]">{t('sub')}</p>
            </div>

            {/* Input Card */}
            <GlowCard className="mt-10 p-6" style={{ transform: 'none' }}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t('inputPlaceholder')}
                  className="glass-input flex-1 px-4 py-3 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
                <button
                  onClick={handleVerify}
                  className="btn-gold flex items-center gap-2 px-6 py-3 text-sm"
                >
                  <Search size={16} strokeWidth={1.75} />
                  {t('verifyBtn')}
                </button>
              </div>
            </GlowCard>

            {/* Results */}
            {result === 'valid' && (
              <GlowCard className="mt-6 border-cyan/30 p-6" style={{ transform: 'none' }}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <VerifiedBadge size="lg" />
                  <p className="text-lg font-bold text-emerald">{t('valid')}</p>
                  <div className="w-full border-t border-white/5 pt-4 text-start">
                    <InfoRow label={t('name')} value={t('demoName')} />
                    <InfoRow label={t('score')} value={t('demoScore')} />
                    <InfoRow label={t('issuedAt')} value={t('demoDate')} />
                  </div>
                </div>
              </GlowCard>
            )}

            {result === 'expired' && (
              <GlowCard className="mt-6 border-[var(--status-amber)]/30 p-6" style={{ transform: 'none' }}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-amber)]/10">
                    <Clock size={24} strokeWidth={1.75} className="text-[var(--status-amber)]" />
                  </div>
                  <p className="text-lg font-bold text-[var(--status-amber)]">{t('expired')}</p>
                </div>
              </GlowCard>
            )}

            {result === 'notFound' && (
              <GlowCard className="mt-6 border-[var(--status-red)]/30 p-6" style={{ transform: 'none' }}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-red)]/10">
                    <AlertCircle size={24} strokeWidth={1.75} className="text-[var(--status-red)]" />
                  </div>
                  <p className="text-lg font-bold text-[var(--status-red)]">{t('notFound')}</p>
                </div>
              </GlowCard>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-[var(--text-muted)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}
