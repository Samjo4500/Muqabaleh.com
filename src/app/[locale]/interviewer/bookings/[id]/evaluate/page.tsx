'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
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
import { localePath } from '@/i18n/navigation';
import { toast } from 'sonner';

const criteriaKeys = [
  'criteriaContent',
  'criteriaClarity',
  'criteriaConfidence',
  'criteriaCultural',
] as const;

const scoreField = ['content', 'clarity', 'confidence', 'cultural'] as const;

export default function EvaluatePage() {
  const t = useTranslations('interviewerPanel');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const params = useParams();
  const id = String(params.id || '');
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [status, setStatus] = useState('');
  const [scores, setScores] = useState<number[]>([70, 70, 70, 70]);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [recommendation, setRecommendation] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/interviewer/bookings/${id}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        if (cancelled) return;
        const b = data.booking;
        setCandidateName(b.candidateName || '');
        setStatus(b.status || '');
        const ev = b.evaluation || {};
        if (ev.scores) {
          setScores([
            Number(ev.scores.content) || 70,
            Number(ev.scores.clarity) || 70,
            Number(ev.scores.confidence) || 70,
            Number(ev.scores.cultural) || 70,
          ]);
        } else if (typeof b.interviewerRating === 'number') {
          setScores([b.interviewerRating, b.interviewerRating, b.interviewerRating, b.interviewerRating]);
        }
        setStrengths(String(ev.strengths || ''));
        setImprovements(String(ev.improvements || ''));
        setRecommendation(String(ev.recommendation || ''));
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function onSubmit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/interviewer/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores: {
            content: scores[0],
            clarity: scores[1],
            confidence: scores[2],
            cultural: scores[3],
          },
          strengths,
          improvements,
          recommendation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(isAr ? 'تم حفظ التقييم' : 'Evaluation saved');
      setStatus(data.booking?.status || status);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isAr ? 'جارٍ التحميل…' : 'Loading…'}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link
          href={localePath('/interviewer/bookings', locale)}
          className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-teal-300"
        >
          <BackArrow size={18} />
          {tCommon('back')}
        </Link>
        <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={localePath('/interviewer/bookings', locale)}
        className="inline-flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-teal-300"
      >
        <BackArrow size={18} strokeWidth={1.75} />
        {tCommon('back')}
      </Link>

      <div>
        <h1 className="mq-display text-2xl font-bold text-white">
          {t('evalTitle')} — {candidateName}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          {isAr ? 'الحالة:' : 'Status:'} {status}
        </p>
      </div>

      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-white">
          {t('criteriaContent')} / {t('criteriaClarity')} / {t('criteriaConfidence')} /{' '}
          {t('criteriaCultural')}
        </h2>
        <div className="space-y-6">
          {criteriaKeys.map((key, i) => (
            <div key={key}>
              <ScoreBar label={t(key)} value={scores[i]} max={100} />
              <Slider
                value={[scores[i]]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => {
                  const next = [...scores];
                  next[i] = v[0] ?? 0;
                  setScores(next);
                }}
                className="mt-2"
              />
              <span className="sr-only">{scoreField[i]}</span>
            </div>
          ))}
        </div>
      </GlowCard>

      <GlowCard className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">{t('strengths')}</label>
          <Textarea
            value={strengths}
            onChange={(e) => setStrengths(e.target.value)}
            rows={3}
            className="glass-input"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">{t('improvements')}</label>
          <Textarea
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            rows={3}
            className="glass-input"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-white/60">
            {t('recommendation')}
          </label>
          <Select value={recommendation || undefined} onValueChange={setRecommendation}>
            <SelectTrigger className="glass-input w-full max-w-sm">
              <SelectValue placeholder={isAr ? 'اختر' : 'Select'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STRONG_YES">{isAr ? 'نعم بقوة' : 'Strong yes'}</SelectItem>
              <SelectItem value="YES">{isAr ? 'نعم' : 'Yes'}</SelectItem>
              <SelectItem value="MAYBE">{isAr ? 'ربما' : 'Maybe'}</SelectItem>
              <SelectItem value="NO">{isAr ? 'لا' : 'No'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </GlowCard>

      <Button
        type="button"
        onClick={() => void onSubmit()}
        disabled={saving}
        className="min-w-[160px] cursor-pointer bg-teal-400 text-[#070b14] hover:bg-teal-300"
      >
        {saving ? <Loader2 className="animate-spin" size={16} /> : tCommon('submit')}
      </Button>
    </div>
  );
}
