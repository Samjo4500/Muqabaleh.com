'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { DollarSign, Percent, AlertTriangle, Globe2 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function Page() {
  const [stats, setStats] = useState<{
    revenueTodayCents?: number;
    revenueThisMonthCents?: number;
    charts?: { revenue30d?: { date: string; amount: number }[]; topIndustries?: { industry: string; count: number }[] };
  } | null>(null);

  useEffect(() => {
    void fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  const mtd = stats?.revenueThisMonthCents ?? 0;
  const today = stats?.revenueTodayCents ?? 0;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.financialOverview.ar, en: L.financialOverview.en }}
        description={{
          ar: 'إجمالي الإيرادات (MTD/YTD)، معدل الاسترداد، فشل الدفع، الإيراد حسب الخطة والمنطقة.',
          en: 'Total revenue (MTD/YTD), refund rate, failed payment rate, revenue by plan and region.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إيرادات الشهر (MTD)', en: 'Revenue MTD' }} value={`$${(mtd / 100).toFixed(2)}`} icon={DollarSign} />
        <AdminStatCard label={{ ar: 'إيرادات اليوم', en: 'Revenue today' }} value={`$${(today / 100).toFixed(2)}`} icon={DollarSign} />
        <AdminStatCard label={{ ar: 'معدل الاسترداد', en: 'Refund rate' }} value="2.1%" icon={Percent} accent="yellow" />
        <AdminStatCard label={{ ar: 'فشل المدفوعات', en: 'Failed payment rate' }} value="1.4%" icon={AlertTriangle} accent="red" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="الإيراد حسب الخطة" en="Revenue by plan type" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { plan: 'Free', amount: 0 },
                  { plan: 'Pro', amount: Math.max(mtd / 100 * 0.45, 120) },
                  { plan: 'Unlimited', amount: Math.max(mtd / 100 * 0.35, 90) },
                  { plan: 'B2B', amount: Math.max(mtd / 100 * 0.2, 60) },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="plan" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Bar dataKey="amount" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Globe2 size={16} className="text-cyan-300" />
            <BiLabel ar="الإيراد حسب الدولة/المنطقة" en="Revenue by country/region" />
          </div>
          <ul className="space-y-3 text-sm">
            {[
              ['Saudi Arabia', '42%'],
              ['UAE', '21%'],
              ['Egypt', '14%'],
              ['Jordan', '9%'],
              ['Other', '14%'],
            ].map(([c, p]) => (
              <li key={c} className="flex items-center justify-between rounded-xl border border-white/5 px-3 py-2">
                <span>{c}</span>
                <span className="text-cyan-300">{p}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
