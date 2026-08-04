'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "الشركات", en: "Companies" }}
      resource="companies"
      creatable={false}
      columns={[
    { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
    { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
    { key: 'plan', label: { ar: 'الخطة', en: 'Plan' } },
    { key: 'credits', label: { ar: 'الرصيد', en: 'Credits' } }
      ]}
    />
  );
}
