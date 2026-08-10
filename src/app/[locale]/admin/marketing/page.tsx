'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Row = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  country: string | null;
  location: string | null;
  role: string | null;
  industry: string | null;
  source: string;
  utmSource: string | null;
  utmCampaign: string | null;
  marketingOptIn: boolean;
  createdAt: string;
  lastSeenAt: string;
};

export default function MarketingContactsPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [optedIn, setOptedIn] = useState(0);
  const [q, setQ] = useState('');
  const [opted, setOpted] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (opted) params.set('opted', opted);
      params.set('limit', '500');
      const res = await fetch(`/api/admin/marketing/contacts?${params}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
      setTotal(Number(data.total || 0));
      setOptedIn(Number(data.optedIn || 0));
    } finally {
      setLoading(false);
    }
  }, [q, opted]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'جهات التسويق', en: 'Marketing Contacts' }}
        description={{
          ar: 'كل البريد والبيانات الشخصية الملتقطة بموافقة — تصدير CSV للحملات.',
          en: 'Every email + PII captured with consent — CSV export for campaigns.',
        }}
        actions={
          <Button asChild size="sm" variant="outline">
            <a href="/api/admin/marketing/contacts?format=csv&limit=2000">
              <BiInline ar="تصدير CSV" en="Export CSV" />
            </a>
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-white/60">
        <span>
          <BiInline ar="الإجمالي" en="Total" />: {total}
        </span>
        <span>
          <BiInline ar="موافقة تسويق" en="Opted in" />: {optedIn}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
          placeholder="Search email / name / phone…"
        />
        <select
          value={opted}
          onChange={(e) => setOpted(e.target.value)}
          className="h-10 rounded-md border border-white/10 bg-transparent px-3 text-sm"
        >
          <option value="">All</option>
          <option value="1">Opted in</option>
          <option value="0">Opted out</option>
        </select>
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-white/5 text-start text-white/50">
            <tr>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Country</th>
              <th className="px-3 py-2 font-medium">Source</th>
              <th className="px-3 py-2 font-medium">UTM</th>
              <th className="px-3 py-2 font-medium">Opt-in</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-white/40">
                  Loading…
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-white/40">
                  No contacts yet
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="px-3 py-2 text-white">{r.email}</td>
                  <td className="px-3 py-2 text-white/80">{r.name || '—'}</td>
                  <td className="px-3 py-2 text-white/70">{r.phone || '—'}</td>
                  <td className="px-3 py-2 text-white/70">{r.role || '—'}</td>
                  <td className="px-3 py-2 text-white/70">{r.country || r.location || '—'}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="border-white/15 text-white/70">
                      {r.source}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-xs text-white/50">
                    {[r.utmSource, r.utmCampaign].filter(Boolean).join(' / ') || '—'}
                  </td>
                  <td className="px-3 py-2">
                    {r.marketingOptIn ? (
                      <span className="text-teal-300">Y</span>
                    ) : (
                      <span className="text-white/35">N</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
