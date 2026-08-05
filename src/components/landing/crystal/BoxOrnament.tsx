'use client';

import { cn } from '@/lib/utils';

export type OrnamentTone = 'teal' | 'gold' | 'cyan' | 'amber' | 'rose';
export type OrnamentShape = 'najma' | 'arch' | 'lattice' | 'vine' | 'fan';

const TONE: Record<OrnamentTone, { stroke: string; glow: string }> = {
  teal: { stroke: '#2DD4BF', glow: 'rgba(45,212,191,0.35)' },
  gold: { stroke: '#E8C97A', glow: 'rgba(232,201,122,0.35)' },
  cyan: { stroke: '#67E8F9', glow: 'rgba(103,232,249,0.3)' },
  amber: { stroke: '#FBBF24', glow: 'rgba(251,191,36,0.3)' },
  rose: { stroke: '#F9A8D4', glow: 'rgba(249,168,212,0.28)' },
};

function Shape({ shape, stroke }: { shape: OrnamentShape; stroke: string }) {
  if (shape === 'najma') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M8 8 H40 M8 8 V40"
          stroke={stroke}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M28 12 L33 24 L46 24 L35 32 L39 45 L28 37 L17 45 L21 32 L10 24 L23 24 Z"
          stroke={stroke}
          strokeWidth="1.25"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="30" r="4" stroke={stroke} strokeWidth="1" opacity="0.8" />
      </svg>
    );
  }

  if (shape === 'arch') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M10 54 V28 C10 14 18 10 32 10 H54"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18 54 V30 C18 20 24 16 34 16 H54"
          stroke={stroke}
          strokeWidth="1"
          opacity="0.65"
        />
        <path
          d="M32 22 L38 32 L50 32 L40 38 L44 50 L32 42 L20 50 L24 38 L14 32 L26 32 Z"
          stroke={stroke}
          strokeWidth="1.1"
        />
      </svg>
    );
  }

  if (shape === 'lattice') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
        <rect x="10" y="10" width="36" height="36" rx="2" stroke={stroke} strokeWidth="1.2" />
        <path d="M10 28 H46 M28 10 V46" stroke={stroke} strokeWidth="1" opacity="0.85" />
        <path d="M10 10 L46 46 M46 10 L10 46" stroke={stroke} strokeWidth="0.9" opacity="0.7" />
        <circle cx="28" cy="28" r="8" stroke={stroke} strokeWidth="1" />
      </svg>
    );
  }

  if (shape === 'vine') {
    return (
      <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
        <path
          d="M8 8 H36 M8 8 V36"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.75"
        />
        <path
          d="M14 40 C22 28 30 44 40 32 C46 24 52 34 58 28"
          stroke={stroke}
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M34 30 C40 22 48 24 50 32"
          stroke={stroke}
          strokeWidth="1.1"
          strokeLinecap="round"
        />
        <circle cx="40" cy="32" r="2" fill={stroke} opacity="0.8" />
        <circle cx="22" cy="36" r="1.6" fill={stroke} opacity="0.7" />
      </svg>
    );
  }

  // fan / scalloped corner
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" fill="none" aria-hidden>
      <path d="M8 8 H42 M8 8 V42" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.8" />
      <path d="M14 14 C28 14 42 28 42 42" stroke={stroke} strokeWidth="1.2" />
      <path d="M14 14 C24 18 34 28 38 42" stroke={stroke} strokeWidth="1" opacity="0.7" />
      <path d="M14 14 C20 22 26 34 28 42" stroke={stroke} strokeWidth="1" opacity="0.55" />
      <circle cx="14" cy="14" r="2.2" fill={stroke} opacity="0.85" />
    </svg>
  );
}

const CORNER_POS = {
  tl: 'start-2 top-2',
  tr: 'end-2 top-2 scale-x-[-1]',
  bl: 'start-2 bottom-2 scale-y-[-1]',
  br: 'end-2 bottom-2 scale-x-[-1] scale-y-[-1]',
} as const;

export function BoxOrnament({
  shape = 'najma',
  tone = 'teal',
  corners = ['tl', 'br'],
  className,
  size = 'md',
}: {
  shape?: OrnamentShape;
  tone?: OrnamentTone;
  corners?: Array<keyof typeof CORNER_POS>;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { stroke, glow } = TONE[tone];
  const dim = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';

  return (
    <div className={cn('pointer-events-none absolute inset-0 z-[1]', className)} aria-hidden>
      {corners.map((c) => (
        <div
          key={c}
          className={cn('absolute opacity-80', dim, CORNER_POS[c])}
          style={{ filter: `drop-shadow(0 0 10px ${glow})` }}
        >
          <Shape shape={shape} stroke={stroke} />
        </div>
      ))}
    </div>
  );
}

/** Presets so each card family feels distinct */
export const ORNAMENT_PRESETS: Array<{ shape: OrnamentShape; tone: OrnamentTone }> = [
  { shape: 'najma', tone: 'teal' },
  { shape: 'arch', tone: 'gold' },
  { shape: 'lattice', tone: 'cyan' },
  { shape: 'vine', tone: 'amber' },
  { shape: 'fan', tone: 'rose' },
];
