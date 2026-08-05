'use client';

function Bar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 10) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
        <span>{label}</span>
        <span>{value.toFixed(1)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function FeedbackCard({
  feedback,
  isAr,
  nextAction,
  followUpQuestion,
  onNext,
  onFollowUp,
}: {
  feedback: {
    contentScore: number;
    structureScore: number;
    confidenceScore: number;
    overallScore: number;
    feedbackText: string;
    feedbackTextAr?: string;
    improvementTip: string;
    improvementTipAr?: string;
  };
  isAr: boolean;
  nextAction: string;
  followUpQuestion?: string | null;
  onNext: () => void;
  onFollowUp: () => void;
}) {
  const tip = isAr
    ? feedback.improvementTipAr || feedback.improvementTip
    : feedback.improvementTip;
  const text = isAr
    ? feedback.feedbackTextAr || feedback.feedbackText
    : feedback.feedbackText;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Bar label={isAr ? 'المحتوى' : 'Content'} value={feedback.contentScore} />
        <Bar label={isAr ? 'الهيكل' : 'Structure'} value={feedback.structureScore} />
        <Bar label={isAr ? 'الثقة' : 'Confidence'} value={feedback.confidenceScore} />
        <Bar label={isAr ? 'الإجمالي' : 'Overall'} value={feedback.overallScore} />
      </div>
      <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{text}</p>
      <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
        <strong className="font-medium">{isAr ? 'نصيحة للتحسين: ' : 'Improvement tip: '}</strong>
        {tip}
      </div>

      {nextAction === 'follow_up' && followUpQuestion ? (
        <div className="space-y-3">
          <p className="text-sm text-teal-200">
            {isAr ? 'سؤال متابعة: ' : 'Follow-up: '}
            {followUpQuestion}
          </p>
          <button
            type="button"
            onClick={onFollowUp}
            className="w-full rounded-xl bg-teal-300 px-4 py-3 text-sm font-semibold text-[var(--bg-deep)]"
          >
            {isAr ? 'الإجابة على المتابعة' : 'Answer follow-up'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-xl bg-[var(--text-primary)] px-4 py-3 text-sm font-semibold text-[var(--bg-deep)]"
        >
          {nextAction === 'final_report'
            ? isAr
              ? 'عرض التقرير'
              : 'View Report'
            : isAr
              ? 'السؤال التالي'
              : 'Next Question'}
        </button>
      )}
    </div>
  );
}
