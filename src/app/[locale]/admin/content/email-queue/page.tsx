'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';

type Row = {
  id: string;
  to: string;
  subject: string;
  sendAt: string;
  sent: boolean;
  sentAt: string | null;
  error: string | null;
  createdAt: string;
};

export default function EmailQueuePage() {
  const [items, setItems] = useState<Row[]>([]);
  const [counts, setCounts] = useState({ pending: 0, sent: 0, failed: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/email-queue?filter=${filter}`);
      const data = await res.json();
      if (Array.isArray(data.items)) setItems(data.items);
      if (data.counts) setCounts(data.counts);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const process = async () => {
    setMsg('');
    const res = await fetch('/api/admin/email-queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'process' }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || 'Failed');
      return;
    }
    setMsg(`Processed · sent ${data.result?.sent ?? 0}, failed ${data.result?.failed ?? 0}`);
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'طابور البريد', en: 'Email Queue' }}
        description={{
          ar: 'رسائل EmailQueue المجدولة — عرض وتشغيل الإرسال المستحق.',
          en: 'Queued EmailQueue rows — inspect and process due sends.',
        }}
        actions={
          <Button type="button" size="sm" onClick={() => void process()}>
            <BiInline ar="معالجة المستحق" en="Process due" />
          </Button>
        }
      />
      {msg ? <p className="mb-4 text-sm text-cyan-300">{msg}</p> : null}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <AdminStatCard label={{ ar: 'معلّق', en: 'Pending' }} value={String(counts.pending)} icon={Mail} />
        <AdminStatCard label={{ ar: 'مُرسل', en: 'Sent' }} value={String(counts.sent)} icon={CheckCircle2} />
        <AdminStatCard label={{ ar: 'فشل', en: 'Failed' }} value={String(counts.failed)} icon={AlertTriangle} />
      </div>
      <div className="mb-4 flex gap-2">
        {['all', 'pending', 'sent', 'failed'].map((f) => (
          <Button key={f} type="button" size="sm" variant={filter === f ? 'default' : 'outline'} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" onClick={() => void load()}>
          Refresh
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-start">To</th>
              <th className="p-3 text-start">Subject</th>
              <th className="p-3 text-start">Send at</th>
              <th className="p-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="p-3">{r.to}</td>
                <td className="p-3">{r.subject}</td>
                <td className="p-3">{new Date(r.sendAt).toLocaleString()}</td>
                <td className="p-3">
                  <Badge variant="outline">{r.sent ? 'SENT' : r.error ? 'FAILED' : 'PENDING'}</Badge>
                  {r.error ? <div className="mt-1 text-xs text-amber-400">{r.error.slice(0, 100)}</div> : null}
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-[var(--text-muted)]">Queue empty.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
