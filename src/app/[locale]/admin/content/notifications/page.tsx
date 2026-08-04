'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "سجلات الإشعارات", en: "Notification Logs" }}
      resource="notification_logs"
      creatable={true}
      columns={[
    { key: 'channel', label: { ar: 'القناة', en: 'Channel' } },
    { key: 'recipient', label: { ar: 'المستلم', en: 'Recipient' } },
    { key: 'subject', label: { ar: 'الموضوع', en: 'Subject' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
