'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { AgencyClient } from '@/lib/console/types';

export default function ClientsPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const [clients, setClients] = useState<AgencyClient[]>([]);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/clients`)
      .then((r) => r.json())
      .then((j) => setClients(j.clients || []));
  }, [tenantSlug]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('clientsTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('clientsHint')}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => (
          <div key={c.id} className="mq-console-card p-4">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: c.primaryColor || '#14B8A6' }}
              >
                {c.name.slice(0, 1)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-[var(--c-text)]">{c.name}</p>
                <p className="text-xs text-[var(--c-text-2)]">
                  {c.industry} · {c.status}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-[var(--c-text-2)]">{t('interviews')}</dt>
                <dd className="font-bold text-[var(--c-text)]">{c.interviewsVolume}</dd>
              </div>
              <div>
                <dt className="text-[var(--c-text-2)]">{t('candidates')}</dt>
                <dd className="font-bold text-[var(--c-text)]">{c.candidateCount}</dd>
              </div>
              <div>
                <dt className="text-[var(--c-text-2)]">{t('revenue')}</dt>
                <dd className="font-bold text-[var(--c-primary)]">
                  ${c.revenueUsd.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--c-text-2)]">{t('commission')}</dt>
                <dd className="font-bold text-[var(--c-text)]">
                  {(c.commissionBps / 100).toFixed(1)}%
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-[var(--c-text-2)]">
              {t('clientIsolation')} · /console/{c.slug}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
