'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, Loader2, Search, ShieldCheck } from 'lucide-react';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { easeCrystal, fadeUp } from '@/components/landing/crystal/motion';
import { VerifiedBadge } from '@/components/brand';
import { localePath } from '@/i18n/navigation';

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

export function VerifyClient({ initialId = '' }: { initialId?: string }) {
  const t = useTranslations('verify');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [inputValue, setInputValue] = useState(initialId);
  const [result, setResult] = useState<VerifyResult>('idle');
  const [data, setData] = useState<VerifyData | null>(null);
  const [autoRan, setAutoRan] = useState(false);

  const handleVerify = async (rawId?: string) => {
    const id = (rawId ?? inputValue).trim();
    if (!id) return;

    setResult('loading');
    setData(null);

    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(id)}`);
      const json = (await res.json()) as VerifyData & { error?: unknown };

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

  useEffect(() => {
    if (initialId && !autoRan) {
      setInputValue(initialId);
      setAutoRan(true);
      void handleVerify(initialId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when deep-linked
  }, [initialId, autoRan]);

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AtelierShell showHeroLogo>
      <section className="mq-section !pt-6 md:!pt-10">
        <div className="mq-wrap mx-auto max-w-xl">
          <motion.div
            className="mb-10 text-center"
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <p className="mq-kicker mb-3">Muqabaleh</p>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-300/30 bg-teal-400/12">
              <ShieldCheck size={26} className="text-teal-300" strokeWidth={1.75} />
            </div>
            <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">{t('title')}</h1>
            <p className="mx-auto mt-4 max-w-md text-base text-white/55 md:text-lg">{t('sub')}</p>
            <Link
              href={localePath('/how-scores-work', locale)}
              className="mt-3 inline-flex text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              {isAr ? 'كيف تعمل درجات مقابلة' : 'How Muqabaleh scores work'}
            </Link>
          </motion.div>

          <motion.div
            className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-6"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeCrystal, delay: 0.08 }}
          >
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              {isAr ? 'معرّف التحقق' : 'Verification ID'}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('inputPlaceholder')}
                className="glass-input min-h-[48px] flex-1 px-4 py-3 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && void handleVerify()}
                disabled={result === 'loading'}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => void handleVerify()}
                disabled={result === 'loading' || !inputValue.trim()}
                className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm disabled:opacity-50"
              >
                {result === 'loading' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} strokeWidth={1.75} />
                )}
                {t('verifyBtn')}
              </button>
            </div>
          </motion.div>

          {result === 'valid' && data ? (
            <motion.div
              className="mt-6 overflow-hidden rounded-[1.75rem] border border-teal-300/30 bg-teal-400/[0.07] p-6"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: easeCrystal }}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <VerifiedBadge size="lg" />
                <p className="mq-display text-lg font-bold text-emerald-300">{t('valid')}</p>
                <div className="w-full border-t border-white/10 pt-4 text-start">
                  <InfoRow label={t('name')} value={data.name || '—'} />
                  <InfoRow
                    label={t('score')}
                    value={data.score != null ? `${data.score}/100` : '—'}
                  />
                  <InfoRow label={t('issuedAt')} value={formatDate(data.issuedAt)} />
                  <InfoRow label={t('expiresAt')} value={formatDate(data.expiresAt)} />
                  {data.industry ? <InfoRow label={t('industry')} value={data.industry} /> : null}
                  {data.type ? <InfoRow label={t('type')} value={data.type} /> : null}
                </div>
              </div>
            </motion.div>
          ) : null}

          {result === 'expired' ? (
            <ResultCard
              tone="amber"
              icon={<Clock size={24} strokeWidth={1.75} className="text-amber-200" />}
              title={t('expired')}
              body={data?.name}
            />
          ) : null}

          {result === 'notFound' ? (
            <ResultCard
              tone="rose"
              icon={<AlertCircle size={24} strokeWidth={1.75} className="text-rose-300" />}
              title={t('notFound')}
            />
          ) : null}

          {result === 'error' ? (
            <ResultCard
              tone="rose"
              icon={<AlertCircle size={24} strokeWidth={1.75} className="text-rose-300" />}
              title={t('verifyError')}
            />
          ) : null}
        </div>
      </section>
    </AtelierShell>
  );
}

function ResultCard({
  tone,
  icon,
  title,
  body,
}: {
  tone: 'amber' | 'rose';
  icon: ReactNode;
  title: string;
  body?: string;
}) {
  const border =
    tone === 'amber' ? 'border-amber-200/30 bg-amber-200/[0.06]' : 'border-rose-400/30 bg-rose-400/[0.06]';
  const iconBg = tone === 'amber' ? 'bg-amber-200/10' : 'bg-rose-400/10';
  const titleColor = tone === 'amber' ? 'text-amber-100' : 'text-rose-300';

  return (
    <motion.div
      className={`mt-6 rounded-[1.75rem] border p-6 ${border}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeCrystal }}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
          {icon}
        </div>
        <p className={`mq-display text-lg font-bold ${titleColor}`}>{title}</p>
        {body ? <p className="text-sm text-white/55">{body}</p> : null}
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-white/50">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
