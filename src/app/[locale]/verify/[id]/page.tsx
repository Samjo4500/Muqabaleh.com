'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AlertCircle, Clock, Search, Loader2 } from 'lucide-react';
import { GlowCard, VerifiedBadge } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type VerifyResult = 'idle' | 'loading' | 'valid' | 'expired' | 'notFound' | 'error';

interface VerifyData {
  valid: boolean;
  reason?: 'not_found' | 'expired';
  name?: string;
  score?: number;
  level?: string;
  issuedAt?: string;
  expiresAt?: string;
  industry?: string;
  type?: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function VerifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations('verify');
  const locale = useLocale();
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<VerifyResult>('idle');
  const [data, setData] = useState<VerifyData | null>(null);

  // Pre-fill from URL param
  useEffect(() => {
    params.then(({ id }) => {
      if (id) {
        setInputValue(id);
      }
    });
  }, [params]);

  const handleVerify = async () => {
    const id = inputValue.trim();
    if (!id) return;

    setResult('loading');
    setData(null);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(id)}`);
      const json = await res.json();

      if (json.valid === true) {
        setResult('valid');
        setData(json);
      } else if (json.reason === 'expired') {
        setResult('expired');
        setData(json);
      } else {
        setResult('notFound');
      }
    } catch {
      setResult('error');
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
                  disabled={result === 'loading'}
                />
                <button
                  onClick={handleVerify}
                  disabled={result === 'loading' || !inputValue.trim()}
                  className="btn-gold flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {result === 'loading' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Search size={16} strokeWidth={1.75} />
                  )}
                  {t('verifyBtn')}
                </button>
              </div>
            </GlowCard>

            {/* Valid result */}
            {result === 'valid' && data && (
              <GlowCard className="mt-6 border-cyan/30 p-6" style={{ transform: 'none' }}>
                <div className="flex flex-col items-center gap-4 text-center">
                  <VerifiedBadge size="lg" />
                  <p className="text-lg font-bold text-emerald">{t('valid')}</p>
                  <div className="w-full border-t border-white/5 pt-4 text-start">
                    <InfoRow label={t('name')} value={data.name || '—'} />
                    <InfoRow
                      label={t('score')}
                      value={data.score != null ? `${data.score}/100` : '—'}
                    />
                    <InfoRow label={t('issuedAt')} value={formatDate(data.issuedAt)} />
                    <InfoRow label={t('expiresAt')} value={formatDate(data.expiresAt)} />
                    {data.industry && (
                      <InfoRow label={t('industry')} value={data.industry} />
                    )}
                    {data.type && (
                      <InfoRow label={t('type')} value={data.type} />
                    )}
                  </div>
                </div>
              </GlowCard>
            )}

            {/* Expired result */}
            {result === 'expired' && (
              <GlowCard className="mt-6 border-[var(--status-amber)]/30 p-6" style={{ transform: 'none' }}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--status-amber)]/10">
                    <Clock size={24} strokeWidth={1.75} className="text-[var(--status-amber)]" />
                  </div>
                  <p className="text-lg font-bold text-[var(--status-amber)]">{t('expired')}</p>
                  {data?.name && (
                    <p className="text-sm text-[var(--text-muted)]">{data.name}</p>
                  )}
                </div>
              </GlowCard>
            )}

            {/* Not found result */}
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

            {/* Error result */}
            {result === 'error' && (
              <GlowCard className="mt-6 border-[var(--status-red)]/30 p-6" style={{ transform: 'none' }}>
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle size={24} strokeWidth={1.75} className="text-[var(--status-red)]" />
                  <p className="text-sm text-[var(--text-muted)]">{t('verifyError')}</p>
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
