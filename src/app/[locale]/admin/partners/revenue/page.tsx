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
};

export default function Page() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [commissionBps, setCommissionBps] = useState(0);
  const [summary, setSummary] = useState({ lifetimeCents: 0, pendingCents: 0 });

  useEffect(() => {
    // Prefer real partner revenue for the signed-in admin/partner session.
    // Demo partner minting is disabled unless DEMO_PARTNER_LOGIN_SECRET is set.
    void fetch('/api/partner/revenue')
      .then(async (r) => {
        if (r.ok) return r.json();
        return { payouts: [], commissionBps: 0, summary: { lifetimeCents: 0, pendingCents: 0 } };
      })
      .then((d) => {
        setPayouts(d.payouts || []);
        setCommissionBps(d.commissionBps || 0);
        setSummary(d.summary || { lifetimeCents: 0, pendingCents: 0 });
      })
      .catch(() => undefined);
  }, []);

  const money = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      cents / 100,
    );

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title={{ ar: 'حصة الإيرادات', en: 'Revenue share' }}
        description={{
          ar: 'عمولة الشركاء والمدفوعات من محفظة العلامة البيضاء.',
          en: 'Partner commission and payouts from the white-label portfolio.',
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase text-white/45">Commission</div>
          <div className="mt-1 text-2xl font-bold">{(commissionBps / 100).toFixed(1)}%</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase text-white/45">Lifetime</div>
          <div className="mt-1 text-2xl font-bold">{money(summary.lifetimeCents)}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <div className="text-xs uppercase text-white/45">Pending</div>
          <div className="mt-1 text-2xl font-bold">{money(summary.pendingCents)}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-left text-xs uppercase text-white/45">
            <tr>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Note</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((p) => (
              <tr key={p.id} className="border-t border-white/8">
                <td className="px-4 py-3 text-white/70">
                  {new Date(p.periodStart).toLocaleDateString()} →{' '}
                  {new Date(p.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-semibold">{money(p.amountCents)}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-white/45">{p.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
