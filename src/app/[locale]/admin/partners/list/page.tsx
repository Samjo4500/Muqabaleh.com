'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Partner = {
  id: string;
  slug: string;
  name: string;
  status: string;
  plan: string;
  contactEmail: string;
  contactName: string;
  country: string | null;
  commissionBps: number;
  creditsPool: number;
  customDomain: string | null;
  primaryColor: string;
  _count: { companies: number; users: number; payouts: number };
};

export default function PartnersListPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/partners/manage?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (partnerId: string, status: string) => {
    const res = await fetch('/api/admin/partners/manage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId, status }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Failed');
      return;
    }
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'محفظة الشركاء', en: 'Partner Portfolio' }}
        description={{
          ar: 'كل شركاء العلامة البيضاء — الحالة، العمولة، الشركات المرتبطة، والتعليق.',
          en: 'All white-label partners — status, commission, linked companies, suspend/activate.',
        }}
      />
      <div className="mb-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="max-w-xs" />
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">Partner</th>
              <th className="p-3 text-start">Plan</th>
              <th className="p-3 text-start">Commission</th>
              <th className="p-3 text-start">Linked</th>
              <th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ background: p.primaryColor }} />
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {p.slug} · {p.contactEmail}
                      </div>
                      {p.customDomain ? (
                        <div className="text-xs text-cyan-300">{p.customDomain}</div>
                      ) : null}
                    </div>
                  </div>
                </td>
                <td className="p-3">{p.plan}</td>
                <td className="p-3">{(p.commissionBps / 100).toFixed(1)}%</td>
                <td className="p-3">
                  {p._count.companies} co · {p._count.users} users · {p._count.payouts} payouts
                </td>
                <td className="p-3">
                  <Badge variant="outline">{p.status}</Badge>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.status !== 'ACTIVE' ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => void setStatus(p.id, 'ACTIVE')}>
                        Activate
                      </Button>
                    ) : null}
                    {p.status !== 'SUSPENDED' ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => void setStatus(p.id, 'SUSPENDED')}>
                        Suspend
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-[var(--text-muted)]">
                  No partners yet — approve an application to provision one.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
