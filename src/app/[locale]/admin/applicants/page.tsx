'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { localePath } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Row = {
  userId: string;
  email: string;
  name: string | null;
  role: string;
  location: string | null;
  passportStatus: string;
  latestScore: number | null;
  muqabalehScore: number | null;
  interviewCount: number;
  isVisible: boolean;
  openToWork: boolean;
};

export default function Page() {
  const locale = useLocale();
  const [items, setItems] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/passports?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
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
        title={{ ar: 'قاعدة بيانات المتقدمين', en: 'Applicants & Talent Pool' }}
        description={{
          ar: 'مرشحو CandidatePool الحقيقيون — للجوازات العامة وطلبات B2B استخدم الروابط أدناه.',
          en: 'Real CandidatePool talent — use links below for passport moderation and B2B applications.',
        }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={localePath('/admin/passports', locale)}
              className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm"
            >
              Passports
            </Link>
            <Link
              href={localePath('/admin/b2b/applications', locale)}
              className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm"
            >
              B2B apps
            </Link>
          </div>
        }
      />
      <div className="mb-4 flex gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" placeholder="Search…" />
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          <BiInline ar="تحديث" en="Refresh" />
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">Applicant</th>
              <th className="p-3 text-start">Role / Location</th>
              <th className="p-3 text-start">Score</th>
              <th className="p-3 text-start">Interviews</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.userId} className="border-t border-white/5">
                <td className="p-3">
                  <div className="font-medium">{r.name || '—'}</div>
                  <div className="text-xs text-[var(--text-muted)]">{r.email}</div>
                </td>
                <td className="p-3">
                  {r.role}
                  <div className="text-xs text-[var(--text-muted)]">{r.location || '—'}</div>
                </td>
                <td className="p-3">{r.latestScore ?? r.muqabalehScore ?? '—'}</td>
                <td className="p-3">{r.interviewCount}</td>
                <td className="p-3">
                  <Badge variant="outline">{r.passportStatus}</Badge>
                  {r.openToWork ? (
                    <div className="text-xs text-emerald-300">Open to work</div>
                  ) : null}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-[var(--text-muted)]">
                  No opted-in talent pool rows yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
