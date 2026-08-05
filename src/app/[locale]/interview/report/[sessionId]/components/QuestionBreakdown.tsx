'use client';

import { useState } from 'react';

type Item = {
  questionId: string;
  questionText: string;
  questionTextAr?: string | null;
  userAnswer: string;
  overallScore?: number | null;
  feedbackText?: string | null;
  improvementTip?: string | null;
};

export function QuestionBreakdown({
  items,
  isAr,
}: {
  items: Item[];
  isAr: boolean;
}) {
  const [open, setOpen] = useState<string | null>(items[0]?.questionId ?? null);

  return (
    <div className="space-y-2">
      {items.map((item, idx) => {
        const isOpen = open === item.questionId;
        return (
          <div
            key={item.questionId + idx}
            className="overflow-hidden rounded-2xl border border-white/10"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start"
              onClick={() => setOpen(isOpen ? null : item.questionId)}
            >
              <span className="text-sm">
                {idx + 1}.{' '}
                {isAr && item.questionTextAr ? item.questionTextAr : item.questionText}
              </span>
              <span className="text-sm text-teal-200">
                {item.overallScore?.toFixed(1) ?? '—'}
              </span>
            </button>
            {isOpen ? (
              <div className="space-y-2 border-t border-white/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
                <p>
                  <strong className="text-[var(--text-primary)]">
                    {isAr ? 'إجابتك: ' : 'Your answer: '}
                  </strong>
                  {item.userAnswer}
                </p>
                {item.feedbackText ? <p>{item.feedbackText}</p> : null}
                {item.improvementTip ? (
                  <p className="text-amber-100">
                    {isAr ? 'نصيحة: ' : 'Tip: '}
                    {item.improvementTip}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
