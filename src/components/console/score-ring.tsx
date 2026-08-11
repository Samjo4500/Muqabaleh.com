'use client';

import { useEffect, useState } from 'react';
import { scoreColor } from '@/lib/console/defaults';
import type { PassportGrade } from '@/lib/console/types';

export function ScoreRing({
  score,
  grade,
  size = 140,
}: {
  score: number;
  grade: PassportGrade;
  size?: number;
}) {
  const [display, setDisplay] = useState(0);
  const color = scoreColor(score);
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, display) / 100) * c;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(score * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          className="text-[var(--c-border)]"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 200ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-[var(--c-text)]">{display}</span>
        <span
          className="mt-0.5 rounded-md px-2 py-0.5 text-xs font-bold"
          style={{ background: `${color}22`, color }}
        >
          {grade}
        </span>
      </div>
    </div>
  );
}
