'use client';

import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Bi } from './copy';

function pick(bi: Bi, locale: string) {
  return locale === 'ar' ? bi.ar : bi.en;
}

/** Locale-aware text — clean single language (switcher handles the other). */
export function T({
  bi,
  as: Tag = 'span',
  className,
}: {
  bi: Bi;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'li';
  className?: string;
}) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  return (
    <Tag className={className} dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
      {pick(bi, locale)}
    </Tag>
  );
}

/** @deprecated alias — prefer T for uncluttered UI */
export function BiText({
  bi,
  as: Tag = 'span',
  className,
  primaryClassName,
  align = 'start',
}: {
  bi: Bi;
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'li';
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  align?: 'start' | 'center';
}) {
  return (
    <T
      bi={bi}
      as={Tag}
      className={cn(
        align === 'center' && 'text-center',
        primaryClassName,
        className,
      )}
    />
  );
}

export function BiInline({ bi, className }: { bi: Bi; className?: string }) {
  const locale = useLocale();
  return (
    <span className={className} dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale}>
      {pick(bi, locale)}
    </span>
  );
}
