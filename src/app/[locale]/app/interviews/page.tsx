'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Eye, PlayCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { InterviewAvatar, SkeletonBlock, EmptyState } from '@/components/brand';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type InterviewStatus = 'all' | 'pending' | 'inProgress' | 'completed' | 'failed';

type MockInterview = {
  id: string;
  industry: string;
  type: string;
  status: 'pending' | 'inProgress' | 'completed' | 'failed';
  score: number | null;
  date: string;
  interviewer: 'fahd' | 'noora';
};

const mockInterviews: MockInterview[] = [
  { id: '1', industry: 'تقنية - IT', type: 'سلوكية', status: 'completed', score: 82, date: '2026-07-28', interviewer: 'fahd' },
  { id: '2', industry: 'المالية - Finance', type: 'تقنية', status: 'completed', score: 91, date: '2026-07-26', interviewer: 'noora' },
  { id: '3', industry: 'الهندسة - Engineering', type: 'سلوكية', status: 'inProgress', score: null, date: '2026-07-29', interviewer: 'fahd' },
  { id: '4', industry: 'الموارد البشرية - HR', type: 'سلوكية', status: 'completed', score: 76, date: '2026-07-24', interviewer: 'noora' },
  { id: '5', industry: 'التسويق - Marketing', type: 'تقنية', status: 'completed', score: 88, date: '2026-07-22', interviewer: 'fahd' },
  { id: '6', industry: 'الطب - Medicine', type: 'سلوكية', status: 'failed', score: null, date: '2026-07-20', interviewer: 'noora' },
  { id: '7', industry: 'التعليم - Education', type: 'تقنية', status: 'pending', score: null, date: '2026-07-30', interviewer: 'fahd' },
  { id: '8', industry: 'المبيعات - Sales', type: 'سلوكية', status: 'completed', score: 95, date: '2026-07-18', interviewer: 'noora' },
];

const industryOptions = ['IT', 'Finance', 'Medicine', 'Engineering', 'Education', 'Marketing', 'Sales', 'HR'];
const typeOptions = ['سلوكية', 'تقنية'];

export default function InterviewsPage() {
  const t = useTranslations('app.interviews');
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<InterviewStatus>('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const filtered = mockInterviews.filter((i) => {
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (industryFilter !== 'all' && !i.industry.includes(industryFilter)) return false;
    if (typeFilter !== 'all' && i.type !== typeFilter) return false;
    return true;
  });

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
            <CheckCircle2 size={12} strokeWidth={1.75} />
            {t('completed')}
          </span>
        );
      case 'inProgress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">
            <Clock size={12} strokeWidth={1.75} />
            {t('inProgress')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan/10 px-2.5 py-0.5 text-xs font-medium text-cyan">
            <Clock size={12} strokeWidth={1.75} />
            {t('pending')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            <XCircle size={12} strokeWidth={1.75} />
            {t('failed')}
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <SkeletonBlock lines={2} className="w-48" />
        <div className="flex gap-3">
          <SkeletonBlock lines={1} className="w-32" />
          <SkeletonBlock lines={1} className="w-32" />
          <SkeletonBlock lines={1} className="w-32" />
        </div>
        <SkeletonBlock lines={5} />
        <SkeletonBlock lines={5} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InterviewStatus)}>
          <SelectTrigger className="glass-input w-40 text-sm">
            <SelectValue placeholder={t('filterStatus')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-panel)] border-white/10">
            <SelectItem value="all" className="text-[var(--text-primary)] focus:bg-white/5">{t('all')}</SelectItem>
            <SelectItem value="pending" className="text-[var(--text-primary)] focus:bg-white/5">{t('pending')}</SelectItem>
            <SelectItem value="inProgress" className="text-[var(--text-primary)] focus:bg-white/5">{t('inProgress')}</SelectItem>
            <SelectItem value="completed" className="text-[var(--text-primary)] focus:bg-white/5">{t('completed')}</SelectItem>
            <SelectItem value="failed" className="text-[var(--text-primary)] focus:bg-white/5">{t('failed')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="glass-input w-40 text-sm">
            <SelectValue placeholder={t('filterIndustry')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-panel)] border-white/10">
            <SelectItem value="all" className="text-[var(--text-primary)] focus:bg-white/5">{t('all')}</SelectItem>
            {industryOptions.map((ind) => (
              <SelectItem key={ind} value={ind} className="text-[var(--text-primary)] focus:bg-white/5">{ind}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="glass-input w-40 text-sm">
            <SelectValue placeholder={t('filterType')} />
          </SelectTrigger>
          <SelectContent className="bg-[var(--bg-panel)] border-white/10">
            <SelectItem value="all" className="text-[var(--text-primary)] focus:bg-white/5">{t('all')}</SelectItem>
            {typeOptions.map((tp) => (
              <SelectItem key={tp} value={tp} className="text-[var(--text-primary)] focus:bg-white/5">{tp}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('emptyTitle')}
          sub={t('emptySub')}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((interview) => (
            <div
              key={interview.id}
              className="glass-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <InterviewAvatar who={interview.interviewer} size="sm" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{interview.industry}</span>
                    <span className="text-xs text-[var(--text-faint)]">· {interview.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(interview.status)}
                    <span className="text-xs text-[var(--text-faint)]">{interview.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {interview.score !== null && (
                  <span className={`text-lg font-bold ${interview.score >= 80 ? 'text-emerald' : 'text-amber'}`}>
                    {interview.score}
                  </span>
                )}
                {interview.status === 'completed' && (
                  <Link href={`/app/interview/${interview.id}/report`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--text-muted)] hover:text-gold">
                      <Eye size={16} strokeWidth={1.75} />
                      {t('viewReport')}
                    </Button>
                  </Link>
                )}
                {interview.status === 'inProgress' && (
                  <Link href={`/app/interview/${interview.id}`}>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-[var(--text-muted)] hover:text-gold">
                      <PlayCircle size={16} strokeWidth={1.75} />
                      {t('resume')}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
