'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Session = {
  id: string;
  status: string;
  language: string;
  overallScore: number | null;
  numQuestionsTotal: number;
  numQuestionsAnswered: number;
  createdAt: string;
  completedAt: string | null;
  user: { email: string; name: string | null; tier: string };
  prequal: {
    targetRole: string;
    seniorityLevel: string;
    interviewRound: string;
  } | null;
};

export default function MockSessionsPage() {
  const [items, setItems] = useState<Session[]>([]);
  const [byStatus, setByStatus] = useState<{ status: string; _count: { _all: number } }[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mock-sessions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
      if (Array.isArray(data.byStatus)) setByStatus(data.byStatus);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'جلسات المحاكاة', en: 'AI Mock Sessions' }}
        description={{
          ar: 'محرك المحاكاة الجديد (prequal → session) — منفصل عن جلسات Interview القديمة.',
          en: 'New AI mock engine (prequal → session) — separate from legacy Interview rows.',
        }}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {byStatus.map((s) => (
          <Badge key={s.status} variant="outline">
            {s.status}: {s._count._all}
          </Badge>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" placeholder="Search…" />
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">User</th>
              <th className="p-3 text-start">Role / Round</th>
              <th className="p-3 text-start">Progress</th>
              <th className="p-3 text-start">Score</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{s.user.name || '—'}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {s.user.email} · {s.user.tier}
                  </div>
                </td>
                <td className="p-3">
                  {s.prequal?.targetRole || '—'}
                  <div className="text-xs text-[var(--text-muted)]">
                    {s.prequal?.seniorityLevel} · {s.prequal?.interviewRound} · {s.language}
                  </div>
                </td>
                <td className="p-3">
                  {s.numQuestionsAnswered}/{s.numQuestionsTotal}
                </td>
                <td className="p-3">{s.overallScore != null ? Math.round(s.overallScore) : '—'}</td>
                <td className="p-3">
                  <Badge variant="outline">{s.status}</Badge>
                  <div className="text-xs text-[var(--text-muted)]">
                    {new Date(s.createdAt).toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">No mock sessions yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
