'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Row = {
  id: string;
  email: string;
  fullName: string;
  country: string;
  university: string;
  major: string;
  eligibility: string;
  universityEmail: string | null;
  proofNote: string | null;
  status: string;
  creditsRemaining: number;
  expiresAt: string | null;
  createdAt: string;
};

export default function Page() {
  const [items, setItems] = useState<Row[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/student100');
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
      if (data.campaign?.remaining != null) setRemaining(data.campaign.remaining);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: 'activate' | 'reject') => {
    const res = await fetch('/api/admin/student100', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    if (!res.ok) {
      alert((await res.json()).error || 'Failed');
      return;
    }
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'حملة الطلاب 100', en: 'Student 100' }}
        description={{
          ar: 'مراجعة الطلبات وتفعيل باقة 3 مقابلات لمدة 30 يوماً — ليست جيني برو.',
          en: 'Review applications and activate the 3-interview pack for 30 days — not Jeannie Pro.',
        }}
      />
      <p className="mb-4 text-sm text-[var(--text-muted)]">
        <BiInline
          ar={`المتبقي: ${remaining ?? '—'}`}
          en={`Remaining: ${remaining ?? '—'}`}
        />
      </p>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="text-left text-xs text-[var(--text-muted)]">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">University</th>
              <th className="px-4 py-2">Country</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-white/5">
                <td className="px-4 py-2.5">{row.fullName}</td>
                <td className="px-4 py-2.5">
                  {row.email}
                  {row.universityEmail ? (
                    <div className="text-xs text-[var(--text-muted)]">{row.universityEmail}</div>
                  ) : null}
                </td>
                <td className="px-4 py-2.5">
                  {row.university}
                  <div className="text-xs text-[var(--text-muted)]">{row.major}</div>
                </td>
                <td className="px-4 py-2.5">{row.country}</td>
                <td className="px-4 py-2.5">
                  <Badge variant="outline">{row.status}</Badge>
                </td>
                <td className="px-4 py-2.5">
                  {row.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => void act(row.id, 'activate')}>
                        Activate
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => void act(row.id, 'reject')}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)]">
                      {row.creditsRemaining} left
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {!loading && !items.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-[var(--text-muted)]">
                  No applications yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
