'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  className?: string;
};

export function ConsoleEmptyState({
  title,
  body,
  ctaLabel,
  ctaHref,
  onCtaClick,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'mq-console-surface flex flex-col items-center px-6 py-12 text-center',
        className,
      )}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface-2)] text-2xl text-[var(--c-primary)]"
        aria-hidden
      >
        ◇
      </div>
      <h3 className="text-base font-medium text-[var(--c-text)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-[var(--c-text-2)]">{body}</p>
      {ctaHref ? (
        <Link href={ctaHref} className="mq-console-btn-primary mt-5 inline-flex">
          {ctaLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCtaClick}
          className="mq-console-btn-primary mt-5 inline-flex"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
