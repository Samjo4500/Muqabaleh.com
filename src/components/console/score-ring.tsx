'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { scoreColor } from '@/lib/console/defaults';
import { gradeSpoken, scoreBand } from '@/lib/console/a11y';
import type { PassportGrade } from '@/lib/console/types';
import { useConsoleA11y } from './console-a11y';

export function ScoreRing({
  score,
  grade,
  size = 140,
}: {
  score: number;
  grade: PassportGrade;
  size?: number;
}) {
  const t = useTranslations('console.a11y');
  const { effectiveReduceMotion } = useConsoleA11y();
  const [display, setDisplay] = useState(effectiveReduceMotion ? score : 0);
  const color = scoreColor(score);
  const band = scoreBand(score);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, display) / 100) * c;
  const patternId = `score-fill-${band}`;

  useEffect(() => {
    if (effectiveReduceMotion) {
      setDisplay(score);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const tNow = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - tNow, 3);
      setDisplay(Math.round(score * eased));
      if (tNow < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, effectiveReduceMotion]);

  const aria = t('scoreAriaGrade', {
    score,
    grade: grade === 'B+' ? t('gradeBPlus') : gradeSpoken(grade),
  });

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={aria}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <defs>
          <pattern
            id={patternId}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform={band === 'average' ? 'rotate(45)' : undefined}
          >
            {band === 'strong' ? (
              <rect width="6" height="6" fill={color} fillOpacity="0.25" />
            ) : null}
            {band === 'average' ? (
              <path d="M0 0H6" stroke={color} strokeWidth="1.5" strokeOpacity="0.55" />
            ) : null}
            {band === 'low' ? (
              <circle cx="1.5" cy="1.5" r="1" fill={color} fillOpacity="0.55" />
            ) : null}
          </pattern>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill={`url(#${patternId})`}
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
          style={{
            transition: effectiveReduceMotion
              ? undefined
              : 'stroke-dashoffset 220ms ease-out',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span className="mq-console-metric text-[2rem] text-[var(--c-text)]">{display}</span>
        <span
          className="mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-normal tracking-[0.12em]"
          style={{ background: `${color}18`, color }}
        >
          {grade} · {t(`score_${band}`)}
        </span>
      </div>
    </div>
  );
}
