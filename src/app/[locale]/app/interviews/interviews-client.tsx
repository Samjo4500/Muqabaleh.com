'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MessageSquare, Eye, PlayCircle, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState, ScoreBar } from '@/components/brand';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
export type InterviewStatus = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EVALUATION_FAILED';

export type InterviewRow = {
  id: string;
  industry: string;
  industryLabel: string;
  type: string;
  typeLabel: string;
  status: string;
  overallScore: number | null;
  createdAt: string;
  locale: string;
};

type FilterTab = 'ALL' | 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';

const FILTER_TABS: FilterTab[] = ['ALL', 'COMPLETED', 'IN_PROGRESS', 'PENDING'];

/* ------------------------------------------------------------------ */
/*  Client Component                                                    */
/* ------------------------------------------------------------------ */
export function InterviewsClient({ interviews, locale }: { interviews: InterviewRow[]; locale: string }) {
  const t = useTranslations('app.interviews');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');

  const filtered = interviews.filter((i) => {
    if (activeTab === 'ALL') return true;
    return i.status === activeTab;
  });

  const tabLabel = (tab: FilterTab) => {
    switch (tab) {
      case 'ALL': return t('all');
      case 'COMPLETED': return t('completed');
      case 'IN_PROGRESS': return t('inProgress');
      case 'PENDING': return t('pending');
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold/15 text-gold border border-gold/30'
                  : 'bg-white/[0.04] text-[var(--text-muted)] border border-white/[0.08] hover:bg-white/[0.08] hover:text-[var(--text-primary)]'
              }`}
            >
              {tabLabel(tab)}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={40} strokeWidth={1.75} />}
          title={t('emptyTitle')}
          sub={t('emptySub')}
          cta={t('startNew')}
          ctaHref={t('startNewHref')}
        />
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filtered.map((interview) => (
            <InterviewCard key={interview.id} interview={interview} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interview Card                                                      */
/* ------------------------------------------------------------------ */
function InterviewCard({ interview, locale }: { interview: InterviewRow; locale: string }) {
  const t = useTranslations('app.interviews');

  const formattedDate = new Date(interview.createdAt).toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' },
  );

  return (
    <div className="glass-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div className="mt-0.5 shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05]">
          <MessageSquare size={20} strokeWidth={1.75} className="text-gold" />
        </div>
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              {interview.industryLabel}
            </span>
            <span className="text-xs text-[var(--text-faint)]">
              · {interview.typeLabel}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={interview.status} t={t} />
            <span className="text-xs text-[var(--text-faint)]">{formattedDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 sm:ms-4">
        {interview.status === 'COMPLETED' && interview.overallScore !== null && (
          <div className="w-24 hidden sm:block">
            <ScoreBar
              label=""
              value={interview.overallScore}
              goldTicks={false}
            />
          </div>
        )}
        {interview.status === 'COMPLETED' && interview.overallScore !== null && (
          <span className={`text-lg font-bold ${interview.overallScore >= 80 ? 'text-emerald' : 'text-amber'}`}>
            {interview.overallScore}
          </span>
        )}
        {interview.status === 'COMPLETED' && (
          <Link href={`/app/interview/${interview.id}/report`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--text-muted)] hover:text-gold">
              <Eye size={16} strokeWidth={1.75} />
              {t('viewReport')}
            </Button>
          </Link>
        )}
        {interview.status === 'IN_PROGRESS' && (
          <Link href={`/app/interview/${interview.id}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--text-muted)] hover:text-gold">
              <PlayCircle size={16} strokeWidth={1.75} />
              {t('resume')}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status Badge                                                        */
/* ------------------------------------------------------------------ */
function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  if (status === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
        <CheckCircle2 size={12} strokeWidth={1.75} />
        {t('completed')}
      </span>
    );
  }

  if (status === 'IN_PROGRESS') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan/10 px-2.5 py-0.5 text-xs font-medium text-cyan">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-cyan rounded-full bg-cyan opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan" />
        </span>
        {t('inProgress')}
      </span>
    );
  }

  if (status === 'PENDING') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">
        <Clock size={12} strokeWidth={1.75} />
        {t('pending')}
      </span>
    );
  }

  /* EVALUATION_FAILED or anything else */
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
      <AlertTriangle size={12} strokeWidth={1.75} />
      {t('evaluationFailed')}
    </span>
  );
}
