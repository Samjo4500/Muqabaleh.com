'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AlertCircle, Clock, Search, Loader2 } from 'lucide-react';
import { GlowCard, VerifiedBadge } from '@/components/brand';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';

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
    <AtelierShell>
      <section className="mq-wrap py-16 md:py-24">
        <div className="mx-auto max-w-lg">
          <div className="text-center">
            <h1 className="mq-display text-3xl font-extrabold text-white md:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-4 text-white/55">{t('sub')}</p>
          </div>

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
                className="mq-btn mq-btn-primary flex items-center gap-2 px-6 py-3 text-sm disabled:opacity-50"
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

          {result === 'valid' && data && (
            <GlowCard className="mt-6 border-teal-300/30 p-6" style={{ transform: 'none' }}>
              <div className="flex flex-col items-center gap-4 text-center">
                <VerifiedBadge size="lg" />
                <p className="text-lg font-bold text-emerald-400">{t('valid')}</p>
                <div className="w-full border-t border-white/10 pt-4 text-start">
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
                  {data.type && <InfoRow label={t('type')} value={data.type} />}
                </div>
              </div>
            </GlowCard>
          )}

          {result === 'expired' && (
            <GlowCard className="mt-6 border-amber-400/30 p-6" style={{ transform: 'none' }}>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400/10">
                  <Clock size={24} strokeWidth={1.75} className="text-amber-300" />
                </div>
                <p className="text-lg font-bold text-amber-300">{t('expired')}</p>
                {data?.name && <p className="text-sm text-white/55">{data.name}</p>}
              </div>
            </GlowCard>
          )}

          {result === 'notFound' && (
            <GlowCard className="mt-6 border-rose-400/30 p-6" style={{ transform: 'none' }}>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-400/10">
                  <AlertCircle size={24} strokeWidth={1.75} className="text-rose-300" />
                </div>
                <p className="text-lg font-bold text-rose-300">{t('notFound')}</p>
              </div>
            </GlowCard>
          )}

          {result === 'error' && (
            <GlowCard className="mt-6 border-rose-400/30 p-6" style={{ transform: 'none' }}>
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle size={24} strokeWidth={1.75} className="text-rose-300" />
                <p className="text-sm text-white/55">{t('verifyError')}</p>
              </div>
            </GlowCard>
          )}
        </div>
      </section>
    </AtelierShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-white/55">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
