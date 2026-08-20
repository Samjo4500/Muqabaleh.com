'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

type Filter = 'PENDING' | 'ALL' | 'ACTIVATED' | 'REJECTED';

export default function Page() {
  const [items, setItems] = useState<Row[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('PENDING');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/student100');
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
      if (data.campaign?.remaining != null) setRemaining(data.campaign.remaining);
      if (typeof data.pending === 'number') setPending(data.pending);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const claim = new URLSearchParams(window.location.search).get('claim');
    if (claim) {
      setSelectedId(claim);
      setFilter('ALL');
    }
  }, []);

  const visible = useMemo(() => {
    if (filter === 'ALL') return items;
    return items.filter((row) => row.status === filter);
  }, [filter, items]);

  const selected = items.find((row) => row.id === selectedId) || visible[0] || null;

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id);
  }, [selected, selectedId]);

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

  const filters: { id: Filter; ar: string; en: string }[] = [
    { id: 'PENDING', ar: `بانتظار المراجعة (${pending})`, en: `Needs review (${pending})` },
    { id: 'ALL', ar: 'الكل', en: 'All' },
    { id: 'ACTIVATED', ar: 'مفعّل', en: 'Activated' },
    { id: 'REJECTED', ar: 'مرفوض', en: 'Rejected' },
  ];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'مركز تواصل الطلاب 100', en: 'Student 100 Contact Center' }}
        description={{
          ar: 'كل طلب يُرسل من صفحة /student100 يظهر هنا فقط — منفصل عن تذاكر الدعم، مع تنبيه ذهبي في الجرس.',
          en: 'Every submission from /student100 lands here only — separate from support tickets, with a gold bell alert.',
        }}
      />
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50">
        <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-200">
          S100
        </span>
        <BiInline
          ar={`${pending} طلب يحتاج مراجعة · المتبقي ${remaining ?? '—'} باقة`}
          en={`${pending} need review · ${remaining ?? '—'} packs remaining`}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs',
              filter === f.id
                ? 'border-amber-400/50 bg-amber-500/15 text-amber-100'
                : 'border-white/10 text-white/55 hover:border-white/20 hover:text-white',
            )}
          >
            <BiInline ar={f.ar} en={f.en} />
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-white/10">
          {visible.map((row) => {
            const active = selected?.id === row.id;
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                className={cn(
                  'block w-full border-b border-white/5 px-4 py-3 text-start last:border-0',
                  active ? 'bg-amber-500/10' : 'hover:bg-white/[0.03]',
                  row.status === 'PENDING' && !active && 'bg-amber-500/[0.04]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-white">{row.fullName}</span>
                  <Badge variant="outline">{row.status}</Badge>
                </div>
                <div className="mt-1 truncate text-xs text-white/50">{row.email}</div>
                <div className="mt-1 truncate text-xs text-white/40">
                  {row.university} · {row.country}
                </div>
              </button>
            );
          })}
          {!loading && !visible.length ? (
            <p className="px-4 py-8 text-sm text-[var(--text-muted)]">
              <BiInline ar="لا رسائل في هذا التصنيف" en="No messages in this filter" />
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-white/[0.03] p-5">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-200/80">
                  <BiInline ar="رسالة من صفحة الطلاب 100" en="Message from /student100" />
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">{selected.fullName}</h2>
                <p className="text-sm text-white/55">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-white/40">Email</dt>
                  <dd className="text-white">{selected.email}</dd>
                </div>
                <div>
                  <dt className="text-white/40">University email</dt>
                  <dd className="text-white">{selected.universityEmail || '—'}</dd>
                </div>
                <div>
                  <dt className="text-white/40">University</dt>
                  <dd className="text-white">{selected.university}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Major</dt>
                  <dd className="text-white">{selected.major}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Country</dt>
                  <dd className="text-white">{selected.country}</dd>
                </div>
                <div>
                  <dt className="text-white/40">Eligibility</dt>
                  <dd className="text-white">{selected.eligibility}</dd>
                </div>
              </dl>
              <div>
                <p className="text-xs text-white/40">
                  <BiInline ar="ملاحظة / إثبات" en="Proof / note" />
                </p>
                <p className="mt-1 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/80">
                  {selected.proofNote || '—'}
                </p>
              </div>
              {selected.status === 'PENDING' ? (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void act(selected.id, 'activate')}>Activate pack</Button>
                  <Button variant="outline" onClick={() => void act(selected.id, 'reject')}>
                    Reject
                  </Button>
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent('Muqabaleh Student 100')}`}
                    className="inline-flex h-9 items-center rounded-md border border-white/15 px-4 text-sm text-white/80 hover:bg-white/5"
                  >
                    Email
                  </a>
                </div>
              ) : (
                <p className="text-sm text-white/50">
                  {selected.status}
                  {selected.creditsRemaining ? ` · ${selected.creditsRemaining} credits left` : ''}
                  {selected.expiresAt ? ` · expires ${selected.expiresAt.slice(0, 10)}` : ''}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">
              <BiInline ar="اختر رسالة من القائمة" en="Select a message from the list" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
