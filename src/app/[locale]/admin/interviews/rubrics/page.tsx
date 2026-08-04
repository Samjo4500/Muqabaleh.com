'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "معايير التقييم", en: "Scoring Rubrics" }}
      resource="rubrics"
      creatable={true}
      columns={[
    { key: 'nameAr', label: { ar: 'الاسم', en: 'Name AR' } },
    { key: 'nameEn', label: { ar: 'Name', en: 'Name EN' } },
    { key: 'maxScore', label: { ar: 'الحد الأقصى', en: 'Max Score' } },
    { key: 'isActive', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
