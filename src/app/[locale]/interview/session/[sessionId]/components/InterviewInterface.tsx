'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import type { InterviewPlan, PlanQuestion } from '@/lib/interview/plan-generator';
import { Timer } from './Timer';
import { QuestionDisplay } from './QuestionDisplay';
import { FeedbackCard } from './FeedbackCard';

type Feedback = {
  contentScore: number;
  structureScore: number;
  confidenceScore: number;
  overallScore: number;
  feedbackText: string;
  feedbackTextAr?: string;
  improvementTip: string;
  improvementTipAr?: string;
};

export function InterviewInterface({ sessionId }: { sessionId: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [plan, setPlan] = useState<InterviewPlan | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [startedAt, setStartedAt] = useState<string>(new Date().toISOString());
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [nextAction, setNextAction] = useState<string>('next_question');
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [mode, setMode] = useState<'answer' | 'feedback' | 'followup' | 'done'>('answer');
  const [showTip, setShowTip] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const boot = async () => {
      try {
        const raw = sessionStorage.getItem('mq_interview_plan');
        let currentPlan: InterviewPlan | null = null;
        if (raw) {
          const parsed = JSON.parse(raw) as { sessionId: string; plan: InterviewPlan };
          if (parsed.sessionId === sessionId) currentPlan = parsed.plan;
        }
        if (!currentPlan) {
          // Resume: start endpoint returns first question; we need plan from prequal history — redirect to summary if missing
          router.replace(localePath('/interview/prequal', locale));
          return;
        }
        setPlan(currentPlan);
        await fetch('/api/interview/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        });
        setStartedAt(new Date().toISOString());
        setBooting(false);
      } catch {
        setError(isAr ? 'تعذّر تحميل الجلسة' : 'Failed to load session');
        setBooting(false);
      }
    };
    void boot();
  }, [sessionId, locale, router, isAr]);

  const question: PlanQuestion | null = useMemo(() => {
    if (!plan) return null;
    return plan.questions[index] ?? null;
  }, [plan, index]);

  const progressLabel = plan
    ? isAr
      ? `سؤال ${index + 1} من ${plan.numQuestions}`
      : `Question ${index + 1} of ${plan.numQuestions}`
    : '';

  const submit = useCallback(async () => {
    if (!question || !answer.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const elapsed = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);
      const endpoint = mode === 'followup' ? '/api/interview/follow-up' : '/api/interview/answer';
      const body =
        mode === 'followup'
          ? {
              sessionId,
              questionId: question.questionId,
              followUpAnswer: answer,
            }
          : {
              sessionId,
              questionId: question.questionId,
              userAnswer: answer,
              timeTakenSeconds: elapsed,
              startedAt,
            };
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFeedback(data.feedback);
      setNextAction(data.nextAction);
      setFollowUpQuestion(data.followUpQuestion || null);
      setMode('feedback');
      setAnswer('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, [answer, mode, question, sessionId, startedAt]);

  const goNext = () => {
    if (nextAction === 'final_report') {
      router.push(localePath(`/interview/report/${sessionId}`, locale));
      return;
    }
    if (nextAction === 'follow_up') {
      setMode('followup');
      setFeedback(null);
      setStartedAt(new Date().toISOString());
      setTimerKey((k) => k + 1);
      return;
    }
    setIndex((i) => i + 1);
    setMode('answer');
    setFeedback(null);
    setFollowUpQuestion(null);
    setShowTip(true);
    setStartedAt(new Date().toISOString());
    setTimerKey((k) => k + 1);
    setAnswer('');
  };

  if (booting) {
    return (
      <div className="mq-atelier flex min-h-screen items-center justify-center text-white/55">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="mq-orb mq-orb-a" />
          <div className="mq-orb mq-orb-b" />
        </div>
        <Loader2 className="me-2 h-5 w-5 animate-spin" />
        {isAr ? 'جارٍ تجهيز المقابلة…' : 'Preparing interview…'}
      </div>
    );
  }

  if (!plan || !question) {
    return (
      <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-4 text-white">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
          <div className="mq-orb mq-orb-a" />
          <div className="mq-orb mq-orb-b" />
        </div>
        <p>{error || (isAr ? 'الجلسة غير موجودة' : 'Session not found')}</p>
        <Link href={localePath('/interview/prequal', locale)} className="text-teal-300">
          {isAr ? 'ابدأ من التأهيل' : 'Start from pre-qual'}
        </Link>
      </div>
    );
  }

  const bilingual = plan.language === 'bilingual';
  const displayText =
    plan.language === 'arabic'
      ? question.questionTextAr || question.questionText
      : question.questionText;

  return (
    <div
      className="mq-atelier relative min-h-screen text-white"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <header className="relative z-20 border-b border-white/10 px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href={localePath('/', locale)} aria-label="Muqabaleh">
            <BrandLogo size="nav" priority />
          </Link>
          <div className="text-sm text-white/55">{progressLabel}</div>
          <Timer key={timerKey} seconds={question.timeLimit} warnAt={30} />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-8 md:px-6">
        <QuestionDisplay
          text={mode === 'followup' && followUpQuestion ? followUpQuestion : displayText}
          textAr={question.questionTextAr}
          bilingual={bilingual && mode !== 'followup'}
          coachingNote={question.coachingNote}
          showTip={showTip && mode === 'answer'}
          onDismissTip={() => setShowTip(false)}
          isAr={isAr}
        />

        {mode !== 'feedback' ? (
          <div className="mt-8 space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={8}
              placeholder={
                isAr ? 'اكتب إجابتك هنا…' : 'Type your answer here…'
              }
              className="w-full rounded-2xl border border-white/15 bg-black/25 px-4 py-3 text-sm outline-none focus:border-teal-400/40"
            />
            <button
              type="button"
              disabled={loading || !answer.trim()}
              onClick={submit}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-[var(--bg-deep)] disabled:opacity-40"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isAr ? 'إرسال الإجابة' : 'Submit Answer'}
            </button>
          </div>
        ) : feedback ? (
          <div className="mt-8">
            <FeedbackCard
              feedback={feedback}
              isAr={isAr}
              nextAction={nextAction}
              followUpQuestion={followUpQuestion}
              onNext={goNext}
              onFollowUp={() => {
                setMode('followup');
                setFeedback(null);
                setAnswer('');
                setStartedAt(new Date().toISOString());
              }}
            />
          </div>
        ) : null}

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
      </main>
    </div>
  );
}
