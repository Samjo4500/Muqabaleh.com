'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { GlowCard, ScoreBar } from '@/components/brand';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';

const candidateMap: Record<string, string> = {
  '1': 'cand1Name',
  '2': 'cand2Name',
  '3': 'cand3Name',
};

const questionKeys = ['question1', 'question2', 'question3'] as const;
const criteriaKeys = ['criteriaContent', 'criteriaClarity', 'criteriaConfidence', 'criteriaCultural'] as const;

export default function EvaluatePage() {
  const t = useTranslations('interviewerPanel');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const id = (params.id as string) || '1';

  const candidateKey = candidateMap[id] || 'cand1Name';
  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  const [scores, setScores] = useState<number[]>([72, 85, 60, 78]);
  const [answers, setAnswers] = useState(['', '', '']);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [recommendation, setRecommendation] = useState('');

  return (
    <div className="space-y-6">
      <Link
        href={localePath('/interviewer/bookings', locale)}
        className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-teal-300"
      >
        <BackArrow size={18} strokeWidth={1.75} />
        {tCommon('back')}
      </Link>

      <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
        {locale === 'ar'
          ? 'واجهة تقييم تجريبية ببيانات عيّنة. الربط الكامل بحجوزات حقيقية قادم.'
          : 'Sample evaluation UI with demo candidate data. Full booking wiring comes next.'}
      </div>

      <h1 className="text-2xl font-bold text-white">
        {t('evalTitle')} — {t(candidateKey)}
      </h1>

      {/* Criteria Sliders */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('criteriaContent')} / {t('criteriaClarity')} / {t('criteriaConfidence')} / {t('criteriaCultural')}
        </h2>
        <div className="space-y-6">
          {criteriaKeys.map((key, i) => (
            <div key={key}>
              <ScoreBar
                label={t(key)}
                value={scores[i]}
                max={100}
              />
              <Slider
                value={[scores[i]]}
                onValueChange={(v) => {
                  const next = [...scores];
                  next[i] = v[0];
                  setScores(next);
                }}
                max={100}
                step={1}
                className="mt-2"
              />
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Required Question Answers */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('requiredAnswers')}
        </h2>
        <div className="space-y-4">
          {questionKeys.map((qKey, i) => (
            <div key={qKey} className="space-y-2">
              <label className="text-sm font-medium text-[var(--text-primary)]">
                {t(qKey)}
              </label>
              <Textarea
                value={answers[i]}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                placeholder={t('answerPlaceholder')}
                className="glass-input min-h-[100px] border-white/10"
              />
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Strengths & Improvements */}
      <div className="grid gap-4 md:grid-cols-2">
        <GlowCard>
          <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">
            {t('strengths')}
          </h2>
          <Textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            placeholder={t('strengthsPlaceholder')}
            className="glass-input min-h-[120px] border-white/10"
          />
        </GlowCard>
        <GlowCard>
          <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">
            {t('improvements')}
          </h2>
          <Textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder={t('improvementsPlaceholder')}
            className="glass-input min-h-[120px] border-white/10"
          />
        </GlowCard>
      </div>

      {/* Recommendation */}
      <GlowCard>
        <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">
          {t('recommendation')}
        </h2>
        <Select value={recommendation} onValueChange={setRecommendation}>
          <SelectTrigger className="glass-input border-white/10">
            <SelectValue placeholder={t('recommendation')} />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[var(--bg-panel)]">
            <SelectItem value="yes">{t('recommendYes')}</SelectItem>
            <SelectItem value="consider">{t('recommendConsider')}</SelectItem>
            <SelectItem value="no">{t('recommendNo')}</SelectItem>
          </SelectContent>
        </Select>
      </GlowCard>

      {/* Submit */}
      <div className="flex justify-end">
        <Button className="mq-btn mq-btn-primary min-w-[140px]">{tCommon('submit')}</Button>
      </div>
    </div>
  );
}
