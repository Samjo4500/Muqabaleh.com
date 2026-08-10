'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { DollarSign, Percent, AlertTriangle, Mic2 } from 'lucide-react';
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
  const [analytics, setAnalytics] = useState<{
    website?: { refundRate?: number; paymentsFailed?: number; paymentsOk?: number; revenue30dUsd?: number };
    interviews?: { topIndustries?: { industry: string; count: number }[] };
  } | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch('/api/admin/stats').then((r) => r.json()),
      fetch('/api/admin/analytics/overview').then((r) => r.json()),
    ])
      .then(([s, a]) => {
        setStats(s);
        setAnalytics(a);
      })
      .catch(() => undefined);
  }, []);

  const mtd = stats?.revenueThisMonthCents ?? 0;
  const today = stats?.revenueTodayCents ?? 0;
  const refundRate = analytics?.website?.refundRate ?? 0;
  const failed = analytics?.website?.paymentsFailed ?? 0;
  const ok = analytics?.website?.paymentsOk ?? 0;
  const failRate = ok + failed === 0 ? 0 : Math.round((failed / (ok + failed)) * 100);
  const chart = (stats?.charts?.revenue30d ?? []).slice(-14);
  const industries = analytics?.interviews?.topIndustries ?? stats?.charts?.topIndustries ?? [];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.financialOverview.ar, en: L.financialOverview.en }}
        description={{
          ar: 'إيرادات وإحصاءات دفع حقيقية من Payment + analytics overview.',
          en: 'Live revenue and payment health from Payment + analytics overview.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إيرادات الشهر (MTD)', en: 'Revenue MTD' }} value={`$${(mtd / 100).toFixed(2)}`} icon={DollarSign} />
        <AdminStatCard label={{ ar: 'إيرادات اليوم', en: 'Revenue today' }} value={`$${(today / 100).toFixed(2)}`} icon={DollarSign} />
        <AdminStatCard label={{ ar: 'نسبة الاسترداد', en: 'Refund rate' }} value={`${refundRate}%`} icon={Percent} accent="yellow" />
        <AdminStatCard label={{ ar: 'نسبة فشل الدفع', en: 'Failed payment rate' }} value={`${failRate}%`} icon={AlertTriangle} accent="red" />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="إيراد ١٤ يوماً" en="Revenue (14d)" />
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart.length ? chart : [{ date: '—', amount: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: 12 }} />
                <Bar dataKey="amount" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Mic2 size={16} className="text-cyan-300" />
            <BiLabel ar="أكثر القطاعات نشاطاً" en="Top interview industries" />
          </div>
          <ul className="space-y-3 text-sm">
            {industries.length ? (
              industries.map((row) => (
                <li key={row.industry} className="flex justify-between border-b border-white/5 py-2">
                  <span>{row.industry}</span>
                  <span className="text-cyan-300">{row.count}</span>
                </li>
              ))
            ) : (
              <li className="text-[var(--text-muted)]">No industry data yet</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
