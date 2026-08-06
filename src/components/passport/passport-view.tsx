'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Award, Copy, Check, Sparkles, Share2 } from 'lucide-react';
import { useState } from 'react';
import { MuqabalehScoreBadge } from '@/components/brand';
import { localePath } from '@/i18n/navigation';
import type { PassportPayload } from '@/lib/passport';

export function PassportView({
  passport,
  mode,
}: {
  passport: PassportPayload;
  mode: 'owner' | 'public';
}) {
  const t = useTranslations('app.passport');
  const locale = useLocale();
  const [copied, setCopied] = useState(false);

  const sharePath = localePath(`/passport/${passport.userId}`, locale);

  const copyShare = async () => {
    try {
      const url = `${window.location.origin}${sharePath}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const metaBits = [
    passport.desiredRole,
    passport.headline,
    passport.industry,
    passport.experience,
    mode === 'owner' ? passport.country : null,
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
            {t('eyebrow')}
          </p>
          <h1 className="mq-display mt-2 text-2xl font-bold text-white md:text-3xl">
            {mode === 'owner' ? t('title') : passport.displayName}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            {mode === 'owner' ? t('subtitle') : t('publicSubtitle')}
          </p>
        </div>

        {mode === 'owner' && passport.isPubliclyVisible && passport.hasCompletedInterview && (
          <button
            type="button"
            onClick={copyShare}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm font-semibold text-white/85 transition-colors hover:bg-white/[0.08]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t('linkCopied') : t('copyLink')}
          </button>
        )}
      </div>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-teal-500/10 via-white/[0.03] to-transparent p-6 md:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 85% 15%, rgba(45,212,191,0.18), transparent 45%)',
          }}
          aria-hidden
        />

        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-3">
            <h2 className="mq-display text-xl font-bold text-white md:text-2xl">
              {passport.displayName}
            </h2>
            {metaBits.length > 0 && (
              <p className="text-sm text-white/60">{metaBits.join(' · ')}</p>
            )}
            {passport.hasCompletedInterview && passport.completedAt && (
              <p className="text-xs text-white/40">
                {t('lastScored', {
                  date: new Date(passport.completedAt).toLocaleDateString(locale),
                })}
              </p>
            )}
            {passport.verificationId && (
              <Link
                href={localePath(`/verify/${passport.verificationId}`, locale)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200"
              >
                <Share2 size={14} />
                {t('verifyScore')}
              </Link>
            )}
          </div>

          {passport.score != null ? (
            <div className="shrink-0 self-start md:self-center">
              <MuqabalehScoreBadge
                score={passport.score}
                status={passport.status}
                locale={locale}
                size="lg"
                max={passport.scoreMax}
                className="pointer-events-auto"
              />
            </div>
          ) : (
            <div className="max-w-sm rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-5">
              <p className="text-sm font-semibold text-white">{t('emptyTitle')}</p>
              <p className="mt-2 text-sm text-white/50">{t('emptySub')}</p>
              {mode === 'owner' && (
                <Link
                  href={localePath('/interview/prequal', locale)}
                  className="mq-btn mq-btn-primary mt-4 inline-flex min-h-[44px] items-center gap-2 px-4 text-sm font-bold"
                >
                  <Sparkles size={16} />
                  {t('startPractice')}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {passport.certificates.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">
            {t('certificates')}
          </h3>
          <ul className="grid gap-3 sm:grid-cols-2">
            {passport.certificates.map((cert) => {
              const title =
                [cert.type, cert.industry].filter(Boolean).join(' · ') || t('untitledCert');
              return (
                <li key={cert.id}>
                  <Link
                    href={localePath(`/verify/${cert.verificationId}`, locale)}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/10 text-teal-300">
                      <Award size={20} strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{title}</p>
                      <p className="mt-0.5 text-xs text-white/45">
                        {cert.score != null ? `${cert.score}/100 · ` : ''}
                        {new Date(cert.issuedAt).toLocaleDateString(locale)}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {mode === 'owner' && passport.hasCompletedInterview && !passport.isPubliclyVisible && (
        <p className="text-xs text-white/40">{t('privateNote')}</p>
      )}
    </div>
  );
}
