'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "المشرفون", en: "Admins" }}
      resource="admins"
      creatable={false}
      columns={[
    { key: 'email', label: { ar: 'البريد', en: 'Email' } },
    { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
    { key: 'role', label: { ar: 'الدور', en: 'Role' } },
    { key: 'totpEnabled', label: { ar: 'تحقق ثنائي', en: '2FA' } }
      ]}
    />
  );
}
