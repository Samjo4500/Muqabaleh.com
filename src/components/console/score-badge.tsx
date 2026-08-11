'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Check, Minus, X } from 'lucide-react';
import { scoreColor } from '@/lib/console/defaults';
import { scoreBand } from '@/lib/console/a11y';
import { cn } from '@/lib/utils';

type Props = {
  score: number;
  grade?: string;
  className?: string;
  compact?: boolean;
};

export function ScoreBadge({ score, grade, className, compact }: Props) {
  const t = useTranslations('console.a11y');
  const locale = useLocale();
  const band = scoreBand(score);
  const color = scoreColor(score);
  const Icon = band === 'low' ? X : band === 'average' ? Minus : Check;
  const label = t(`score_${band}`);
  const aria = grade
    ? t('scoreAriaGrade', { score, grade: grade === 'B+' ? t('gradeBPlus') : grade })
    : t('scoreAria', { score, band: label });

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-normal tabular-nums',
        className,
      )}
      style={{ color, background: `${color}18` }}
      aria-label={aria}
      title={aria}
      lang={locale}
    >
      <Icon size={11} strokeWidth={2.5} aria-hidden />
      <span>{score}</span>
      {grade ? <span>· {grade}</span> : null}
      {!compact ? (
        <span className="ms-0.5 opacity-90">{label}</span>
      ) : null}
    </span>
  );
}
