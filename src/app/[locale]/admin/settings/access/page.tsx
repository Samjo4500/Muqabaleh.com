'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "صلاحيات الوصول", en: "Access Control" }}
      resource="admin_roles"
      creatable={true}
      columns={[
    { key: 'key', label: { ar: 'المفتاح', en: 'Key' } },
    { key: 'nameAr', label: { ar: 'الاسم', en: 'Name AR' } },
    { key: 'nameEn', label: { ar: 'Name', en: 'Name EN' } }
      ]}
    />
  );
}
