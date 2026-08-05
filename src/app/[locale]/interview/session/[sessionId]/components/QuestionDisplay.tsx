'use client';

export function QuestionDisplay({
  text,
  textAr,
  bilingual,
  coachingNote,
  onDismissTip,
  showTip,
  isAr,
}: {
  text: string;
  textAr?: string | null;
  bilingual?: boolean;
  coachingNote?: string;
  onDismissTip?: () => void;
  showTip?: boolean;
  isAr: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl leading-snug md:text-3xl">{text}</h2>
      {bilingual && textAr && textAr !== text ? (
        <p className="text-lg text-[var(--text-secondary)]" dir="rtl">
          {textAr}
        </p>
      ) : null}

      {showTip && coachingNote ? (
        <div className="flex items-start justify-between gap-3 rounded-full border border-teal-400/25 bg-teal-400/10 px-4 py-2 text-sm text-teal-100">
          <span>
            {isAr ? 'نصيحة: ' : 'Tip: '}
            {coachingNote}
          </span>
          <button
            type="button"
            onClick={onDismissTip}
            className="shrink-0 text-teal-200/80 hover:text-white"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
