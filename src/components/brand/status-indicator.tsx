'use client';

import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

export type InterviewStatus = 'online' | 'preparing' | 'analyzing' | 'completed';

interface StatusIndicatorProps {
  status: InterviewStatus;
  className?: string;
}

const statusConfig: Record<
  InterviewStatus,
  { color: string; bgColor: string; borderColor: string; dotKey: string }
> = {
  online: {
    color: 'text-emerald',
    bgColor: 'bg-emerald/10',
    borderColor: 'border-emerald/30',
    dotKey: 'statusOnline',
  },
  preparing: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/30',
    dotKey: 'statusPreparing',
  },
  analyzing: {
    color: 'text-violet-400',
    bgColor: 'bg-violet-400/10',
    borderColor: 'border-violet-400/30',
    dotKey: 'statusAnalyzing',
  },
  completed: {
    color: 'text-emerald',
    bgColor: 'bg-emerald/10',
    borderColor: 'border-emerald/30',
    dotKey: 'statusCompleted',
  },
};

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const t = useTranslations('app.room');
  const cfg = statusConfig[status];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1',
        cfg.bgColor,
        cfg.borderColor,
        cfg.color,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full opacity-75',
            status === 'online' && 'animate-pulse-emerald bg-emerald',
            status === 'preparing' && 'animate-pulse bg-amber-400',
            status === 'analyzing' && 'animate-pulse bg-violet-400',
            status === 'completed' && 'bg-emerald'
          )}
        />
        <span
          className={cn(
            'relative inline-flex h-2 w-2 rounded-full',
            status === 'online' && 'bg-emerald',
            status === 'preparing' && 'bg-amber-400',
            status === 'analyzing' && 'bg-violet-400',
            status === 'completed' && 'bg-emerald'
          )}
        />
      </span>
      <span className="text-xs font-bold tracking-wide">
        {t(cfg.dotKey)}
      </span>
    </div>
  );
}
