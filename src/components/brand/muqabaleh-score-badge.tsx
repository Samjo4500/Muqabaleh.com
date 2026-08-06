'use client';

import { cn } from '@/lib/utils';

export type ScoreBadgeStatus = 'scored' | 'interview' | 'hired';

const STATUS_COPY: Record<
  ScoreBadgeStatus,
  { en: string; ar: string; tone: string }
> = {
  scored: {
    en: 'SCORED',
    ar: 'نتيجة',
    tone: 'from-teal-400/25 to-teal-500/10 border-teal-300/55',
  },
  interview: {
    en: 'INTERVIEW',
    ar: 'مقابلة',
    tone: 'from-cyan-400/20 to-teal-500/10 border-cyan-300/50',
  },
  hired: {
    en: 'HIRED',
    ar: 'تم التوظيف',
    tone: 'from-emerald-400/25 to-teal-500/10 border-emerald-300/55',
  },
};

type Size = 'md' | 'lg';

/**
 * Muqabaleh hire-ready score badge — reusable on hero, passports, and profiles.
 */
export function MuqabalehScoreBadge({
  score,
  status = 'scored',
  locale = 'en',
  size = 'lg',
  className,
  max = 100,
}: {
  score: number;
  status?: ScoreBadgeStatus;
  locale?: string;
  size?: Size;
  className?: string;
  max?: number;
}) {
  const isAr = locale === 'ar';
  const copy = STATUS_COPY[status];
  const clamped = Math.max(0, Math.min(max, Math.round(score)));
  const large = size === 'lg';

  return (
    <div
      className={cn(
        'mq-score-badge pointer-events-none select-none',
        large ? 'mq-score-badge--lg' : 'mq-score-badge--md',
        className,
      )}
      dir={isAr ? 'rtl' : 'ltr'}
      aria-label={
        isAr
          ? `شارة مقابلة: ${copy.ar} ${clamped} من ${max}`
          : `Muqabaleh badge: ${copy.en} ${clamped} of ${max}`
      }
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-[0_16px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl',
          copy.tone,
          large ? 'px-4 py-3.5' : 'px-3 py-2.5',
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 20% 0%, rgba(45,212,191,0.35), transparent 55%)',
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <div
            className={cn(
              'relative flex shrink-0 items-center justify-center rounded-full border border-teal-200/40 bg-[#070b14]/75 font-black text-teal-200',
              large ? 'h-16 w-16 text-2xl' : 'h-12 w-12 text-lg',
            )}
          >
            <span className="mq-display leading-none tracking-tight">{clamped}</span>
            <span
              className={cn(
                'absolute -bottom-1 rounded-full border border-white/15 bg-[#070b14]/90 px-1.5 font-bold uppercase tracking-wider text-white/70',
                large ? 'text-[9px]' : 'text-[8px]',
              )}
            >
              /{max}
            </span>
          </div>

          <div className="min-w-0 pe-1">
            <p
              className={cn(
                'font-extrabold uppercase tracking-[0.18em] text-teal-100',
                large ? 'text-[11px]' : 'text-[10px]',
              )}
            >
              {isAr ? copy.ar : copy.en}
            </p>
            <p
              className={cn(
                'mt-0.5 font-semibold text-white',
                large ? 'text-sm' : 'text-xs',
              )}
            >
              {isAr ? 'جاهزية مقابلة' : 'Hire-ready score'}
            </p>
            <p
              className={cn(
                'mt-0.5 font-medium text-white/55',
                large ? 'text-[11px]' : 'text-[10px]',
              )}
            >
              Muqabaleh
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
