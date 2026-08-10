'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

async function patchTicket(body: Record<string, unknown>) {
  const res = await fetch('/api/admin/tickets', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed');
  return data;
}

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'طلبات الدعم الفني', en: 'All Tickets' }}
      description={{
        ar: 'تعيين لنفسك، إغلاق، ورد بالبريد على منشئ التذكرة.',
        en: 'Assign to self, close, and email-reply to the ticket creator.',
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
          key: 'assignee',
          label: { ar: 'مسؤول الطلب', en: 'Assigned to' },
          render: (row) => {
            const a = row.assignee as { email?: string } | undefined;
            return a?.email ?? String(row.assigneeId ?? 'Unassigned');
          },
        },
      ]}
      rowActions={[
        {
          id: 'assign',
          label: { ar: 'تعيين لي', en: 'Assign to me' },
          onRun: async (row) => {
            await patchTicket({ ticketId: row.id, assigneeId: undefined, status: 'IN_PROGRESS' });
            window.location.reload();
          },
        },
        {
          id: 'close',
          label: { ar: 'إغلاق', en: 'Close' },
          onRun: async (row) => {
            await patchTicket({ ticketId: row.id, status: 'CLOSED' });
            window.location.reload();
          },
        },
        {
          id: 'reply',
          label: { ar: 'رد بالبريد', en: 'Reply via email' },
          onRun: async (row) => {
            const replyBody = window.prompt('Reply message / نص الرد');
            if (!replyBody) return;
            const data = await patchTicket({
              ticketId: row.id,
              status: 'IN_PROGRESS',
              replyBody,
              replySubject: `Re: ${String(row.subject || 'Support')}`,
            });
            alert(data.emailed ? 'Email sent' : 'Saved — email not sent (no creator email or mail config)');
            window.location.reload();
          },
        },
      ]}
    />
  );
}
