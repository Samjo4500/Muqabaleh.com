'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "جلسات المقابلات", en: "Interview Sessions" }}
      resource="sessions"
      creatable={false}
      columns={[
    { key: 'type', label: { ar: 'النوع', en: 'Type' } },
    { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
    { key: 'overallScore', label: { ar: 'الدرجة', en: 'Score' } }
      ]}
    />
  );
}
