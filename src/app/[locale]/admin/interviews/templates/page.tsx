'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "قوالب المقابلات", en: "Interview Templates" }}
      resource="templates"
      creatable={true}
      columns={[
    { key: 'titleAr', label: { ar: 'العنوان', en: 'Title AR' } },
    { key: 'titleEn', label: { ar: 'Title', en: 'Title EN' } },
    { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
    { key: 'level', label: { ar: 'المستوى', en: 'Level' } },
    { key: 'isActive', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
