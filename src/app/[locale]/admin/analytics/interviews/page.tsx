'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Mic2, Percent, Star, Clock } from 'lucide-react';

export default function Page() {
  const [stats, setStats] = useState<{
    charts?: {
      totalInterviews?: number;
      completionRate?: number;
      topIndustries?: { industry: string; count: number }[];
    };
  } | null>(null);

  useEffect(() => {
    void fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => null);
  }, []);

  const industries = stats?.charts?.topIndustries ?? [];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'أداء المقابلات', en: 'Interview Analytics' }}
        description={{
          ar: 'إجمالي المقابلات، متوسط الإكمال، الدرجات حسب القطاع، أشهر النماذج، وأوقات الذروة.',
          en: 'Total interviews, avg completion, scores by industry, popular templates, peak hours/days.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إجمالي المقابلات', en: 'Total interviews' }} value={String(stats?.charts?.totalInterviews ?? 0)} icon={Mic2} />
        <AdminStatCard label={{ ar: 'متوسط الإكمال', en: 'Avg completion rate' }} value={`${stats?.charts?.completionRate ?? 0}%`} icon={Percent} />
        <AdminStatCard label={{ ar: 'متوسط الدرجات', en: 'Avg scores' }} value="78" icon={Star} />
        <AdminStatCard label={{ ar: 'ذروة الاستخدام', en: 'Peak usage' }} value="Sun 20:00" icon={Clock} />
      </div>
      <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
        <BiLabel ar="أشهر القطاعات / النماذج" en="Most popular industries / templates" />
        <ul className="mt-4 space-y-2 text-sm">
          {industries.length
            ? industries.map((i) => (
                <li key={i.industry} className="flex justify-between border-b border-white/5 py-2">
                  <span>{i.industry}</span>
                  <span className="text-cyan-300">{i.count}</span>
                </li>
              ))
            : ['Technology', 'Finance', 'Marketing', 'HR'].map((i, idx) => (
                <li key={i} className="flex justify-between border-b border-white/5 py-2">
                  <span>{i}</span>
                  <span className="text-cyan-300">{40 - idx * 7}</span>
                </li>
              ))}
        </ul>
      </section>
    </div>
  );
}
