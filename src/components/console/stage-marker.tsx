'use client';

import { useLocale } from 'next-intl';
import { stageShape } from '@/lib/console/a11y';
import { cn } from '@/lib/utils';

type Props = {
  stageKey: string;
  label: string;
  color?: string | null;
  className?: string;
};

export function StageMarker({ stageKey, label, color, className }: Props) {
  const locale = useLocale();
  const shape = stageShape(stageKey);
  const bg = color || 'var(--c-primary)';

  return (
    <span
      className={cn('inline-flex items-center gap-1.5', className)}
      aria-label={label}
      lang={locale}
    >
      <span
        aria-hidden
        className={cn(
          'inline-block shrink-0',
          shape === 'circle' && 'h-2 w-2 rounded-full',
          shape === 'square' && 'h-2 w-2 rounded-[2px]',
          shape === 'diamond' && 'h-2 w-2 rotate-45 rounded-[1px]',
          shape === 'star' &&
            'h-0 w-0 border-l-[4px] border-r-[4px] border-b-[7px] border-l-transparent border-r-transparent',
          shape === 'dash' && 'h-0.5 w-2.5 rounded-full',
        )}
        style={
          shape === 'star'
            ? { borderBottomColor: bg }
            : { background: bg }
        }
      />
      <span className="text-[13px] font-medium tracking-tight text-[var(--c-text)]">
        {label}
      </span>
    </span>
  );
}
