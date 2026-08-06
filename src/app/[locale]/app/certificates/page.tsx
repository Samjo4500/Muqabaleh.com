'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Award, Eye, FileBadge } from 'lucide-react';
import { VerifiedBadge, QrCard } from '@/components/brand';
import { localePath } from '@/i18n/navigation';

type Cert = {
  interviewId: string;
  verificationId: string;
  score: number | null;
  industry: string | null;
  type: string | null;
  expiresAt: string | null;
  issuedAt: string;
};

export default function CertificatesPage() {
  const t = useTranslations('app.certificates');
  const locale = useLocale();
  const [certs, setCerts] = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/certificates');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        if (!cancelled) setCerts(data.certificates || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-white/55">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-white/50">{t('loading')}</p>
      ) : error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : certs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
            <FileBadge size={28} strokeWidth={1.75} />
          </div>
          <p className="text-base font-semibold text-white">{t('emptyTitle')}</p>
          <p className="mt-2 max-w-md text-sm text-white/50">{t('emptySub')}</p>
          <Link
            href={localePath('/interview/prequal', locale)}
            className="mq-btn mq-btn-primary mt-6 inline-flex min-h-[44px] items-center px-5 text-sm font-bold"
          >
            {t('startPractice')}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => {
            const score = cert.score ?? 0;
            const title =
              [cert.type, cert.industry].filter(Boolean).join(' · ') || t('untitled');
            return (
              <div
                key={cert.verificationId}
                className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center backdrop-blur-sm"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
                  <Award size={28} strokeWidth={1.75} />
                </div>
                <h3 className="mb-1 text-sm font-bold text-white">{title}</h3>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${score >= 80 ? 'text-emerald-300' : 'text-amber-300'}`}
                  >
                    {score}
                  </span>
                  <span className="text-sm text-white/40">/100</span>
                </div>
                <span className="mb-4 text-xs text-white/40">
                  {new Date(cert.issuedAt).toLocaleDateString(locale)}
                </span>
                <QrCard verificationId={cert.verificationId} className="w-full max-w-[200px]" />
                <div className="mt-3 flex items-center gap-2">
                  <VerifiedBadge size="sm" />
                </div>
                <Link
                  href={localePath(`/app/interview/${cert.interviewId}/report`, locale)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/60 transition hover:border-teal-300/40 hover:text-teal-300"
                >
                  <Eye size={16} strokeWidth={1.75} />
                  {t('viewReport')}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
