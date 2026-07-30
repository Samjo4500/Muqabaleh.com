'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Plus, X, Upload, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const INDUSTRIES = ['sectorTech', 'sectorFinance', 'sectorHealthcare', 'sectorEducation', 'sectorEngineering', 'sectorMarketing', 'sectorHr', 'sectorOther'] as const;

export default function NewJobPage() {
  const t = useTranslations('b2b.jobs');
  const tAuth = useTranslations('auth');
  const tSettings = useTranslations('b2b.settings');
  const tCommon = useTranslations('common');

  const [mode, setMode] = useState('ai');
  const [assignmentMode, setAssignmentMode] = useState('auto');
  const [questions, setQuestions] = useState(['']);

  const addQuestion = () => {
    if (questions.length < 5) {
      setQuestions((prev) => [...prev, '']);
    }
  };

  const removeQuestion = (i: number) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateQuestion = (i: number, val: string) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === i ? val : q)));
  };

  const handleCreate = () => {
    toast.info(tCommon('comingSoon'));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/b2b/jobs" className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-gold">
          <ArrowRight size={20} strokeWidth={1.75} />
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('newTitle')}</h1>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-6">
        {/* Job title */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">{t('jobTitle')}</Label>
          <Input placeholder={t('jobTitlePlaceholder')} className="glass-input" />
        </div>

        {/* Industry + Type row */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('industry')}</Label>
            <Select>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder={t('industryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>{tAuth(ind)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-[var(--text-muted)]">{t('type')}</Label>
            <Select>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder={t('typePlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="behavioral">{t('typeBehavioral')}</SelectItem>
                <SelectItem value="technical">{t('typeTechnical')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mode: AI vs Human */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">{t('mode')}</Label>
          <RadioGroup value={mode} onValueChange={setMode} className="flex gap-4">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ai" id="mode-ai" className="border-white/20 text-gold" />
              <Label htmlFor="mode-ai" className="cursor-pointer text-sm text-[var(--text-primary)]">{t('modeAI')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="human" id="mode-human" className="border-white/20 text-gold" />
              <Label htmlFor="mode-human" className="cursor-pointer text-sm text-[var(--text-primary)]">{t('modeHuman')}</Label>
            </div>
          </RadioGroup>
          {mode === 'human' && (
            <p className="text-xs text-amber">{t('modeHumanNote')}</p>
          )}
        </div>

        {/* Human mode: assignment mode */}
        {mode === 'human' && (
          <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <Label className="text-sm text-[var(--text-muted)]">{t('assignmentMode')}</Label>
            <RadioGroup value={assignmentMode} onValueChange={setAssignmentMode} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="auto" id="assign-auto" className="border-white/20 text-gold" />
                <Label htmlFor="assign-auto" className="cursor-pointer text-sm text-[var(--text-primary)]">{t('assignmentAuto')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="panel" id="assign-panel" className="border-white/20 text-gold" />
                <Label htmlFor="assign-panel" className="cursor-pointer text-sm text-[var(--text-primary)]">{t('assignmentPanel')}</Label>
              </div>
            </RadioGroup>

            {assignmentMode === 'panel' && (
              <div className="space-y-3 pt-2">
                <Label className="text-sm text-[var(--text-muted)]">{t('interviewers')}</Label>
                <Select>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder={t('interviewerPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="huda">{tSettings('interviewer1Name')}</SelectItem>
                    <SelectItem value="sultan">{tSettings('interviewer2Name')}</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="glass-input">
                    <SelectValue placeholder={t('interviewerPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="huda2">{tSettings('interviewer1Name')}</SelectItem>
                    <SelectItem value="sultan2">{tSettings('interviewer2Name')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        )}

        {/* Must-ask questions */}
        <div className="space-y-3">
          <Label className="text-sm text-[var(--text-muted)]">{t('mustAskQuestions')}</Label>
          {questions.map((q, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                value={q}
                onChange={(e) => updateQuestion(i, e.target.value)}
                placeholder={t('mustAskPlaceholder')}
                className="glass-input"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="shrink-0 rounded-lg p-2 text-[var(--text-faint)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                  aria-label={tCommon('delete')}
                >
                  <X size={18} strokeWidth={1.75} />
                </button>
              )}
            </div>
          ))}
          {questions.length < 5 && (
            <button
              type="button"
              onClick={addQuestion}
              className="flex items-center gap-2 text-sm text-gold transition-colors hover:text-gold-hover"
            >
              <Plus size={16} strokeWidth={1.75} />
              {t('addQuestion')}
            </button>
          )}
        </div>

        {/* Invite deadline */}
        <div className="space-y-2">
          <Label className="text-sm text-[var(--text-muted)]">{t('inviteDeadline')}</Label>
          <Input type="date" className="glass-input" />
        </div>

        {/* Candidates */}
        <div className="space-y-3">
          <Label className="text-sm text-[var(--text-muted)]">{t('candidates')}</Label>
          <Textarea
            placeholder={t('candidatesPlaceholder')}
            rows={4}
            className="glass-input min-h-[100px] resize-y"
          />
          <div className="flex items-center gap-4">
            <div className="relative">
              <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" aria-label="CSV" />
              <button type="button" className="flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-gold">
                <Upload size={16} strokeWidth={1.75} />
                {t('orUpload')}
              </button>
            </div>
            <button type="button" className="flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-gold">
              <Download size={16} strokeWidth={1.75} />
              {t('downloadTemplate')}
            </button>
          </div>
        </div>

        {/* Create button */}
        <div className="pt-2">
          <Button onClick={handleCreate} className="btn-gold w-full cursor-pointer">
            {t('create')}
          </Button>
        </div>
      </div>
    </div>
  );
}
