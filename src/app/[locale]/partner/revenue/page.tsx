'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeader, Panel, money } from '@/components/partner/ui';
import type { PartnerPayoutRecord } from '@/lib/partner/types';

export default function PartnerRevenuePage() {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const [commissionBps, setCommissionBps] = useState(0);
  const [payouts, setPayouts] = useState<PartnerPayoutRecord[]>([]);
  const [summary, setSummary] = useState({ lifetimeCents: 0, pendingCents: 0 });

  useEffect(() => {
    void fetch('/api/partner/revenue')
      .then((r) => r.json())
      .then((d) => {
        setCommissionBps(d.commissionBps || 0);
        setPayouts(d.payouts || []);
        setSummary(d.summary || { lifetimeCents: 0, pendingCents: 0 });
      });
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow={t('navRevenue')}
        title={t('revenueTitle')}
        description={t('revenueDesc')}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="pc-card pc-kpi p-5">
          <div className="text-xs uppercase tracking-wider text-white/45">{t('commissionRate')}</div>
          <div className="mt-2 pc-display text-3xl font-bold">{(commissionBps / 100).toFixed(1)}%</div>
        </div>
        <div className="pc-card pc-kpi p-5">
          <div className="text-xs uppercase tracking-wider text-white/45">{t('lifetimeEarnings')}</div>
          <div className="mt-2 pc-display text-3xl font-bold">
            {money(summary.lifetimeCents, 'USD', locale)}
          </div>
        </div>
        <div className="pc-card pc-kpi p-5">
          <div className="text-xs uppercase tracking-wider text-white/45">{t('pendingPayouts')}</div>
          <div className="mt-2 pc-display text-3xl font-bold">
            {money(summary.pendingCents, 'USD', locale)}
          </div>
        </div>
      </div>

      <Panel title={t('payoutHistory')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="pb-3 pe-3">{t('period')}</th>
                <th className="pb-3 pe-3">{t('amount')}</th>
                <th className="pb-3 pe-3">{t('status')}</th>
                <th className="pb-3">{t('note')}</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-t border-white/8">
                  <td className="py-3 pe-3 text-white/70">
                    {new Date(p.periodStart).toLocaleDateString(locale)} →{' '}
                    {new Date(p.periodEnd).toLocaleDateString(locale)}
                  </td>
                  <td className="py-3 pe-3 font-semibold tabular-nums">
                    {money(p.amountCents, p.currency, locale)}
                  </td>
                  <td className="py-3 pe-3">
                    <span className="rounded-full bg-white/5 px-2 py-1 text-xs">{p.status}</span>
                  </td>
                  <td className="py-3 text-white/45">{p.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
