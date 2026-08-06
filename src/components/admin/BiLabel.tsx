'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Bi } from '@/lib/admin/labels';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

/**
 * Locale-aware admin label — shows the active language only.
 * Switch EN/AR via the language control; bilingual stacking hid the switcher effect.
 */
export function BiLabel({
  ar,
  en,
  className,
  size = 'md',
}: Bi & { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <span
      className={cn(
        'inline-flex leading-tight',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        'font-semibold text-[var(--text-primary)]',
        className,
      )}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      {pick({ ar, en }, locale)}
    </span>
  );
}

/** Locale-aware inline admin text (single language). */
export function BiInline({ ar, en, className }: Bi & { className?: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <span
      className={cn('whitespace-nowrap font-medium', className)}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      {pick({ ar, en }, locale)}
    </span>
  );
}
