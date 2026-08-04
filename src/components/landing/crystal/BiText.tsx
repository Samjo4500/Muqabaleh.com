'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Bi } from './copy';

/** Shows Arabic + English simultaneously. Primary language follows active locale. */
export function BiText({
  bi,
  as: Tag = 'span',
  className,
  primaryClassName,
  secondaryClassName,
  align = 'start',
}: {
  bi: Bi;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'li';
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  align?: 'start' | 'center';
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const primary = isAr ? bi.ar : bi.en;
  const secondary = isAr ? bi.en : bi.ar;

  return (
    <Tag
      className={cn(
        'flex flex-col gap-1',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      <span
        className={cn('leading-snug', primaryClassName)}
        dir={isAr ? 'rtl' : 'ltr'}
        lang={isAr ? 'ar' : 'en'}
      >
        {primary}
      </span>
      <span
        className={cn(
          'text-[0.85em] font-medium leading-snug text-[var(--text-muted)]',
          secondaryClassName,
        )}
        dir={isAr ? 'ltr' : 'rtl'}
        lang={isAr ? 'en' : 'ar'}
      >
        {secondary}
      </span>
    </Tag>
  );
}

export function BiInline({ bi, className }: { bi: Bi; className?: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  return (
    <span className={cn('whitespace-nowrap', className)} dir="auto">
      <span dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
        {isAr ? bi.ar : bi.en}
      </span>
      <span className="mx-1.5 text-[var(--text-muted)]">/</span>
      <span
        className="text-[var(--text-secondary)]"
        dir={isAr ? 'ltr' : 'rtl'}
        lang={isAr ? 'en' : 'ar'}
      >
        {isAr ? bi.en : bi.ar}
      </span>
    </span>
  );
}
