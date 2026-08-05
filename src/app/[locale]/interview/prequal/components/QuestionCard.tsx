'use client';

import { cn } from '@/lib/utils';

export function QuestionCard({
  selected,
  title,
  subtitle,
  onClick,
  disabled,
}: {
  selected?: boolean;
  title: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border px-4 py-4 text-start transition-all duration-300',
        'bg-white/[0.03] hover:bg-white/[0.06]',
        selected
          ? 'border-teal-400/70 bg-teal-400/10 shadow-[0_0_0_1px_rgba(45,212,191,0.35)]'
          : 'border-white/10',
        disabled && 'opacity-40',
      )}
    >
      <div className="text-base font-medium text-[var(--text-primary)]">{title}</div>
      {subtitle ? (
        <div className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</div>
      ) : null}
    </button>
  );
}
