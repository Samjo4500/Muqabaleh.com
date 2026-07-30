'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { Hand, Flame, BarChart3, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { GlowCard, InterviewAvatar, CountUpStat, EmptyState } from '@/components/brand';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const SESSIONS_LEFT = 3;

const recentInterviews = [
  { id: '1', industry: 'تقنية - IT', type: 'سلوكية', status: 'completed', score: 82, date: '2026-07-28' },
  { id: '2', industry: 'المالية - Finance', type: 'تقنية', status: 'completed', score: 91, date: '2026-07-26' },
  { id: '3', industry: 'الهندسة - Engineering', type: 'سلوكية', status: 'inProgress', score: null, date: '2026-07-29' },
  { id: '4', industry: 'الموارد البشرية - HR', type: 'سلوكية', status: 'completed', score: 76, date: '2026-07-24' },
  { id: '5', industry: 'التسويق - Marketing', type: 'تقنية', status: 'completed', score: 88, date: '2026-07-22' },
];

export default function DashboardPage() {
  const t = useTranslations('app.dashboard');
  const [field, setField] = useState('');
  const [experience, setExperience] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [interviewer, setInterviewer] = useState<'fahd' | 'noora' | ''>('');

  const handleStart = () => {
    if (!field || !experience || !interviewType || !interviewer) {
      toast.info(t('fieldPlaceholder'));
      return;
    }
    toast.info('ستتوفر هذه الميزة في المرحلة القادمة');
  };

  const fieldOptions = [
    { value: 'it', label: t('fieldIt') },
    { value: 'finance', label: t('fieldFinance') },
    { value: 'medicine', label: t('fieldMedicine') },
    { value: 'engineering', label: t('fieldEngineering') },
    { value: 'education', label: t('fieldEducation') },
    { value: 'marketing', label: t('fieldMarketing') },
    { value: 'sales', label: t('fieldSales') },
    { value: 'hr', label: t('fieldHr') },
  ];

  const expOptions = [
    { value: 'junior', label: t('expJunior') },
    { value: 'mid', label: t('expMid') },
    { value: 'senior', label: t('expSenior') },
    { value: 'executive', label: t('expExecutive') },
  ];

  const typeOptions = [
    { value: 'behavioral', label: t('typeBehavioral') },
    { value: 'technical', label: t('typeTechnical') },
  ];

  const statusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
          <CheckCircle2 size={12} strokeWidth={1.75} />
          {t('statusCompleted')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">
        <Clock size={12} strokeWidth={1.75} />
        {t('statusInProgress')}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        <Hand size={24} strokeWidth={1.75} className="text-gold" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('welcome', { name: 'أحمد' })}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-2">
            <Flame size={18} strokeWidth={1.75} className="text-gold" />
            <span className="text-sm">{t('streak')}</span>
          </div>
          <CountUpStat value={7} />
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-2">
            <BarChart3 size={18} strokeWidth={1.75} className="text-gold" />
            <span className="text-sm">{t('avgScore')}</span>
          </div>
          <CountUpStat value={82} />
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--text-muted)] mb-2">
            <CheckCircle2 size={18} strokeWidth={1.75} className="text-emerald" />
            <span className="text-sm">{t('completed')}</span>
          </div>
          <CountUpStat value={12} />
        </GlowCard>
        <GlowCard className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-gold mb-2">
            <Clock size={18} strokeWidth={1.75} />
            <span className="text-sm">{t('remaining')}</span>
          </div>
          <CountUpStat value={SESSIONS_LEFT} />
        </GlowCard>
      </div>

      {/* Buy package CTA if 0 sessions */}
      {SESSIONS_LEFT === 0 && (
        <GlowCard className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle size={40} strokeWidth={1.75} className="text-amber mb-4" />
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('buyPackage')}</h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md">{t('buyPackageSub')}</p>
          <Link href="/app/packages" className="btn-gold text-sm">{t('buyPackage')}</Link>
        </GlowCard>
      )}

      {/* New interview form */}
      <GlowCard className="p-6">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{t('newInterview')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-muted)]">{t('field')}</label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="glass-input w-full text-sm">
                <SelectValue placeholder={t('fieldPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                {fieldOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-[var(--text-primary)] focus:bg-white/5">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-muted)]">{t('experience')}</label>
            <Select value={experience} onValueChange={setExperience}>
              <SelectTrigger className="glass-input w-full text-sm">
                <SelectValue placeholder={t('experiencePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                {expOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-[var(--text-primary)] focus:bg-white/5">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-muted)]">{t('type')}</label>
            <Select value={interviewType} onValueChange={setInterviewType}>
              <SelectTrigger className="glass-input w-full text-sm">
                <SelectValue placeholder={t('typePlaceholder')} />
              </SelectTrigger>
              <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-[var(--text-primary)] focus:bg-white/5">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Interviewer gender cards */}
        <div className="mt-4 space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('interviewerGender')}</label>
          <div className="grid grid-cols-2 gap-3 max-w-xs">
            <button
              type="button"
              onClick={() => setInterviewer('fahd')}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${interviewer === 'fahd' ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}
            >
              <InterviewAvatar who="fahd" size="md" />
              <span className={`text-sm font-medium ${interviewer === 'fahd' ? 'text-gold' : 'text-[var(--text-muted)]'}`}>
                فهد
              </span>
            </button>
            <button
              type="button"
              onClick={() => setInterviewer('noora')}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${interviewer === 'noora' ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}
            >
              <InterviewAvatar who="noora" size="md" />
              <span className={`text-sm font-medium ${interviewer === 'noora' ? 'text-gold' : 'text-[var(--text-muted)]'}`}>
                نورة
              </span>
            </button>
          </div>
        </div>

        {/* Warning + Start */}
        <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-faint)] flex items-center gap-1.5">
            <AlertTriangle size={14} strokeWidth={1.75} className="text-amber" />
            {t('warningSessions', { count: SESSIONS_LEFT })}
          </p>
          <Button onClick={handleStart} className="btn-gold text-sm cursor-pointer">
            {t('startInterview')}
          </Button>
        </div>
      </GlowCard>

      {/* Recent interviews */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">{t('recentInterviews')}</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('industry')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('status')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('score')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('date')}</th>
              </tr>
            </thead>
            <tbody>
              {recentInterviews.map((interview) => (
                <tr
                  key={interview.id}
                  className="border-b border-white/[0.05] last:border-0 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{interview.industry}</td>
                  <td className="px-4 py-3">{statusBadge(interview.status)}</td>
                  <td className="px-4 py-3">
                    {interview.score !== null ? (
                      <span className={`font-bold ${interview.score >= 80 ? 'text-emerald' : 'text-amber'}`}>{interview.score}</span>
                    ) : (
                      <span className="text-[var(--text-faint)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)]">{interview.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
