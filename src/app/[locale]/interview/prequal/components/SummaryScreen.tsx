'use client';

import { labelFor, ROLE_OPTIONS, SENIORITY_OPTIONS, QUESTION_TYPE_OPTIONS, ROUND_OPTIONS, LANGUAGE_OPTIONS, INDUSTRY_OPTIONS, WEAKNESS_OPTIONS, DURATION_OPTIONS } from '@/lib/interview/constants';
import type { PrequalFormState } from '../prequal-types';

export function SummaryScreen({
  data,
  isAr,
  onEdit,
  onStart,
  onBack,
  loading,
}: {
  data: PrequalFormState;
  isAr: boolean;
  onEdit: (step: number) => void;
  onStart: () => void;
  onBack: () => void;
  loading?: boolean;
}) {
  const lang = isAr ? 'ar' : 'en';
  const rows: Array<{ step: number; label: string; value: string }> = [
    {
      step: 1,
      label: isAr ? 'الدور المستهدف' : 'Target role',
      value: labelFor(ROLE_OPTIONS, data.targetRole, lang),
    },
    {
      step: 2,
      label: isAr ? 'المستوى' : 'Experience level',
      value: labelFor(SENIORITY_OPTIONS, data.seniorityLevel, lang),
    },
    {
      step: 3,
      label: isAr ? 'أنواع المقابلة' : 'Interview types',
      value: data.questionTypes
        .map((t) => labelFor(QUESTION_TYPE_OPTIONS, t, lang))
        .join(', '),
    },
    {
      step: 4,
      label: isAr ? 'الجولة' : 'Interview round',
      value: labelFor(ROUND_OPTIONS, data.interviewRound, lang),
    },
    {
      step: 5,
      label: isAr ? 'اللغة' : 'Language',
      value: labelFor(LANGUAGE_OPTIONS, data.languagePreference, lang),
    },
    {
      step: 6,
      label: isAr ? 'الصناعة' : 'Industry',
      value: data.targetIndustry
        ? labelFor(INDUSTRY_OPTIONS, data.targetIndustry, lang)
        : isAr
          ? 'تم التخطي'
          : 'Skipped',
    },
    {
      step: 7,
      label: isAr ? 'نقطة الضعف' : 'Weakness focus',
      value: data.weaknessFocus
        ? labelFor(WEAKNESS_OPTIONS, data.weaknessFocus, lang)
        : isAr
          ? 'تم التخطي'
          : 'Skipped',
    },
    {
      step: 8,
      label: isAr ? 'المدة' : 'Duration',
      value: (() => {
        const d = DURATION_OPTIONS.find((x) => x.value === data.durationPreset);
        if (!d) return data.durationPreset;
        return `${isAr ? d.ar : d.en} · ${d.numQuestions} ${isAr ? 'أسئلة' : 'questions'} · ~${d.estimatedDurationMin} ${isAr ? 'دقيقة' : 'min'}`;
      })(),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-[var(--text-primary)] md:text-3xl">
          {isAr ? 'خطة مقابلتك' : 'Your Interview Plan'}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {isAr
            ? 'راجع اختياراتك ثم ابدأ. لا يمكن بدء مقابلة مجانية دون استبيان التأهيل والتسجيل.'
            : 'Review your selections, then start. Free interviews require pre-qual and registration.'}
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div
            key={row.step}
            className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
                {row.label}
              </div>
              <div className="mt-1 text-[var(--text-primary)]">{row.value || '—'}</div>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="shrink-0 text-sm text-teal-300 hover:text-teal-200"
            >
              {isAr ? 'تعديل' : 'Edit'}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/15 px-5 py-3 text-sm text-[var(--text-primary)]"
        >
          {isAr ? 'رجوع' : 'Go Back'}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onStart}
          className="flex-1 rounded-xl bg-[var(--text-primary)] px-5 py-3 text-sm font-semibold text-[var(--bg-deep)] disabled:opacity-60"
        >
          {loading
            ? isAr
              ? 'جارٍ إنشاء الخطة…'
              : 'Generating plan…'
            : isAr
              ? 'ابدأ المقابلة'
              : 'Start Interview'}
        </button>
      </div>
    </div>
  );
}
