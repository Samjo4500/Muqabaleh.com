'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  value: number; // 1-10
  max?: number;
  size?: number; // px diameter
  strokeWidth?: number;
 showValue?: boolean;
  className?: string;
  animated?: boolean;
}

function getScoreColor(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.7) return '#10B981'; // emerald green
  if (pct >= 0.4) return '#D4A843'; // gold
  return '#EF4444'; // red
}

function getScoreGlow(value: number, max: number): string {
  const pct = value / max;
  if (pct >= 0.7) return '0 0 12px rgba(16,185,129,0.5)';
  if (pct >= 0.4) return '0 0 12px rgba(212,168,67,0.5)';
  return '0 0 12px rgba(239,68,68,0.5)';
}

export function ScoreRing({
  value,
  max = 10,
  size = 88,
  strokeWidth = 5,
  showValue = true,
  className,
  animated = true,
}: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, Math.max(0, value / max));
  const offset = circumference * (1 - pct);
  const color = getScoreColor(value, max);
  const glow = getScoreGlow(value, max);

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={animated ? undefined : { strokeDashoffset: offset }}
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={animated ? { strokeDashoffset: offset } : undefined}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
          filter={glow ? `drop-shadow(${glow})` : undefined}
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold leading-none"
            style={{ color }}
            initial={animated ? { opacity: 0, scale: 0.5 } : undefined}
            animate={animated ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {value}
          </motion.span>
          <span className="mt-0.5 text-[10px] font-medium text-[var(--text-faint)]">
            / {max}
          </span>
        </div>
      )}
    </div>
  );
}
