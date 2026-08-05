'use client';

import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { localePath } from '@/i18n/navigation';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import {
  DURATION_OPTIONS,
  INDUSTRY_OPTIONS,
  LANGUAGE_OPTIONS,
  QUESTION_TYPE_OPTIONS,
  ROLE_OPTIONS,
  ROUND_OPTIONS,
  SENIORITY_OPTIONS,
  WEAKNESS_OPTIONS,
} from '@/lib/interview/constants';
import { ProgressBar } from './components/ProgressBar';
import { QuestionCard } from './components/QuestionCard';
import { Stepper } from './components/Stepper';
import { SummaryScreen } from './components/SummaryScreen';
import { EMPTY_PREQUAL, type PrequalFormState } from './prequal-types';

const TOTAL_STEPS = 9; // 8 questions + summary

export function PrequalClient({ email }: { email: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PrequalFormState>(() => ({
    ...EMPTY_PREQUAL,
    languagePreference: isAr ? 'arabic' : 'english',
  }));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roleQuery, setRoleQuery] = useState('');

  const titles = useMemo(
    () => [
      '',
      isAr ? 'ما هو دورك الوظيفي المستهدف؟' : 'What is your target job role?',
      isAr ? 'ما هو مستوى خبرتك؟' : 'What is your experience level?',
      isAr
        ? 'ما نوع المقابلة التي تريد التدرّب عليها؟'
        : 'What type of interview do you want to practice?',
      isAr
        ? 'أي جولة مقابلة تستعد لها؟'
        : 'Which interview round are you preparing for?',
      isAr
        ? 'بأي لغة تريد المقابلة؟'
        : 'What language do you want the interview in?',
      isAr
        ? 'ما الصناعة التي تستهدفها؟ (اختياري)'
        : 'What industry are you targeting? (Optional)',
      isAr
        ? 'ما أكبر نقطة ضعف لديك في المقابلات؟ (اختياري)'
        : 'What is your biggest interview weakness? (Optional)',
      isAr ? 'كم تريد أن تستغرق المقابلة؟' : 'How long do you want the interview to be?',
      isAr ? 'خطة مقابلتك' : 'Your Interview Plan',
    ],
    [isAr],
  );

  const filteredRoles = ROLE_OPTIONS.filter((r) => {
    const q = roleQuery.trim().toLowerCase();
    if (!q) return true;
    return r.en.toLowerCase().includes(q) || r.ar.includes(roleQuery) || r.value.includes(q);
  });

  const canNext = () => {
    if (step === 1) return Boolean(form.targetRole);
    if (step === 2) return Boolean(form.seniorityLevel);
    if (step === 3) return form.questionTypes.length >= 1;
    if (step === 4) return Boolean(form.interviewRound);
    if (step === 5) return Boolean(form.languagePreference);
    if (step === 6 || step === 7) return true;
    if (step === 8) return Boolean(form.durationPreset);
    return true;
  };

  const toggleType = (value: string) => {
    setForm((prev) => {
      const has = prev.questionTypes.includes(value);
      if (has) {
        return { ...prev, questionTypes: prev.questionTypes.filter((t) => t !== value) };
      }
      if (prev.questionTypes.length >= 3) return prev;
      return { ...prev, questionTypes: [...prev.questionTypes, value] };
    });
  };

  const startInterview = async () => {
    setError(null);
    if (!email) {
      setError(
        isAr
          ? 'يجب التسجيل وبريد إلكتروني قبل بدء المقابلة.'
          : 'Registration with email is required before starting an interview.',
      );
      router.push(
        localePath(`/auth/register?callbackUrl=${encodeURIComponent('/interview/prequal')}`, locale),
      );
      return;
    }
    if (
      !form.targetRole ||
      !form.seniorityLevel ||
      form.questionTypes.length < 1 ||
      !form.interviewRound ||
      !form.languagePreference ||
      !form.durationPreset
    ) {
      setError(isAr ? 'أكمل الحقول المطلوبة أولاً.' : 'Complete required fields first.');
      return;
    }

    setLoading(true);
    try {
      const prequalRes = await fetch('/api/interview/prequal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const prequalData = await prequalRes.json();
      if (!prequalRes.ok) {
        if (prequalRes.status === 401 || prequalData.code === 'AUTH_REQUIRED') {
          router.push(
            localePath(
              `/auth/register?callbackUrl=${encodeURIComponent('/interview/prequal')}`,
              locale,
            ),
          );
          return;
        }
        throw new Error(prequalData.error || 'Failed to save pre-qual');
      }

      const planRes = await fetch('/api/interview/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prequalId: prequalData.prequalId }),
      });
      const planData = await planRes.json();
      if (!planRes.ok) throw new Error(planData.error || 'Failed to generate plan');

      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'mq_interview_plan',
          JSON.stringify({
            prequalId: planData.prequalId,
            sessionId: planData.sessionId,
            plan: planData.plan,
            form,
            email,
          }),
        );
      }
      router.push(localePath(`/interview/summary?sessionId=${planData.sessionId}`, locale));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <AtelierFlowShell
      trailing={
        <div className="hidden truncate text-xs text-white/55 sm:block sm:max-w-[200px] sm:text-sm">
          {email}
        </div>
      }
    >
      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="mq-display text-xl font-medium text-white md:text-2xl">
            {isAr ? 'خصّص مقابلتك' : 'Personalize your interview'}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            {isAr
              ? 'أجب عن بضعة أسئلة لنجهّز جلسة تناسب دورك ومستواك.'
              : 'Answer a few questions so we can tailor a session to your role and level.'}
          </p>
        </div>

        <div className="mb-6">
          <ProgressBar
            step={step}
            total={TOTAL_STEPS}
            label={isAr ? 'التقدّم' : 'Progress'}
          />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur md:p-8">
          <Stepper stepKey={step}>
            {step < 9 ? (
              <>
                <h2 className="mb-5 text-xl font-medium md:text-2xl">{titles[step]}</h2>

                {step === 1 && (
                  <div className="space-y-3">
                    <input
                      value={roleQuery}
                      onChange={(e) => setRoleQuery(e.target.value)}
                      placeholder={isAr ? 'ابحث عن دور…' : 'Search roles…'}
                      className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-sm outline-none focus:border-teal-400/50"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      {filteredRoles.map((r) => (
                        <QuestionCard
                          key={r.value}
                          selected={form.targetRole === r.value}
                          title={isAr ? r.ar : r.en}
                          onClick={() => setForm((p) => ({ ...p, targetRole: r.value }))}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {SENIORITY_OPTIONS.map((o) => (
                      <QuestionCard
                        key={o.value}
                        selected={form.seniorityLevel === o.value}
                        title={isAr ? o.ar : o.en}
                        subtitle={isAr ? o.hintAr : o.hintEn}
                        onClick={() => setForm((p) => ({ ...p, seniorityLevel: o.value }))}
                      />
                    ))}
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-3">
                    <p className="text-sm text-[var(--text-secondary)]">
                      {isAr ? 'اختر حتى ٣ أنواع' : 'Select up to 3 types'}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {QUESTION_TYPE_OPTIONS.map((o) => (
                        <QuestionCard
                          key={o.value}
                          selected={form.questionTypes.includes(o.value)}
                          title={isAr ? o.ar : o.en}
                          onClick={() => toggleType(o.value)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {ROUND_OPTIONS.map((o) => (
                      <QuestionCard
                        key={o.value}
                        selected={form.interviewRound === o.value}
                        title={isAr ? o.ar : o.en}
                        onClick={() => setForm((p) => ({ ...p, interviewRound: o.value }))}
                      />
                    ))}
                  </div>
                )}

                {step === 5 && (
                  <div className="grid gap-3">
                    {LANGUAGE_OPTIONS.map((o) => (
                      <QuestionCard
                        key={o.value}
                        selected={form.languagePreference === o.value}
                        title={isAr ? o.ar : o.en}
                        onClick={() =>
                          setForm((p) => ({ ...p, languagePreference: o.value }))
                        }
                      />
                    ))}
                  </div>
                )}

                {step === 6 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {INDUSTRY_OPTIONS.map((o) => (
                      <QuestionCard
                        key={o.value}
                        selected={form.targetIndustry === o.value}
                        title={isAr ? o.ar : o.en}
                        onClick={() => setForm((p) => ({ ...p, targetIndustry: o.value }))}
                      />
                    ))}
                  </div>
                )}

                {step === 7 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {WEAKNESS_OPTIONS.map((o) => (
                      <QuestionCard
                        key={o.value}
                        selected={form.weaknessFocus === o.value}
                        title={isAr ? o.ar : o.en}
                        onClick={() => setForm((p) => ({ ...p, weaknessFocus: o.value }))}
                      />
                    ))}
                  </div>
                )}

                {step === 8 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {DURATION_OPTIONS.map((o) => (
                      <QuestionCard
                        key={o.value}
                        selected={form.durationPreset === o.value}
                        title={isAr ? o.ar : o.en}
                        subtitle={`${o.numQuestions} ${isAr ? 'أسئلة' : 'questions'} · ~${o.estimatedDurationMin} ${isAr ? 'د' : 'min'}`}
                        onClick={() => setForm((p) => ({ ...p, durationPreset: o.value }))}
                      />
                    ))}
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => setStep((s) => s - 1)}
                      className="rounded-xl border border-white/15 px-5 py-3 text-sm"
                    >
                      {isAr ? 'رجوع' : 'Back'}
                    </button>
                  ) : null}

                  {(step === 6 || step === 7) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (step === 6) setForm((p) => ({ ...p, targetIndustry: null }));
                        if (step === 7) setForm((p) => ({ ...p, weaknessFocus: null }));
                        setStep((s) => s + 1);
                      }}
                      className="rounded-xl border border-white/15 px-5 py-3 text-sm"
                    >
                      {isAr ? 'تخطّي' : 'Skip'}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!canNext()}
                    onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
                    className="ms-auto rounded-xl bg-teal-300 px-5 py-3 text-sm font-semibold text-[var(--bg-deep)] disabled:opacity-40"
                  >
                    {isAr ? 'التالي' : 'Next'}
                  </button>
                </div>
              </>
            ) : (
              <SummaryScreen
                data={form}
                isAr={isAr}
                loading={loading}
                onEdit={(s) => setStep(s)}
                onBack={() => setStep(8)}
                onStart={startInterview}
              />
            )}
          </Stepper>

          {error ? (
            <p className="mt-4 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </main>
    </AtelierFlowShell>
  );
}
