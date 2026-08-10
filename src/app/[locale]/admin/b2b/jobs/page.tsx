'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Job = {
  id: string;
  title: string;
  titleAr: string | null;
  status: string;
  isPublic: boolean;
  isFeatured: boolean;
  city: string | null;
  country: string | null;
  company: { id: string; name: string; plan: string };
  _count: { applications: number };
  createdAt: string;
};

export default function B2bJobsPage() {
  const [items, setItems] = useState<Job[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/b2b?tab=jobs&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    void load();
  }, [load]);

  const patch = async (jobId: string, body: Record<string, unknown>) => {
    const res = await fetch('/api/admin/b2b', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'job', jobId, ...body }),
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
        title={{ ar: 'وظائف الشركات', en: 'B2B Jobs' }}
        description={{
          ar: 'وظائف أصحاب العمل — الحالة، الظهور العام، والتمييز.',
          en: 'Employer job posts — status, public visibility, featured flag.',
        }}
      />
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
              <th className="p-3 text-start">Job</th>
              <th className="p-3 text-start">Company</th>
              <th className="p-3 text-start">Apps</th>
              <th className="p-3 text-start">Flags</th>
              <th className="p-3 text-start">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((j) => (
              <tr key={j.id} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {j.city || j.country || '—'} · {new Date(j.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-3">
                  {j.company.name}
                  <div className="text-xs text-[var(--text-muted)]">{j.company.plan}</div>
                </td>
                <td className="p-3">{j._count.applications}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">{j.status}</Badge>
                    {j.isPublic ? <Badge variant="outline">Public</Badge> : null}
                    {j.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => void patch(j.id, { status: 'PAUSED' })}>
                      Pause
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void patch(j.id, { status: 'OPEN', isPublic: true })}>
                      Open
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => void patch(j.id, { isFeatured: !j.isFeatured })}>
                      Toggle feature
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">No B2B jobs yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
