'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'الجلسات المباشرة', en: 'Live Sessions' }}
      description={{
        ar: 'صفوف Interview القديمة — إنهاء إجباري أو إعادة فتح. لجلسات المحاكاة الجديدة انظر Mock Sessions.',
        en: 'Legacy Interview rows — force-stop or reopen. For the new mock engine see Mock Sessions.',
      }}
      resource="sessions"
      creatable={false}
      columns={[
        { key: 'id', label: { ar: 'معرف الجلسة', en: 'Session ID' } },
        {
          key: 'user',
          label: { ar: 'المستخدم', en: 'User' },
          render: (row) => {
            const u = row.user as { email?: string } | undefined;
            return u?.email ?? '—';
          },
        },
        { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
        { key: 'mode', label: { ar: 'النمط', en: 'Mode' } },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status)}</Badge>,
        },
        { key: 'overallScore', label: { ar: 'الدرجة', en: 'Score' } },
        {
          key: 'createdAt',
          label: { ar: 'بدأت', en: 'Started' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'force-stop',
          label: { ar: 'إنهاء إجبارياً', en: 'Force-stop' },
          onRun: async (row) => {
            if (!confirm('Force-stop this interview?')) return;
            const res = await fetch('/api/admin/sessions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ interviewId: row.id, action: 'force_stop' }),
            });
            if (!res.ok) {
              alert((await res.json()).error || 'Failed');
              return;
            }
            window.location.reload();
          },
        },
        {
          id: 'reopen',
          label: { ar: 'إعادة فتح', en: 'Reopen' },
          onRun: async (row) => {
            const res = await fetch('/api/admin/sessions', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ interviewId: row.id, action: 'reopen' }),
            });
            if (!res.ok) {
              alert((await res.json()).error || 'Failed');
              return;
            }
            window.location.reload();
          },
        },
      ]}
    />
  );
}
