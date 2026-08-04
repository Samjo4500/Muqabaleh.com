'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Download, CheckCircle2, Plus, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowCard, ScoreBar } from '@/components/brand';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

const CANDIDATES = [
  { prefix: 'c1', hasScores: true },
  { prefix: 'c2', hasScores: true },
  { prefix: 'c3', hasScores: false },
  { prefix: 'c4', hasScores: false },
  { prefix: 'c5', hasScores: true },
] as const;

function statusStyle(status: string) {
  switch (status) {
    case 'completed': return 'border-emerald/30 bg-emerald/10 text-emerald';
    case 'inProgress': return 'border-cyan/30 bg-cyan/10 text-cyan';
    case 'invited': return 'border-indigo-400/30 bg-indigo-500/10 text-[var(--aurora-2)]';
    case 'slaBreached': return 'border-red-500/30 bg-red-500/10 text-red-500';
    default: return 'border-white/20 bg-white/5 text-[var(--text-muted)]';
  }
}

const scoreBars = [
  { key: 'colContent', value: 92 },
  { key: 'colClarity', value: 88 },
  { key: 'colConfidence', value: 85 },
  { key: 'colCultural', value: 91 },
] as const;

const strengths = ['strength1', 'strength2', 'strength3'] as const;
const improvements = ['improve1', 'improve2', 'improve3'] as const;

export default function JobCandidatesPage() {
  const t = useTranslations('b2b.candidates');
  const tJobs = useTranslations('b2b.jobs');
  const tCommon = useTranslations('common');
  const params = useParams();
  const jobId = params.id as string;
  const [reportOpen, setReportOpen] = useState(false);

  const jobTitle = jobId === '1' ? tJobs('job1Title') : jobId === '2' ? tJobs('job2Title') : tJobs('job3Title');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <Link href="/b2b/jobs" className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--aurora-2)]">
          <ArrowRight size={20} strokeWidth={1.75} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{jobTitle}</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <GlowCard className="p-4 text-center">
          <p className="text-2xl font-bold text-[var(--text-primary)]">3</p>
          <p className="text-xs text-[var(--text-muted)]">{t('statsInvited')}</p>
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald">2</p>
          <p className="text-xs text-[var(--text-muted)]">{t('statsCompleted')}</p>
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <p className="text-2xl font-bold text-cyan">91</p>
          <p className="text-xs text-[var(--text-muted)]">{t('statsAvgScore')}</p>
        </GlowCard>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button
          onClick={() => toast.info(tCommon('comingSoon'))}
          variant="outline"
          className="gap-2 border-white/10 text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--aurora-2)] cursor-pointer"
        >
          <Download size={16} strokeWidth={1.75} />
          {t('exportCsv')}
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-3 text-start font-medium text-[var(--text-muted)]">{t('colName')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colStatus')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colContent')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colClarity')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colConfidence')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colCultural')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colOverall')}</th>
              <th className="px-3 py-3 text-center font-medium text-[var(--text-muted)]">{t('colRecommendation')}</th>
              <th className="px-3 py-3 text-start font-medium text-[var(--text-muted)]">{t('colDate')}</th>
            </tr>
          </thead>
          <tbody>
            {CANDIDATES.map((c) => {
              const name = t(`${c.prefix}Name` as 'c1Name');
              const status = t(`${c.prefix}Status` as 'c1Status');
              const statusKey = c.prefix === 'c1' || c.prefix === 'c2' ? 'completed' : c.prefix === 'c3' ? 'inProgress' : c.prefix === 'c4' ? 'invited' : 'slaBreached';
              return (
                <tr
                  key={c.prefix}
                  className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02] cursor-pointer"
                  onClick={c.hasScores ? () => setReportOpen(true) : undefined}
                >
                  <td className="px-3 py-3 font-medium text-[var(--text-primary)]">{name}</td>
                  <td className="px-3 py-3 text-center">
                    <Badge variant="outline" className={statusStyle(statusKey)}>{status}</Badge>
                  </td>
                  <td className="px-3 py-3 text-center text-[var(--text-primary)]">{t(`${c.prefix}Content` as 'c1Content')}</td>
                  <td className="px-3 py-3 text-center text-[var(--text-primary)]">{t(`${c.prefix}Clarity` as 'c1Clarity')}</td>
                  <td className="px-3 py-3 text-center text-[var(--text-primary)]">{t(`${c.prefix}Confidence` as 'c1Confidence')}</td>
                  <td className="px-3 py-3 text-center text-[var(--text-primary)]">{t(`${c.prefix}Cultural` as 'c1Cultural')}</td>
                  <td className="px-3 py-3 text-center font-bold text-[var(--aurora-2)]">{t(`${c.prefix}Overall` as 'c1Overall')}</td>
                  <td className="px-3 py-3 text-center">
                    {c.hasScores ? (
                      <Badge variant="outline" className={
                        t(`${c.prefix}Rec` as 'c1Rec') === t('recommendYes')
                          ? 'border-emerald/30 bg-emerald/10 text-emerald'
                          : 'border-red-500/30 bg-red-500/10 text-red-500'
                      }>
                        {t(`${c.prefix}Rec` as 'c1Rec')}
                      </Badge>
                    ) : (
                      <span className="text-[var(--text-faint)]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[var(--text-faint)]">{t(`${c.prefix}Date` as 'c1Date')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 lg:hidden">
        {CANDIDATES.map((c) => {
          const statusKey = c.prefix === 'c1' || c.prefix === 'c2' ? 'completed' : c.prefix === 'c3' ? 'inProgress' : c.prefix === 'c4' ? 'invited' : 'slaBreached';
          return (
            <div
              key={c.prefix}
              className="glass-card rounded-xl p-4 cursor-pointer"
              onClick={c.hasScores ? () => setReportOpen(true) : undefined}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{t(`${c.prefix}Name` as 'c1Name')}</p>
                  <p className="mt-1 text-xs text-[var(--text-faint)]">{t(`${c.prefix}Date` as 'c1Date')}</p>
                </div>
                <Badge variant="outline" className={statusStyle(statusKey)}>{t(`${c.prefix}Status` as 'c1Status')}</Badge>
              </div>
              {c.hasScores && (
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="text-[var(--text-muted)]">{t('colOverall')}: <span className="font-bold text-[var(--aurora-2)]">{t(`${c.prefix}Overall` as 'c1Overall')}</span></span>
                  <Badge variant="outline" className={
                    t(`${c.prefix}Rec` as 'c1Rec') === t('recommendYes')
                      ? 'border-emerald/30 bg-emerald/10 text-emerald'
                      : 'border-red-500/30 bg-red-500/10 text-red-500'
                  }>
                    {t(`${c.prefix}Rec` as 'c1Rec')}
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/[0.08] bg-[var(--bg-panel)] sm:max-w-2xl">
          <DialogTitle className="sr-only">{t('reportTitle')}</DialogTitle>
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('reportTitle')}</h2>

            {/* Score circle */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-indigo-400/50 bg-indigo-500/[0.06]">
                <div className="text-center">
                  <span className="text-4xl font-bold text-[var(--aurora-2)]">89</span>
                  <span className="text-base text-[var(--text-faint)]">/100</span>
                </div>
              </div>
              <span className="text-sm text-[var(--text-muted)]">{t('overallScore')}</span>
            </div>

            {/* Score bars */}
            <GlowCard className="space-y-4 p-5">
              {scoreBars.map((bar) => (
                <ScoreBar key={bar.key} label={t(bar.key)} value={bar.value} />
              ))}
            </GlowCard>

            {/* Recommendation */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald/30 bg-emerald/10 px-5 py-2 text-sm font-bold text-emerald">
                <CheckCircle2 size={18} strokeWidth={1.75} />
                {t('recommendYes')}
              </span>
            </div>

            {/* AI Feedback */}
            <GlowCard className="space-y-3 p-5">
              <h3 className="text-base font-bold text-[var(--text-primary)]">{t('aiFeedback')}</h3>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t('aiFeedbackP1')}</p>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t('aiFeedbackP2')}</p>
            </GlowCard>

            {/* Strengths + Improvements */}
            <div className="grid gap-4 sm:grid-cols-2">
              <GlowCard className="space-y-3 p-5">
                <h4 className="text-sm font-bold text-emerald">{t('strengths')}</h4>
                {strengths.map((key) => (
                  <div key={key} className="flex items-start gap-2">
                    <Plus size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-emerald" />
                    <span className="text-sm text-[var(--text-muted)]">{t(key)}</span>
                  </div>
                ))}
              </GlowCard>
              <GlowCard className="space-y-3 p-5">
                <h4 className="text-sm font-bold text-amber">{t('improvements')}</h4>
                {improvements.map((key) => (
                  <div key={key} className="flex items-start gap-2">
                    <ArrowDownLeft size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-amber" />
                    <span className="text-sm text-[var(--text-muted)]">{t(key)}</span>
                  </div>
                ))}
              </GlowCard>
            </div>

            {/* Company Criteria */}
            <GlowCard className="space-y-3 p-5">
              <h4 className="text-sm font-bold text-[var(--aurora-2)]">{t('companyCriteria')}</h4>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t('companyCriteriaP')}</p>
            </GlowCard>

            {/* Close */}
            <div className="flex justify-end">
              <Button
                onClick={() => setReportOpen(false)}
                variant="ghost"
                className="text-[var(--text-muted)] hover:text-[var(--aurora-2)] cursor-pointer"
              >
                {t('close')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
