'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { InterviewAvatar } from '@/components/brand';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const FIELD_MAP: Record<string, string> = {
  it: 'IT',
  finance: 'FINANCE',
  medicine: 'MEDICINE',
  engineering: 'ENGINEERING',
  education: 'EDUCATION',
  marketing: 'MARKETING',
  sales: 'SALES',
  hr: 'HR',
};

const EXP_MAP: Record<string, string> = {
  junior: 'JUNIOR',
  mid: 'MID',
  senior: 'SENIOR',
  executive: 'EXECUTIVE',
};

const TYPE_MAP: Record<string, string> = {
  behavioral: 'BEHAVIORAL',
  technical: 'TECHNICAL',
};

export function NewInterviewForm({ sessionsLeft }: { sessionsLeft: number }) {
  const t = useTranslations('app.dashboard');
  const tRoom = useTranslations('app.room');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [field, setField] = useState('');
  const [experience, setExperience] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [interviewer, setInterviewer] = useState<'fahd' | 'noora' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!field || !experience || !interviewType || !interviewer) {
      toast.info(t('fieldPlaceholder'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industry: FIELD_MAP[field],
          experience: EXP_MAP[experience],
          type: TYPE_MAP[interviewType],
          interviewerGender: interviewer === 'fahd' ? 'MALE' : 'FEMALE',
          language: locale === 'ar' ? 'AR' : 'EN',
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        router.push(`/app/interview/${data.interviewId}`);
        return;
      }

      if (res.status === 403) {
        toast.error(tRoom('noSessions'), {
          action: {
            label: tRoom('noSessionsHint'),
            onClick: () => router.push('/app/packages'),
          },
        });
        return;
      }

      if (res.status === 409 && data.interviewId) {
        router.push(`/app/interview/${data.interviewId}`);
        return;
      }

      const errMsg = data.error?.[locale] || data.error?.ar || tCommon('error');
      toast.error(errMsg);
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="text-sm text-[var(--text-muted)]">{t('field')}</label>
          <Select value={field} onValueChange={setField}>
            <SelectTrigger className="glass-input w-full text-sm">
              <SelectValue placeholder={t('fieldPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="bg-[var(--bg-panel)] border-white/10">
              {fieldOptions.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-[var(--text-primary)] focus:bg-white/5"
                >
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
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-[var(--text-primary)] focus:bg-white/5"
                >
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
                <SelectItem
                  key={o.value}
                  value={o.value}
                  className="text-[var(--text-primary)] focus:bg-white/5"
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Interviewer gender cards */}
      <div className="space-y-1.5">
        <label className="text-sm text-[var(--text-muted)]">{t('interviewerGender')}</label>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          <button
            type="button"
            onClick={() => setInterviewer('fahd')}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors cursor-pointer ${
              interviewer === 'fahd'
                ? 'border-gold bg-gold/10'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <InterviewAvatar who="fahd" size="md" />
            <span
              className={`text-sm font-medium ${
                interviewer === 'fahd' ? 'text-gold' : 'text-[var(--text-muted)]'
              }`}
            >
              {'\u0641\u0647\u062F'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInterviewer('noora')}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors cursor-pointer ${
              interviewer === 'noora'
                ? 'border-gold bg-gold/10'
                : 'border-white/10 bg-white/[0.03] hover:border-white/20'
            }`}
          >
            <InterviewAvatar who="noora" size="md" />
            <span
              className={`text-sm font-medium ${
                interviewer === 'noora' ? 'text-gold' : 'text-[var(--text-muted)]'
              }`}
            >
              {'\u0646\u0648\u0631\u0629'}
            </span>
          </button>
        </div>
      </div>

      {/* Warning + Start */}
      <div className="mt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-faint)] flex items-center gap-1.5">
          <AlertTriangle size={14} strokeWidth={1.75} className="text-amber" />
          {t('warningSessions', { count: sessionsLeft })}
        </p>
        <Button onClick={handleStart} className="btn-gold text-sm cursor-pointer" disabled={loading}>
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t('startInterview')}
        </Button>
      </div>
    </div>
  );
}
