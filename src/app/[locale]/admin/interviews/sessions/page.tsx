'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'الجلسات الحية', en: 'Live Sessions' }}
      description={{
        ar: 'عرض فوري للمقابلات الجارية، مراقبة للقراءة فقط، إيقاف قسري، وسجلات الجلسة.',
        en: 'Real-time ongoing interviews, read-only monitor, force-stop, session logs.',
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
        { key: 'industry', label: { ar: 'المجال', en: 'Industry' } },
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
          id: 'monitor',
          label: { ar: 'مراقبة', en: 'Monitor' },
          onRun: async (row) => alert(`Monitor (read-only): ${row.id}`),
        },
        {
          id: 'force-stop',
          label: { ar: 'إيقاف قسري', en: 'Force-stop' },
          onRun: async (row) => alert(`Force-stop queued: ${row.id}`),
        },
      ]}
    />
  );
}
