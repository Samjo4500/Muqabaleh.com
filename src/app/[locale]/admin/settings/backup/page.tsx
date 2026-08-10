'use client';

import { useCallback, useEffect, useState } from 'react';
import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Log = {
  id: string;
  type: string;
  status: string;
  notes: string | null;
  location: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export default function Page() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [guidance, setGuidance] = useState<{
    database?: string;
    website?: string;
    operational?: string;
  }>({});
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/backup');
    const data = await res.json();
    if (Array.isArray(data.logs)) setLogs(data.logs);
    if (data.guidance) setGuidance(data.guidance);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (action: 'export' | 'health' | 'note') => {
    setBusy(true);
    setMsg('');
    try {
      if (action === 'export') {
        await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'export' }),
        });
        window.location.href = '/api/admin/backup?download=1';
        setMsg('Download started — check Backup log after refresh.');
        await load();
        return;
      }
      const notes =
        action === 'note'
          ? window.prompt('Note (e.g. Supabase PITR verified)', 'Supabase backup verified') ||
            'Operator note'
          : undefined;
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Failed');
        return;
      }
      setMsg(action === 'health' ? `Health OK · ${data.latencyMs}ms` : 'Saved');
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title={{ ar: 'النسخ الاحتياطي والصيانة', en: 'Backup & Maintenance' }}
        description={{
          ar: 'تصدير تشغيلي من التطبيق + اعتماد نسخ Supabase لقاعدة البيانات وGit/Vercel للموقع.',
          en: 'App operational export + Supabase for full DB recovery and Git/Vercel for the website.',
        }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={busy} onClick={() => void run('export')}>
              <BiInline ar="تصدير JSON" en="Export JSON" />
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void run('health')}>
              <BiInline ar="فحص الصحة" en="Health check" />
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void run('note')}>
              <BiInline ar="تأكيد نسخ Supabase" en="Log Supabase backup" />
            </Button>
          </div>
        }
      />

      {msg ? <p className="text-sm text-cyan-300">{msg}</p> : null}

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4 text-sm">
          <h3 className="mb-2 font-medium">
            <BiInline ar="قاعدة البيانات" en="Database" />
          </h3>
          <p className="text-[var(--text-muted)]">
            {guidance.database ||
              'Full Postgres backups/PITR are managed in Supabase (Database → Backups).'}
          </p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4 text-sm">
          <h3 className="mb-2 font-medium">
            <BiInline ar="الموقع" en="Website" />
          </h3>
          <p className="text-[var(--text-muted)]">
            {guidance.website ||
              'Website source of truth is GitHub + Vercel deployments.'}
          </p>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4 text-sm">
          <h3 className="mb-2 font-medium">
            <BiInline ar="التصدير التشغيلي" en="Operational export" />
          </h3>
          <p className="text-[var(--text-muted)]">
            {guidance.operational ||
              'JSON snapshot of key tables (no password hashes / API secrets). Daily cron at 02:00 UTC.'}
          </p>
        </section>
      </div>

      <AdminConfigPanel
        settingKey="backup"
        title={{ ar: 'جدولة النسخ', en: 'Backup schedule' }}
        description={{
          ar: 'DAILY يشغّل ملخصاً يومياً الساعة 02:00 UTC. النسخ الكامل يبقى في Supabase.',
          en: 'DAILY runs a summary snapshot at 02:00 UTC. Full DB recovery stays on Supabase.',
        }}
        sections={[
          {
            title: { ar: 'عمليات النظام', en: 'System operations' },
            fields: [
              {
                key: 'schedule',
                label: { ar: 'جدولة النسخ الاحتياطي', en: 'Scheduled backup' },
                type: 'select',
                value: 'DAILY',
                options: [
                  { value: 'MANUAL', label: 'Manual only' },
                  { value: 'DAILY', label: 'Daily (02:00 UTC)' },
                  { value: 'WEEKLY', label: 'Weekly (Mondays)' },
                ],
              },
              {
                key: 'health',
                label: { ar: 'فحص صحة النظام', en: 'System health check' },
                type: 'toggle',
                value: true,
              },
              {
                key: 'errorLog',
                label: { ar: 'ملاحظات المشغّل', en: 'Operator notes' },
                type: 'textarea',
                value: '',
              },
            ],
          },
        ]}
      />

      <section className="rounded-2xl border border-white/10">
        <div className="border-b border-white/10 px-4 py-3 text-sm font-medium">
          <BiInline ar="سجل النسخ الاحتياطي" en="Backup log" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="p-3 text-start">Type</th>
                <th className="p-3 text-start">Status</th>
                <th className="p-3 text-start">Notes</th>
                <th className="p-3 text-start">Size</th>
                <th className="p-3 text-start">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="p-3">{l.type}</td>
                  <td className="p-3">
                    <Badge variant="outline">{l.status}</Badge>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{l.notes || '—'}</td>
                  <td className="p-3">
                    {l.sizeBytes != null ? `${Math.round(l.sizeBytes / 1024)} KB` : '—'}
                  </td>
                  <td className="p-3">{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {!logs.length ? (
                <tr>
                  <td colSpan={5} className="p-6 text-[var(--text-muted)]">
                    No backup logs yet — run Export or wait for the daily cron.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
