'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Mic2, Percent, Star, Clock } from 'lucide-react';

type Data = {
  interviews?: {
    total: number;
    completed: number;
    completionRate: number;
    avgScore: number | null;
    topIndustries: { industry: string; count: number }[];
    peakHours: { hour: number; count: number }[];
  };
};

export default function Page() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    void fetch('/api/admin/analytics/overview')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  const i = data?.interviews;
  const peak = i?.peakHours?.[0];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'أداء المقابلات', en: 'Interview Analytics' }}
        description={{
          ar: 'إجمالي المقابلات، نسبة الإكمال، متوسط الدرجات، وأوقات الذروة من قاعدة البيانات.',
          en: 'Totals, completion rate, average scores, and peak hours from the database.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إجمالي المقابلات', en: 'Total interviews' }} value={String(i?.total ?? 0)} icon={Mic2} />
        <AdminStatCard label={{ ar: 'متوسط الإكمال', en: 'Avg completion rate' }} value={`${i?.completionRate ?? 0}%`} icon={Percent} />
        <AdminStatCard label={{ ar: 'متوسط الدرجات', en: 'Avg scores' }} value={i?.avgScore != null ? String(i.avgScore) : '—'} icon={Star} />
        <AdminStatCard
          label={{ ar: 'ذروة الاستخدام (UTC)', en: 'Peak usage (UTC)' }}
          value={peak ? `${String(peak.hour).padStart(2, '0')}:00` : '—'}
          icon={Clock}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="أشهر القطاعات" en="Top industries" />
          <ul className="mt-4 space-y-2 text-sm">
            {(i?.topIndustries ?? []).map((row) => (
              <li key={row.industry} className="flex justify-between border-b border-white/5 py-2">
                <span>{row.industry}</span>
                <span className="text-cyan-300">{row.count}</span>
              </li>
            ))}
            {!i?.topIndustries?.length ? (
              <li className="text-[var(--text-muted)]">No interviews yet</li>
            ) : null}
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="ساعات الذروة (٧ أيام)" en="Peak hours (7d)" />
          <ul className="mt-4 space-y-2 text-sm">
            {(i?.peakHours ?? []).map((row) => (
              <li key={row.hour} className="flex justify-between border-b border-white/5 py-2">
                <span>{String(row.hour).padStart(2, '0')}:00 UTC</span>
                <span className="text-cyan-300">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
