'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { localePath } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

type Payout = {
  id: string;
  amountCents: number;
  currency: string;
  status: string;
  periodStart: string;
  periodEnd: string;
  paidAt: string | null;
  note: string | null;
  partner: { id: string; name: string; slug: string; contactEmail: string };
};

export default function Page() {
  const locale = useLocale();
  const [items, setItems] = useState<Payout[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/partners/payouts?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (payoutId: string, status: string) => {
    const res = await fetch('/api/admin/partners/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payoutId, status }),
    });
    if (!res.ok) {
      alert((await res.json()).error || 'Failed');
      return;
    }
    await load();
  };

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title={{ ar: 'مدفوعات الشركاء', en: 'Partner Payouts' }}
        description={{
          ar: 'تحويلات عمولة الشركاء من PartnerPayout. لمدفوعات المحاورين استخدم لوحة المحاورين.',
          en: 'Partner commission payouts from PartnerPayout. For interviewer payouts use the interviewer console.',
        }}
        actions={
          <Link
            href={localePath('/admin/payouts', locale)}
            className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm hover:bg-white/5"
          >
            <BiInline ar="مدفوعات المحاورين" en="Interviewer payouts" />
          </Link>
        }
      />
      <div className="flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" placeholder="Search partner…" />
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">Partner</th>
              <th className="p-3 text-start">Amount</th>
              <th className="p-3 text-start">Period</th>
              <th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{p.partner.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{p.partner.contactEmail}</div>
                </td>
                <td className="p-3">
                  {(p.amountCents / 100).toFixed(2)} {p.currency}
                </td>
                <td className="p-3 text-xs">
                  {new Date(p.periodStart).toLocaleDateString()} → {new Date(p.periodEnd).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <Badge variant="outline">{p.status}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => void setStatus(p.id, 'PROCESSING')}>
                      Process
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void setStatus(p.id, 'COMPLETED')}>
                      Complete
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void setStatus(p.id, 'FAILED')}>
                      Fail
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">No partner payouts yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
