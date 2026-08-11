'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Revenue = {
  totalRevenue: number;
  totalInterviews: number;
  commissionUsd: number;
  clients: {
    id: string;
    name: string;
    interviewsVolume: number;
    revenueUsd: number;
    commissionUsd: number;
  }[];
};

export default function RevenuePage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [data, setData] = useState<Revenue | null>(null);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/revenue`)
      .then((r) => r.json())
      .then((j) => setData(j.revenue || null));
  }, [tenantSlug]);

  if (!data) return <p className="text-sm text-[var(--c-text-2)]">{t('loading')}</p>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mq-console-title text-[1.65rem]">{t('revenueTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('revenueHint')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="mq-console-card p-4">
          <p className="text-xs uppercase text-[var(--c-text-2)]">{t('revenue')}</p>
          <p className="mt-1 mq-console-metric text-[2rem] text-[var(--c-text)]">
            ${data.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="mq-console-card p-4">
          <p className="text-xs uppercase text-[var(--c-text-2)]">{t('interviews')}</p>
          <p className="mt-1 mq-console-metric text-[2rem] text-[var(--c-text)]">{data.totalInterviews}</p>
        </div>
        <div className="mq-console-card p-4">
          <p className="text-xs uppercase text-[var(--c-text-2)]">{t('commission')}</p>
          <p className="mt-1 mq-console-metric text-[2rem] text-[var(--c-primary)]">
            ${data.commissionUsd.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="mq-console-surface overflow-x-auto rounded-xl">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-[var(--c-text-2)]">
            <tr>
              <th className="p-3 text-start">{t('client')}</th>
              <th className="p-3 text-start">{t('interviews')}</th>
              <th className="p-3 text-start">{t('revenue')}</th>
              <th className="p-3 text-start">{t('commission')}</th>
            </tr>
          </thead>
          <tbody>
            {data.clients.map((c) => (
              <tr key={c.id} className="border-t border-[var(--c-border)] text-[var(--c-text)]">
                <td className="p-3">{c.name}</td>
                <td className="p-3">{c.interviewsVolume}</td>
                <td className="p-3">${c.revenueUsd.toLocaleString()}</td>
                <td className="p-3">${c.commissionUsd.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
