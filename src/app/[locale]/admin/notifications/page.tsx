'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "مركز الإشعارات", en: "Notification Center" }}
      resource="notification_logs"
      creatable={true}
      columns={[
    { key: 'channel', label: { ar: 'القناة', en: 'Channel' } },
    { key: 'recipient', label: { ar: 'المستلم', en: 'Recipient' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
    { key: 'createdAt', label: { ar: 'التاريخ', en: 'Created' } }
      ]}
    />
  );
}
