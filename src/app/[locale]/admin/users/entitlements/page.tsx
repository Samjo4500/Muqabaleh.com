'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  sessionsLeft: number;
  masteryMocksLeft: number;
  subscriptionExpiresAt: string | null;
  jeannieProfile: { isActive: boolean; targetRoles: string[] } | null;
  _count: { interviews: number; interviewSessions: number };
};

const PLANS = ['JEANNIE', 'JEANNIE_PRO', 'MASTERY_PACK', 'PRO', 'UNLIMITED'];

export default function EntitlementsPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/entitlements?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (userId: string, action: 'grant' | 'revoke', planKey?: string) => {
    const res = await fetch('/api/admin/entitlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, planKey, days: 30 }),
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
        title={{ ar: 'صلاحيات جيني', en: 'Jeannie Entitlements' }}
        description={{
          ar: 'منح أو إلغاء باقات جيني / برو / الإتقان دون تغيير مخطط قاعدة البيانات.',
          en: 'Grant or revoke Jeannie / Pro / Mastery plans — entitlements helpers only.',
        }}
      />
      <div className="mb-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" placeholder="Search email…" />
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">User</th>
              <th className="p-3 text-start">Tier</th>
              <th className="p-3 text-start">Credits</th>
              <th className="p-3 text-start">Profile</th>
              <th className="p-3 text-start">Grant / Revoke</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{u.name || '—'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{u.email}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {u._count.interviews} interviews · {u._count.interviewSessions} mocks
                  </div>
                </td>
                <td className="p-3">
                  <Badge variant="outline">{u.tier}</Badge>
                  <div className="text-xs text-[var(--text-muted)]">
                    {u.subscriptionExpiresAt
                      ? `exp ${new Date(u.subscriptionExpiresAt).toLocaleDateString()}`
                      : 'no expiry'}
                  </div>
                </td>
                <td className="p-3">
                  sessions {u.sessionsLeft} · mastery {u.masteryMocksLeft}
                </td>
                <td className="p-3">
                  {u.jeannieProfile ? (
                    <span className="text-xs">
                      {u.jeannieProfile.isActive ? 'active' : 'inactive'} ·{' '}
                      {(u.jeannieProfile.targetRoles || []).slice(0, 2).join(', ') || '—'}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {PLANS.map((p) => (
                      <Button
                        key={p}
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => void act(u.id, 'grant', p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button type="button" size="sm" onClick={() => void act(u.id, 'revoke')}>
                      Revoke
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">No users.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
