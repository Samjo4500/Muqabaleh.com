'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Plus, ArrowDownLeft, Download, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard, ScoreBar, VerifiedBadge, QrCard, CopyLinkButton } from '@/components/brand';
import { toast } from 'sonner';

const SCORE = 91;

const scoreBars = [
  { key: 'contentScore', value: 94 },
  { key: 'clarityScore', value: 90 },
  { key: 'confidenceScore', value: 87 },
  { key: 'culturalFitScore', value: 92 },
] as const;

const strengths = ['strength1', 'strength2', 'strength3'] as const;
const improvements = ['improve1', 'improve2', 'improve3'] as const;

export default function ReportPage() {
  const t = useTranslations('app.report');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const verifyUrl = locale === 'ar'
    ? `https://muqabaleh.com/ar/verify/MQBL-DEMO-2026`
    : `https://muqabaleh.com/en/verify/MQBL-DEMO-2026`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back button */}
      <Link
        href="/app/interviews"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-gold"
      >
        <ArrowRight size={16} strokeWidth={1.75} />
        {t('backToInterviews')}
      </Link>

      {/* Score circle */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-gold bg-gold/[0.06]">
          <div className="text-center">
            <span className="text-5xl font-bold text-gold">{SCORE}</span>
            <span className="text-lg text-[var(--text-faint)]">/100</span>
          </div>
        </div>
        <span className="text-sm text-[var(--text-muted)]">{t('overallScore')}</span>
      </div>

      {/* Score bars */}
      <GlowCard className="space-y-5 p-6">
        {scoreBars.map((bar) => (
          <ScoreBar key={bar.key} label={t(bar.key)} value={bar.value} />
        ))}
      </GlowCard>

      {/* Recommendation badge */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-5 py-2 text-sm font-bold text-emerald">
          <CheckCircle2 size={18} strokeWidth={1.75} />
          {t('recommendation')}
        </span>
      </div>

      {/* AI Feedback */}
      <GlowCard className="space-y-4 p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('aiFeedback')}</h2>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t('aiFeedbackP1')}</p>
        <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t('aiFeedbackP2')}</p>
      </GlowCard>

      {/* Strengths + Improvements */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlowCard className="space-y-3 p-6">
          <h3 className="text-base font-bold text-emerald">{t('strengths')}</h3>
          {strengths.map((key) => (
            <div key={key} className="flex items-start gap-2">
              <Plus size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-emerald" />
              <span className="text-sm text-[var(--text-muted)]">{t(key)}</span>
            </div>
          ))}
        </GlowCard>
        <GlowCard className="space-y-3 p-6">
          <h3 className="text-base font-bold text-amber">{t('improvements')}</h3>
          {improvements.map((key) => (
            <div key={key} className="flex items-start gap-2">
              <ArrowDownLeft size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber" />
              <span className="text-sm text-[var(--text-muted)]">{t(key)}</span>
            </div>
          ))}
        </GlowCard>
      </div>

      {/* Certificate card with QR */}
      <GlowCard className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('certificate')}</h2>
          <VerifiedBadge />
        </div>
        <QrCard verificationId="MQBL-DEMO-2026" className="mx-auto max-w-xs" />
      </GlowCard>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => toast.info(tCommon('comingSoon'))}
          className="btn-gold gap-2 cursor-pointer"
        >
          <Download size={18} strokeWidth={1.75} />
          {t('downloadPdf')}
        </Button>
        <Button
          onClick={() => toast.info(tCommon('comingSoon'))}
          variant="outline"
          className="gap-2 border-white/10 text-[var(--text-muted)] hover:border-white/20 hover:text-gold cursor-pointer"
        >
          <Linkedin size={18} strokeWidth={1.75} />
          {t('shareLinkedin')}
        </Button>
        <CopyLinkButton text={verifyUrl} />
        <Link href="/app/interviews" className="ms-auto">
          <Button
            variant="ghost"
            className="gap-2 text-[var(--text-muted)] hover:text-gold cursor-pointer"
          >
            {t('retrain')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
