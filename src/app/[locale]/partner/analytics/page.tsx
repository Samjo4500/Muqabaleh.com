'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { KpiCard, PageHeader, Panel } from '@/components/partner/ui';

type Analytics = {
  kpis: { clients: number; activeJobs: number; interviews30d: number; creditsPool: number; earningsCents30d: number; conversionRate: number };
  usageSeries: Array<{ day: string; interviews: number; invites: number }>;
  byIndustry: Record<string, number>;
  clients: Array<{ id: string; name: string; interviewsCount: number; jobsCount: number; credits: number; status: string }>;
};

export default function PartnerAnalyticsPage() {
  const t = useTranslations('partnerConsole');
  const [data, setData] = useState<Analytics | null>(null);
  useEffect(() => {
    void fetch('/api/partner/analytics').then((r) => r.json()).then(setData);
  }, []);
  const max = Math.max(...(data?.usageSeries.map((d) => d.interviews) || [1]), 1);
  const industries = Object.entries(data?.byIndustry || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div>
      <PageHeader eyebrow={t('navAnalytics')} title={t('analyticsTitle')} description={t('analyticsDesc')} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t('kpiInterviews')} value={String(data?.kpis.interviews30d ?? '—')} />
        <KpiCard label={t('kpiJobs')} value={String(data?.kpis.activeJobs ?? '—')} />
        <KpiCard label={t('kpiClients')} value={String(data?.kpis.clients ?? '—')} />
        <KpiCard label={t('kpiConversion')} value={data ? `${Math.round(data.kpis.conversionRate * 100)}%` : '—'} />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title={t('usageTitle')}>
          <div className="flex h-48 items-end gap-1.5">
            {(data?.usageSeries || []).map((d) => (
              <div key={d.day} className="flex flex-1 flex-col justify-end">
                <div className="w-full rounded-t-md bg-[var(--pc-primary)]" style={{ height: `${(d.interviews / max) * 100}%` }} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title={t('byIndustry')}>
          <ul className="space-y-3">
            {industries.map(([name, count]) => (
              <li key={name}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="tabular-nums text-white/50">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-[var(--pc-accent)]" style={{ width: `${Math.min(100, (count / (industries[0]?.[1] || 1)) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      <Panel title={t('clientLeaderboard')} className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="pb-3 pe-3">{t('fieldClientName')}</th>
                <th className="pb-3 pe-3">{t('interviews')}</th>
                <th className="pb-3 pe-3">{t('jobs')}</th>
                <th className="pb-3">{t('credits')}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.clients || []).map((c) => (
                <tr key={c.id} className="border-t border-white/8">
                  <td className="py-3 pe-3 font-medium">{c.name}</td>
                  <td className="py-3 pe-3 tabular-nums">{c.interviewsCount}</td>
                  <td className="py-3 pe-3 tabular-nums">{c.jobsCount}</td>
                  <td className="py-3 tabular-nums">{c.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
