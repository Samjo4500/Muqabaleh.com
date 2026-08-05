'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function Timer({
  seconds,
  onExpire,
  warnAt = 30,
}: {
  seconds: number;
  onExpire?: () => void;
  warnAt?: number;
}) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (left <= 0) {
      onExpire?.();
      return;
    }
    const id = window.setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [left, onExpire]);

  const m = Math.floor(left / 60);
  const s = left % 60;
  const warning = left <= warnAt;

  return (
    <div
      className={cn(
        'rounded-full px-3 py-1 font-mono text-sm tabular-nums',
        warning
          ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/40'
          : 'bg-white/5 text-[var(--text-secondary)]',
      )}
      aria-live="polite"
    >
      {m}:{String(s).padStart(2, '0')}
      {warning && left > 0 ? (
        <span className="ms-2 text-xs">{left <= 30 ? '!' : ''}</span>
      ) : null}
    </div>
  );
}
