'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { AtelierFlowShell } from '@/components/landing/crystal/AtelierFlowShell';
import type { FinalReport } from '@/lib/ai/report-generator';
import { ScoreCircle } from './components/ScoreCircle';
import { StrengthCard } from './components/StrengthCard';
import { WeaknessCard } from './components/WeaknessCard';
import { ActionItemCard } from './components/ActionItemCard';
import { QuestionBreakdown } from './components/QuestionBreakdown';

export function ReportClient({ sessionId }: { sessionId: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [report, setReport] = useState<FinalReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [langToggle, setLangToggle] = useState<'en' | 'ar'>(isAr ? 'ar' : 'en');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/interview/report/${sessionId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load report');
        setReport(data.report as FinalReport);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error');
      }
    };
    void load();
  }, [sessionId]);

  if (error) {
    return (
      <AtelierFlowShell>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-white">
          <p className="text-rose-300">{error}</p>
          <Link href={localePath('/interview/prequal', locale)} className="text-teal-300">
            {isAr ? 'تدرّب مجدداً' : 'Practice again'}
          </Link>
        </div>
      </AtelierFlowShell>
    );
  }

  if (!report) {
    return (
      <AtelierFlowShell showBack={false}>
        <div className="flex flex-1 items-center justify-center text-white/55">
          <Loader2 className="me-2 h-5 w-5 animate-spin" />
          {isAr ? 'جارٍ إنشاء التقرير…' : 'Generating report…'}
        </div>
      </AtelierFlowShell>
    );
  }

  const summary = langToggle === 'ar' ? report.summaryAr : report.summary;
  const strengths = langToggle === 'ar' ? report.strengthsAr : report.strengths;
  const weaknesses = langToggle === 'ar' ? report.weaknessesAr : report.weaknesses;

  return (
    <AtelierFlowShell
      trailing={
        <button
          type="button"
          onClick={() => setLangToggle((v) => (v === 'en' ? 'ar' : 'en'))}
          className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-teal-300/40 hover:text-teal-300"
        >
          {langToggle === 'en' ? 'العربية' : 'English'}
        </button>
      }
    >
      <main className="mx-auto w-full max-w-3xl space-y-10 px-4 py-10 md:px-6">
        <div className="text-center">
          <h1 className="mq-display text-3xl text-white md:text-4xl">
            {isAr ? 'تقرير المقابلة' : 'Interview Report'}
          </h1>
        </div>

        <ScoreCircle score={report.overallScore} grade={report.grade} isAr={isAr} />

        <section className="mq-panel rounded-2xl p-5">
          <h2 className="text-lg font-medium text-white">{isAr ? 'الملخص' : 'Summary'}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/60">{summary}</p>
          <p className="mt-4 text-sm text-teal-200">
            {langToggle === 'ar'
              ? report.benchmarkComparison.messageAr
              : report.benchmarkComparison.message}
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-white">
            {isAr ? 'نقاط القوة' : 'Strengths'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {strengths.map((s) => (
              <StrengthCard key={s} title={s} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-white">
            {isAr ? 'نقاط التحسين' : 'Weaknesses'}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {weaknesses.map((w) => (
              <WeaknessCard key={w} title={w} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-white">
            {isAr ? 'خطوات العمل' : 'Action items'}
          </h2>
          <div className="grid gap-3">
            {report.actionItems.map((a) => (
              <ActionItemCard
                key={a.title}
                priority={a.priority}
                title={langToggle === 'ar' ? a.titleAr : a.title}
                detail={langToggle === 'ar' ? a.detailAr : a.detail}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-medium text-white">
            {isAr ? 'تفصيل الأسئلة' : 'Question breakdown'}
          </h2>
          <QuestionBreakdown items={report.questionBreakdown} isAr={langToggle === 'ar'} />
        </section>

        <section className="rounded-3xl border border-teal-300/25 bg-gradient-to-br from-teal-400/10 to-transparent p-6">
          <h2 className="mq-display text-2xl text-white">
            {isAr ? 'الخطوة التالية' : 'Next step'}
          </h2>
          <p className="mt-2 text-sm text-white/55">
            {langToggle === 'ar' ? report.nextStepsAr : report.nextSteps}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href={localePath('/jobs', locale)}
              className="mq-btn mq-btn-primary flex-1 px-5 py-3 text-center text-sm"
            >
              {isAr ? 'تصفّح قائمة الوظائف' : 'Browse job listings'}
            </Link>
            <Link
              href={localePath('/auth/register', locale)}
              className="mq-btn mq-btn-ghost flex-1 px-5 py-3 text-center text-sm"
            >
              {isAr ? 'سجّل / ادعُ صديقاً' : 'Register / invite a friend'}
            </Link>
          </div>
          <Link
            href={localePath('/interview/prequal', locale)}
            className="mt-4 inline-block text-sm text-teal-200 hover:text-teal-100"
          >
            {isAr ? 'تدرّب مجدداً' : 'Practice again'}
          </Link>
        </section>
      </main>
    </AtelierFlowShell>
  );
}
