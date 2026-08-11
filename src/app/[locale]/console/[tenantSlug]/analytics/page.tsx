'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
} from 'recharts';

type AnalyticsPayload = {
  funnel: Record<string, number>;
  histogram: { bucket: string; count: number }[];
  rolePerf: {
    jobId: string;
    title: string;
    titleAr: string | null;
    candidates: number;
    avgScore: number;
    dropOff: number;
  }[];
  timeToHireDays: number;
  roi: {
    hoursSaved: number;
    laborSavedUsd: number;
    subscriptionUsd: number;
    netSavingsUsd: number;
  };
};

export default function AnalyticsPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/analytics`)
      .then((r) => r.json())
      .then((j) => setData(j.analytics || null));
  }, [tenantSlug]);

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ['stage', 'count'],
      ...Object.entries(data.funnel).map(([k, v]) => [k, String(v)]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'muqabaleh-funnel.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;

  const funnelSteps = [
    ['applied', data.funnel.applied],
    ['started', data.funnel.started],
    ['completed', data.funnel.completed],
    ['passed', data.funnel.passed],
    ['hired', data.funnel.hired],
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mq-console-title text-[1.65rem]">{t('analyticsTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('analyticsHint')}</p>
        </div>
        <button type="button" className="mq-console-btn-ghost" onClick={exportCsv}>
          {t('exportCsv')}
        </button>
      </div>

      <section className="mq-console-surface rounded-xl p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--c-text)]">{t('funnel')}</h3>
        <div className="grid gap-2 sm:grid-cols-5">
          {funnelSteps.map(([key, value], i) => (
            <div key={key} className="mq-console-card p-3 text-center">
              <p className="text-xs uppercase tracking-wider text-[var(--c-text-2)]">{key}</p>
              <p className="mt-1 mq-console-title text-[1.65rem]">{value}</p>
              {i < funnelSteps.length - 1 ? (
                <p className="mt-1 text-[10px] text-[var(--c-primary)]">→</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mq-console-surface rounded-xl p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--c-text)]">{t('histogram')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.histogram}>
              <CartesianGrid stroke="var(--c-border)" vertical={false} />
              <XAxis dataKey="bucket" tick={{ fill: 'var(--c-text-2)', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--c-text-2)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--c-surface)',
                  border: '1px solid var(--c-border)',
                  borderRadius: 8,
                }}
              />
              <ReferenceLine x="70-79" stroke="#D4AF37" strokeDasharray="4 4" />
              <Bar dataKey="count" fill="#14B8A6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mq-console-surface overflow-x-auto rounded-xl p-4">
        <h3 className="mb-3 text-sm font-medium text-[var(--c-text)]">{t('rolePerf')}</h3>
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-[var(--c-text-2)]">
            <tr>
              <th className="p-2 text-start">{t('role')}</th>
              <th className="p-2 text-start">{t('candidates')}</th>
              <th className="p-2 text-start">{t('kpiAvgScore')}</th>
              <th className="p-2 text-start">{t('dropOff')}</th>
            </tr>
          </thead>
          <tbody>
            {data.rolePerf.map((r) => (
              <tr key={r.jobId} className="border-t border-[var(--c-border)] text-[var(--c-text)]">
                <td className="p-2">{isAr ? r.titleAr || r.title : r.title}</td>
                <td className="p-2">{r.candidates}</td>
                <td className="p-2">{r.avgScore}</td>
                <td className="p-2">{r.dropOff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="mq-console-card p-4">
          <h3 className="text-sm font-medium tracking-tight text-[var(--c-text)]">{t('timeToHire')}</h3>
          <p className="mt-2 mq-console-metric text-[2rem] text-[var(--c-primary)]">
            {data.timeToHireDays} {t('days')}
          </p>
        </section>
        <section className="mq-console-card p-4">
          <h3 className="text-sm font-medium tracking-tight text-[var(--c-text)]">{t('roi')}</h3>
          <p className="mt-2 text-sm text-[var(--c-text-2)]">
            {t('roiLine', {
              hours: data.roi.hoursSaved,
              labor: data.roi.laborSavedUsd.toLocaleString(),
              sub: data.roi.subscriptionUsd.toLocaleString(),
              net: data.roi.netSavingsUsd.toLocaleString(),
            })}
          </p>
        </section>
      </div>
    </div>
  );
}
