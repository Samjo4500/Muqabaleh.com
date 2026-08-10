'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const STAGES = ['NEW', 'REVIEWING', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN'];

type AppRow = {
  id: string;
  stage: string;
  score: number | null;
  source: string;
  employerNote: string | null;
  createdAt: string;
  candidate: { id: string; email: string; name: string | null };
  job: { id: string; title: string; company: { name: string } };
};

export default function B2bApplicationsPage() {
  const [items, setItems] = useState<AppRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/b2b?tab=applications&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const setStage = async (applicationId: string, stage: string) => {
    const res = await fetch('/api/admin/b2b', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'application', applicationId, stage }),
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
        title={{ ar: 'طلبات التوظيف', en: 'B2B Applications' }}
        description={{
          ar: 'خط أنابيب التقديم على وظائف الشركات — تغيير المرحلة وملاحظات صاحب العمل.',
          en: 'Employer ATS pipeline — stage overrides and notes.',
        }}
      />
      <div className="mb-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" placeholder="Search…" />
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">Candidate</th>
              <th className="p-3 text-start">Job / Company</th>
              <th className="p-3 text-start">Stage</th>
              <th className="p-3 text-start">Score</th>
              <th className="p-3 text-start">Move</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{a.candidate.name || '—'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{a.candidate.email}</div>
                </td>
                <td className="p-3">
                  {a.job.title}
                  <div className="text-xs text-[var(--text-muted)]">{a.job.company.name}</div>
                </td>
                <td className="p-3">
                  <Badge variant="outline">{a.stage}</Badge>
                </td>
                <td className="p-3">{a.score ?? '—'}</td>
                <td className="p-3">
                  <select
                    className="h-9 rounded-md border border-white/10 bg-transparent px-2 text-xs"
                    value={a.stage}
                    onChange={(e) => void setStage(a.id, e.target.value)}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">No applications yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
