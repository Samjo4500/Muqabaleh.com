'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "كل المستخدمين", en: "All Users" }}
      resource="users"
      creatable={false}
      columns={[
    { key: 'email', label: { ar: 'البريد', en: 'Email' } },
    { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
    { key: 'role', label: { ar: 'الدور', en: 'Role' } },
    { key: 'tier', label: { ar: 'الباقة', en: 'Tier' } },
    { key: 'isActive', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
