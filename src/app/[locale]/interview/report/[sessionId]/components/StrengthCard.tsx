'use client';

export function StrengthCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-teal-400/20 bg-teal-400/5 px-4 py-4 text-sm text-teal-50">
      {title}
    </div>
  );
}
