'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'جميع التذاكر', en: 'All Tickets' }}
      description={{
        ar: 'المعرّف، المستخدم، الموضوع، الأولوية، الحالة، آخر تحديث، والمُعيَّن — مع ملاحظات داخلية ورد بالبريد.',
        en: 'Ticket ID, user, subject, priority, status, last update, assigned to — internal notes & email reply.',
      }}
      resource="support_tickets"
      columns={[
        { key: 'id', label: { ar: 'معرّف التذكرة', en: 'Ticket ID' } },
        {
          key: 'createdBy',
          label: { ar: 'المستخدم', en: 'User' },
          render: (row) => {
            const u = row.createdBy as { email?: string } | undefined;
            return u?.email ?? String(row.createdById ?? '—');
          },
        },
        { key: 'subject', label: { ar: 'الموضوع', en: 'Subject' } },
        {
          key: 'priority',
          label: { ar: 'الأولوية', en: 'Priority' },
          render: (row) => <Badge variant="outline">{String(row.priority ?? 'NORMAL')}</Badge>,
        },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status ?? 'OPEN')}</Badge>,
        },
        {
          key: 'updatedAt',
          label: { ar: 'آخر تحديث', en: 'Last update' },
          render: (row) =>
            row.updatedAt ? new Date(String(row.updatedAt)).toLocaleString() : '—',
        },
        {
          key: 'assigneeId',
          label: { ar: 'مُعيَّن إلى', en: 'Assigned to' },
          render: (row) => String(row.assigneeId ?? 'Unassigned'),
        },
      ]}
      rowActions={[
        {
          id: 'assign',
          label: { ar: 'تعيين', en: 'Assign' },
          onRun: async (row) => alert(`Assign ticket ${row.id}`),
        },
        {
          id: 'reply',
          label: { ar: 'رد بالبريد', en: 'Reply via email' },
          onRun: async (row) => alert(`Email reply for ${row.id}`),
        },
      ]}
      demoRows={[
        {
          id: 'TCK-1001',
          subject: 'Payment failed / فشل الدفع',
          priority: 'HIGH',
          status: 'OPEN',
          updatedAt: new Date().toISOString(),
          assigneeId: null,
          createdById: 'user-1',
        },
      ]}
    />
  );
}
