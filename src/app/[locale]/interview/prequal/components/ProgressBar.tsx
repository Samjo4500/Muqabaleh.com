'use client';

export function ProgressBar({
  step,
  total,
  label,
}: {
  step: number;
  total: number;
  label: string;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <span>{label}</span>
        <span>
          {step}/{total}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
