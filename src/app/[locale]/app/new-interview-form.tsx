'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { InterviewAvatar } from '@/components/brand';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export function NewInterviewForm({ sessionsLeft }: { sessionsLeft: number }) {
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
    toast.info(
      sessionsLeft > 0
        ? 'ستتوفر هذه الميزة في المرحلة القادمة'
        : 'ستتوفر هذه الميزة في المرحلة القادمة',
    );
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
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
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
              فهد
            </span>
          </button>
          <button
            type="button"
            onClick={() => setInterviewer('noora')}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors ${
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
              نورة
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
        <Button onClick={handleStart} className="btn-gold text-sm cursor-pointer">
          {t('startInterview')}
        </Button>
      </div>
    </div>
  );
}
