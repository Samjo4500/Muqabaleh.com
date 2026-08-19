'use client';

import type { LucideIcon } from 'lucide-react';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import type { Bi } from '@/lib/admin/labels';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AdminStatCard({
  label,
  value,
  icon: Icon,
  loading,
  accent,
  hint,
}: {
  label: Bi;
  value: string;
  icon: LucideIcon;
  loading?: boolean;
  accent?: 'green' | 'yellow' | 'red' | 'cyan';
  hint?: Bi;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <BiLabel ar={label.ar} en={label.en} size="sm" />
        <Icon
          size={18}
          className={cn(
            'shrink-0',
            accent === 'green' && 'text-emerald-400',
            accent === 'yellow' && 'text-amber-400',
            accent === 'red' && 'text-rose-400',
            (!accent || accent === 'cyan') && 'text-cyan-300',
          )}
        />
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{value}</p>
      )}
      {hint ? (
        <p className="mt-1 text-xs font-normal text-[var(--text-muted)]">
          <BiInline ar={hint.ar} en={hint.en} />
        </p>
      ) : null}
    </div>
  );
}
