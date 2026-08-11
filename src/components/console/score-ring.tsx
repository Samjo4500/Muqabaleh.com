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
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, display) / 100) * c;

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
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
          style={{ transition: 'stroke-dashoffset 220ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="mq-console-metric text-[2rem] text-[var(--c-text)]">{display}</span>
        <span
          className="mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-normal tracking-[0.12em]"
          style={{ background: `${color}18`, color }}
        >
          {grade}
        </span>
      </div>
    </div>
  );
}
