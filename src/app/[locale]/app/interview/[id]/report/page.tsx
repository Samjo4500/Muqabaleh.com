'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Plus, ArrowDownLeft, Download, Linkedin, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlowCard, ScoreBar, VerifiedBadge, QrCard, CopyLinkButton, SkeletonBlock } from '@/components/brand';
import { OptInModal } from '@/components/opt-in-modal';
import { toMuqabalehScore, toCriterionScore, getScoreColor } from '@/lib/scoring';
import { toast } from 'sonner';
import { localePath } from '@/i18n/navigation';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface ReportData {
  id: string;
  overallScore: number | null;
  contentScore: number | null;
  clarityScore: number | null;
  confidenceScore: number | null;
  culturalFitScore: number | null;
  feedback: string | null;
  strengths: string[];
  improvements: string[];
  recommendation: string | null;
  verificationId: string | null;
  expiresAt: string | null;
  type: string | null;
  industry: string | null;
  language: string | null;
  completedAt: string | null;
}

/* ------------------------------------------------------------------ */
/*  Recommendation config                                               */
/* ------------------------------------------------------------------ */

function getRecommendationFromScore(mScore: number) {
  if (mScore >= 6) {
    return {
      border: 'border-emerald/30',
      bg: 'bg-emerald/10',
      text: 'text-emerald',
      labelKey: 'recommendation' as const,
      icon: CheckCircle2,
    };
  }
  if (mScore >= 4) {
    return {
      border: 'border-[var(--status-amber)]/30',
      bg: 'bg-[var(--status-amber)]/10',
      text: 'text-[var(--status-amber)]',
      labelKey: 'recommendationConsider' as const,
      icon: AlertTriangle,
    };
  }
  return {
    border: 'border-[var(--status-red)]/30',
    bg: 'bg-[var(--status-red)]/10',
    text: 'text-[var(--status-red)]',
    labelKey: 'recommendationNo' as const,
    icon: AlertTriangle,
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = useTranslations('app.report');
  const tLanding = useTranslations('landing');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [interviewId, setInterviewId] = useState<string>('');
  useEffect(() => {
    params.then(({ id }) => {
      setInterviewId(id);
      fetchReport(id);
    });
    }, [params]);

  async function fetchReport(id: string) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/interviews/${id}/report`);
      if (!res.ok) {
        if (res.status === 400) {
          toast.error(t('reportNotReady'));
        } else {
          setError(true);
        }
        return;
      }
      const data = await res.json();
      setReport(data.report);
      setReportData(data.report);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // Opt-in modal trigger (must be before conditional returns for hooks rules)
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const optInTriggered = useRef(false);
  const [showOptIn, setShowOptIn] = useState(false);

  useEffect(() => {
    if (!optInTriggered.current && reportData) {
      const score = toMuqabalehScore(reportData.overallScore ?? 0);
      if (score.score > 0) {
        optInTriggered.current = true;
        const timer = setTimeout(() => setShowOptIn(true), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [reportData]);

  async function handleDownloadPdf() {
    if (!interviewId) return;
    try {
      const res = await fetch(`/api/interviews/${interviewId}/certificate`, {
        method: 'POST',
      });
      if (res.ok) {
        toast.success(t('certificateGenerated'));
      }
    } catch {
      // Ignore
    }
    toast.info(t('downloadPdfComingSoon'));
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="h-6 w-40 animate-pulse rounded bg-white/10" />
        <div className="flex flex-col items-center gap-4">
          <div className="h-36 w-36 animate-pulse rounded-full bg-white/10" />
          <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        </div>
        <SkeletonBlock lines={4} className="p-6" />
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonBlock lines={3} className="p-6" />
          <SkeletonBlock lines={3} className="p-6" />
        </div>
        <SkeletonBlock lines={2} className="p-6" />
      </div>
    );
  }

  // Error state
  if (error || !report) {
    return (
      <div className="mx-auto max-w-4xl">
        <Link
          href={localePath("/app/interviews", locale)}
          className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-gold"
        >
          <ArrowRight size={16} strokeWidth={1.75} />
          {t('backToInterviews')}
        </Link>
        <div className="mt-12 text-center">
          <AlertTriangle size={48} strokeWidth={1.75} className="mx-auto mb-4 text-[var(--status-amber)]" />
          <p className="text-lg font-medium text-[var(--text-primary)]">{t('errorLoadingReport')}</p>
          <Button
            onClick={() => fetchReport(interviewId)}
            variant="ghost"
            className="mt-4 text-[var(--text-muted)] hover:text-gold cursor-pointer"
          >
            {tCommon('retry')}
          </Button>
        </div>
      </div>
    );
  }

  // Convert 0-100 to Muqabaleh 1-10 score
  const mScore = toMuqabalehScore(report.overallScore ?? 0);
  const scoreColor = getScoreColor(mScore.score);
  const recStyle = getRecommendationFromScore(mScore.score);
  const RecIcon = recStyle.icon;

  const scoreBars = [
    { label: t('contentScore'), value: toCriterionScore(report.contentScore) },
    { label: t('clarityScore'), value: toCriterionScore(report.clarityScore) },
    { label: t('confidenceScore'), value: toCriterionScore(report.confidenceScore) },
    { label: t('culturalFitScore'), value: toCriterionScore(report.culturalFitScore) },
  ];

  const verifyId = report.verificationId || '';
  const verifyUrl = locale === 'ar'
    ? `https://muqabaleh.com/ar/verify/${verifyId}`
    : `https://muqabaleh.com/en/verify/${verifyId}`;

  // Split feedback into paragraphs
  const feedbackParagraphs = report.feedback
    ? report.feedback.split('\n').filter(Boolean)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Back button */}
      <Link
        href={localePath("/app/interviews", locale)}
        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-gold"
      >
        <ArrowRight size={16} strokeWidth={1.75} />
        {t('backToInterviews')}
      </Link>

      {/* Muqabaleh Score Label */}
      <p className="text-center text-sm font-medium tracking-wider uppercase text-[var(--text-faint)]">
        {tLanding('muqabalehScore')}
      </p>

      {/* Score circle */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-gold bg-gold/[0.06]">
          <div className="text-center">
            <span className={`text-5xl font-bold ${scoreColor}`}>{mScore.score}</span>
            <span className="text-lg text-[var(--text-faint)]">/10</span>
          </div>
        </div>
        <span className="text-sm text-[var(--text-muted)]">
          {locale === 'ar' ? mScore.levelAr : mScore.levelEn}
        </span>
      </div>

      {/* Score bars */}
      <GlowCard className="space-y-5 p-6">
        {scoreBars.map((bar) => (
          <ScoreBar
            key={bar.label}
            label={bar.label}
            value={bar.value}
            max={10}
            suffix="10"
            color={getScoreColor(bar.value)}
          />
        ))}
      </GlowCard>

      {/* Recommendation badge */}
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-2 rounded-full border ${recStyle.border} ${recStyle.bg} px-5 py-2 text-sm font-bold ${recStyle.text}`}
        >
          <RecIcon size={18} strokeWidth={1.75} />
          {t(recStyle.labelKey)}
        </span>
      </div>

      {/* AI Feedback */}
      {feedbackParagraphs.length > 0 && (
        <GlowCard className="space-y-4 p-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('aiFeedback')}</h2>
          {feedbackParagraphs.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed text-[var(--text-muted)]">
              {para}
            </p>
          ))}
        </GlowCard>
      )}

      {/* Strengths + Improvements */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlowCard className="space-y-3 p-6">
          <h3 className="text-base font-bold text-emerald">{t('strengths')}</h3>
          {report.strengths && report.strengths.length > 0 ? (
            report.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <Plus size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-emerald" />
                <span className="text-sm text-[var(--text-muted)]">{s}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-faint)]">{t('noStrengths')}</p>
          )}
        </GlowCard>
        <GlowCard className="space-y-3 p-6">
          <h3 className="text-base font-bold text-amber">{t('improvements')}</h3>
          {report.improvements && report.improvements.length > 0 ? (
            report.improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <ArrowDownLeft size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber" />
                <span className="text-sm text-[var(--text-muted)]">{s}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-faint)]">{t('noImprovements')}</p>
          )}
        </GlowCard>
      </div>

      {/* Certificate card with QR */}
      {verifyId && (
        <GlowCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('certificate')}</h2>
            <VerifiedBadge />
          </div>
          <QrCard verificationId={verifyId} className="mx-auto max-w-xs" />
        </GlowCard>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={handleDownloadPdf}
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
        {verifyId && <CopyLinkButton text={verifyUrl} />}
        <Link href={localePath("/app", locale)} className="ms-auto">
          <Button
            variant="ghost"
            className="gap-2 text-[var(--text-muted)] hover:text-gold cursor-pointer"
          >
            {t('retrain')}
          </Button>
        </Link>
      </div>

      {/* Opt-in modal */}
      <OptInModal
        open={showOptIn}
        onOpenChange={setShowOptIn}
        muqabalehScore={mScore.score}
        interviewId={interviewId}
        onSave={() => {}}
      />
    </div>
  );
}
