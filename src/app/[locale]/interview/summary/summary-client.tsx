'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { localePath } from '@/i18n/navigation';
import { AppChromeHeader } from '@/components/chrome/AppChromeHeader';
import type { InterviewPlan } from '@/lib/interview/plan-generator';

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
      router.push(localePath(`/interview/session/${stored.sessionId}`, locale));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start');
      setLoading(false);
    }
  };

  if (!stored) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-deep)] text-[var(--text-secondary)]">
        {isAr ? 'جارٍ التحميل…' : 'Loading…'}
      </div>
    );
  }

  const plan = stored.plan;

  return (
    <div className="relative min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-teal-400/15 blur-[120px]" />
      </div>
      <AppChromeHeader
        trailing={
          <span className="hidden truncate text-xs text-[var(--text-secondary)] sm:block sm:max-w-[200px]">
            {email}
          </span>
        }
      />

      <main className="relative z-10 mx-auto max-w-3xl px-4 py-10">
        <p className="text-sm uppercase tracking-[0.18em] text-teal-300/80">Muqabaleh</p>
        <h1 className="mt-2 font-display text-3xl md:text-4xl">
          {isAr ? 'خطة مقابلتك' : 'Your Interview Plan'}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{plan.title}</p>

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
            <div
              key={String(label)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
              <div className="mt-1">{value}</div>
            </div>
          ))}
        </div>

        {plan.coachingTips?.length ? (
          <div className="mt-6 rounded-2xl border border-teal-400/20 bg-teal-400/5 px-4 py-4">
            <div className="text-sm font-medium text-teal-200">
              {isAr ? 'نصائح تدريب' : 'Coaching tips'}
            </div>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-[var(--text-secondary)]">
              {plan.coachingTips.slice(0, 4).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={localePath('/interview/prequal', locale)}
            className="rounded-xl border border-white/15 px-5 py-3 text-center text-sm"
          >
            {isAr ? 'رجوع للتعديل' : 'Go Back'}
          </Link>
          <button
            type="button"
            disabled={loading}
            onClick={start}
            className="flex-1 rounded-xl bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg-deep)] disabled:opacity-60"
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
    </div>
  );
}
