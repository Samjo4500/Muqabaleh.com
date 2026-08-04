'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "المرشحون", en: "Candidates" }}
      resource="candidates"
      creatable={false}
      columns={[
    { key: 'email', label: { ar: 'البريد', en: 'Email' } },
    { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
    { key: 'tier', label: { ar: 'الباقة', en: 'Tier' } },
    { key: 'sessionsLeft', label: { ar: 'الجلسات', en: 'Sessions' } }
      ]}
    />
  );
}
