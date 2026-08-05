'use client';

export function WeaknessCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-amber-300/20 bg-amber-300/5 px-4 py-4 text-sm text-amber-50">
      {title}
    </div>
  );
}
