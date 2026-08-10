'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Badge } from '@/components/ui/badge';

type Payout = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  note: string | null;
  partner: { name: string; slug: string };
};

type Total = { status: string; _sum: { amountCents: number | null }; _count: { _all: number } };

export default function Page() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [totals, setTotals] = useState<Total[]>([]);

  useEffect(() => {
    void fetch('/api/admin/partners/payouts')
      .then((r) => r.json())
      .then((d) => {
        setPayouts(Array.isArray(d.items) ? d.items : []);
        setTotals(Array.isArray(d.totals) ? d.totals : []);
      })
      .catch(() => undefined);
  }, []);

  const money = (cents: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(cents / 100);

  const sum = (status?: string) =>
    totals
      .filter((t) => !status || t.status === status)
      .reduce((a, t) => a + (t._sum.amountCents ?? 0), 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={{ ar: 'حصة الإيرادات', en: 'Revenue share' }}
        description={{
          ar: 'إجمالي مدفوعات الشركاء عبر كل المحفظة (PartnerPayout).',
          en: 'Aggregate partner payouts across the full portfolio (PartnerPayout).',
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase text-white/45">Lifetime</div>
          <div className="mt-1 text-2xl font-bold">{money(sum())}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase text-white/45">Pending</div>
          <div className="mt-1 text-2xl font-bold">{money(sum('PENDING') + sum('PROCESSING'))}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase text-white/45">Completed</div>
          <div className="mt-1 text-2xl font-bold">{money(sum('COMPLETED'))}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase text-white/45">
            <tr>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-t border-white/8">
                <td className="px-4 py-3">
                  {p.partner.name}
                  <div className="text-xs text-white/45">{p.partner.slug}</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {new Date(p.periodStart).toLocaleDateString()} →{' '}
                  {new Date(p.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {money(p.amountCents)} {p.currency}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-white/55">{p.note || '—'}</td>
              </tr>
            ))}
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-white/45">
                  No partner payouts yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
