'use client';

export function ScoreCircle({
  score,
  grade,
  isAr,
}: {
  score: number;
  grade: string;
  isAr: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative grid h-40 w-40 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#2dd4bf ${pct}%, rgba(255,255,255,0.08) 0)`,
        }}
      >
        <div className="grid h-[8.25rem] w-[8.25rem] place-items-center rounded-full bg-[var(--bg-deep)]">
          <div className="text-center">
            <div className="font-display text-4xl">{score.toFixed(1)}</div>
            <div className="text-xs text-[var(--text-secondary)]">/ 10</div>
          </div>
        </div>
      </div>
      <div className="rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-1 text-sm text-teal-100">
        {isAr ? 'التقدير' : 'Grade'}: <strong>{grade}</strong>
      </div>
    </div>
  );
}
