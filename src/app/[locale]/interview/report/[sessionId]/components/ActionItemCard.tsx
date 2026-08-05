'use client';

export function ActionItemCard({
  priority,
  title,
  detail,
}: {
  priority: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
        {priority}
      </div>
      <div className="mt-1 font-medium">{title}</div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}
