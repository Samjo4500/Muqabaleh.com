'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "النسخ الاحتياطي", en: "Backups" }}
      resource="backup_logs"
      creatable={true}
      columns={[
    { key: 'type', label: { ar: 'النوع', en: 'Type' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
    { key: 'location', label: { ar: 'الموقع', en: 'Location' } },
    { key: 'createdAt', label: { ar: 'التاريخ', en: 'Created' } }
      ]}
    />
  );
}
