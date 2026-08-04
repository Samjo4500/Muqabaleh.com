'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "تذاكر الدعم", en: "Support Tickets" }}
      resource="support_tickets"
      creatable={true}
      columns={[
    { key: 'subject', label: { ar: 'الموضوع', en: 'Subject' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
    { key: 'priority', label: { ar: 'الأولوية', en: 'Priority' } },
    { key: 'createdAt', label: { ar: 'التاريخ', en: 'Created' } }
      ]}
    />
  );
}
