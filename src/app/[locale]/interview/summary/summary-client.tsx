'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { localePath } from '@/i18n/navigation';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import type { InterviewPlan } from '@/lib/interview/plan-generator';
import { trackInterviewStarted } from '@/lib/analytics-ga';

type Stored = {
  sessionId: string;
  prequalId: string;
  plan: InterviewPlan;
  email: string;
};

export function SummaryClient({
  sessionId,
  email,
}: {
  sessionId: string;
  email: string;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [stored, setStored] = useState<Stored | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mq_interview_plan');
      if (!raw) {
        router.replace(localePath('/interview/prequal', locale));
        return;
      }
      const parsed = JSON.parse(raw) as Stored;
      if (sessionId && parsed.sessionId !== sessionId) {
        // still allow if sessionId query missing mismatch lightly
      }
      setStored(parsed);
    } catch {
      router.replace(localePath('/interview/prequal', locale));
    }
  }, [locale, router, sessionId]);

  const start = async () => {
    if (!stored) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: stored.sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start');
      const form = (
        stored as {
          form?: { targetRole?: string; languagePreference?: string };
        }
      ).form;
      trackInterviewStarted({
        language: form?.languagePreference,
        role: form?.targetRole,
        locale,
      });
      router.push(localePath(`/interview/session/${stored.sessionId}`, locale));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start');
      setLoading(false);
    }
  };

  if (!stored) {
    return (
      <AtelierFlowShell showBack={false}>
        <div className="flex flex-1 items-center justify-center text-white/55">
          {isAr ? 'جارٍ التحميل…' : 'Loading…'}
        </div>
      </AtelierFlowShell>
    );
  }

  const plan = stored.plan;

  return (
    <AtelierFlowShell
      trailing={
        <span className="hidden truncate text-xs text-white/55 sm:block sm:max-w-[200px]">
          {email}
        </span>
      }
    >
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="mq-display text-3xl text-white md:text-4xl">
          {isAr ? 'خطة مقابلتك' : 'Your Interview Plan'}
        </h1>
        <p className="mt-2 text-sm text-white/55">{plan.title}</p>

        <div className="mt-8 space-y-3">
          {[
            [isAr ? 'اللغة' : 'Language', plan.language],
            [
              isAr ? 'المدة التقديرية' : 'Estimated duration',
              `${plan.estimatedDuration} ${isAr ? 'دقيقة' : 'min'}`,
            ],
            [isAr ? 'عدد الأسئلة' : 'Questions', String(plan.numQuestions)],
            [isAr ? 'محاور التركيز' : 'Focus areas', plan.focusAreas.join(' · ')],
          ].map(([label, value]) => (
            <div key={String(label)} className="mq-panel rounded-2xl px-4 py-3">
              <div className="text-xs text-white/50">{label}</div>
              <div className="mt-1 text-white">{value}</div>
            </div>
          ))}
        </div>

        {plan.coachingTips?.length ? (
          <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/5 px-4 py-4">
            <div className="text-sm font-medium text-teal-200">
              {isAr ? 'نصائح تدريب' : 'Coaching tips'}
            </div>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-white/55">
              {plan.coachingTips.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={localePath('/interview/prequal', locale)}
            className="mq-btn mq-btn-ghost px-5 py-3 text-center text-sm"
          >
            {isAr ? 'رجوع للتعديل' : 'Go Back'}
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={start}
            className="mq-btn mq-btn-primary flex-1 px-5 py-3 text-sm disabled:opacity-60"
          >
            {loading
              ? isAr
                ? 'جارٍ البدء…'
                : 'Starting…'
              : isAr
                ? 'ابدأ المقابلة'
                : 'Start Interview'}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      </main>
    </AtelierFlowShell>
  );
}
