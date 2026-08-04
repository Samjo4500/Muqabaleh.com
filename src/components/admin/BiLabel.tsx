import { cn } from '@/lib/utils';
import type { Bi } from '@/lib/admin/labels';

/** Shows Arabic + English simultaneously for Super Admin UI. */
export function BiLabel({
  ar,
  en,
  className,
  size = 'md',
}: Bi & { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'inline-flex flex-col items-start gap-0.5 leading-tight',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        className,
      )}
      dir="rtl"
    >
      <span className="font-semibold text-[var(--text-primary)]">{ar}</span>
      <span className="text-[11px] font-medium text-[var(--text-muted)]">{en}</span>
    </span>
  );
}

export function BiInline({ ar, en, className }: Bi & { className?: string }) {
  return (
    <span className={cn('whitespace-nowrap', className)} dir="auto">
      <span className="font-medium">{ar}</span>
      <span className="mx-1.5 text-[var(--text-muted)]">/</span>
      <span className="text-[var(--text-secondary)]">{en}</span>
    </span>
  );
}
