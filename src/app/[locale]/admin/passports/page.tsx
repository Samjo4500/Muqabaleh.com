'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Row = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  role: string;
  location: string | null;
  isOptedIn: boolean;
  isVisible: boolean;
  openToWork: boolean;
  muqabalehScore: number | null;
  verificationId: string | null;
  passportStatus: string;
  latestScore: number | null;
};

export default function PassportsAdminPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [visibility, setVisibility] = useState('all');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/passports?q=${encodeURIComponent(q)}&visibility=${visibility}`,
      );
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [q, visibility]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (userId: string, body: Record<string, boolean>) => {
    setBusy(userId);
    try {
      const res = await fetch('/api/admin/passports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...body }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Update failed');
        return;
      }
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'جوازات المقابلة', en: 'Passport Moderation' }}
        description={{
          ar: 'التحكم بظهور الجواز العام، الاشتراك في قاعدة المرشحين، وإلغاء النشر.',
          en: 'Control public passport visibility, candidate-pool opt-in, and revoke publishing.',
        }}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search email / role…"
          className="max-w-xs"
        />
        <select
          className="h-10 rounded-md border border-white/10 bg-transparent px-3 text-sm"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
        >
          <option value="all">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5 text-start">
            <tr>
              <th className="p-3 text-start">Candidate</th>
              <th className="p-3 text-start">Role</th>
              <th className="p-3 text-start">Score</th>
              <th className="p-3 text-start">Status</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((row) => (
              <tr key={row.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{row.name || '—'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{row.email}</div>
                  {row.verificationId ? (
                    <div className="text-xs text-cyan-300">{row.verificationId}</div>
                  ) : null}
                </td>
                <td className="p-3">
                  {row.role}
                  <div className="text-xs text-[var(--text-muted)]">{row.location || '—'}</div>
                </td>
                <td className="p-3">{row.latestScore ?? row.muqabalehScore ?? '—'}</td>
                <td className="p-3">
                  <Badge variant="outline">{row.passportStatus}</Badge>
                  <div className="mt-1 text-xs text-[var(--text-muted)]">
                    opt:{row.isOptedIn ? 'Y' : 'N'} · vis:{row.isVisible ? 'Y' : 'N'}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy === row.userId}
                      onClick={() => void patch(row.userId, { isVisible: true, isOptedIn: true })}
                    >
                      Publish
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={busy === row.userId}
                      onClick={() => void patch(row.userId, { isVisible: false, isOptedIn: false })}
                    >
                      Revoke
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">
                  <BiInline ar="لا جوازات في القاعدة بعد" en="No candidate-pool passports yet" />
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
