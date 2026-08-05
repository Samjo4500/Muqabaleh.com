'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { PageHeader, Panel, money } from '@/components/partner/ui';
import type { PartnerInvoiceRecord } from '@/lib/partner/types';

export default function PartnerBillingPage() {
  const t = useTranslations('partnerConsole');
  const locale = useLocale();
  const [plan, setPlan] = useState('GROWTH');
  const [creditsPool, setCreditsPool] = useState(0);
  const [invoices, setInvoices] = useState<PartnerInvoiceRecord[]>([]);
  const [plans, setPlans] = useState<
    Array<{ id: string; priceCents: number; credits: number; label: string }>
  >([]);

  useEffect(() => {
    void fetch('/api/partner/billing')
      .then((r) => r.json())
      .then((d) => {
        setPlan(d.plan);
        setCreditsPool(d.creditsPool);
        setInvoices(d.invoices || []);
        setPlans(d.plans || []);
      });
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow={t('navBilling')}
        title={t('billingTitle')}
        description={t('billingDesc')}
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {plans.map((p) => {
          const active = p.id === plan;
          return (
            <div
              key={p.id}
              className={`pc-card p-5 ${active ? 'pc-card-glow' : ''}`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-white/45">
                {p.label}
              </div>
              <div className="mt-2 pc-display text-3xl font-bold">
                {money(p.priceCents, 'USD', locale)}
                <span className="ms-1 text-sm font-medium text-white/40">/{t('month')}</span>
              </div>
              <div className="mt-2 text-sm text-white/55">
                {p.credits} {t('creditsIncluded')}
              </div>
              {active ? (
                <div className="mt-4 inline-flex rounded-full bg-[var(--pc-primary)]/20 px-3 py-1 text-xs font-bold text-[var(--pc-primary)]">
                  {t('currentPlan')}
                </div>
              ) : (
                <button type="button" className="pc-btn pc-btn-ghost mt-4">
                  {t('contactUpgrade')}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Panel title={`${t('creditsPool')}: ${creditsPool}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="pb-3 pe-3">{t('invoice')}</th>
                <th className="pb-3 pe-3">{t('amount')}</th>
                <th className="pb-3 pe-3">{t('status')}</th>
                <th className="pb-3">{t('issued')}</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-white/8">
                  <td className="py-3 pe-3 font-medium">{inv.number}</td>
                  <td className="py-3 pe-3 tabular-nums">
                    {money(inv.amountCents, inv.currency, locale)}
                  </td>
                  <td className="py-3 pe-3">{inv.status}</td>
                  <td className="py-3 text-white/45">
                    {new Date(inv.issuedAt).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
