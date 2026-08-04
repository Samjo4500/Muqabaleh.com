'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "قوالب البريد", en: "Email Templates" }}
      resource="email_templates"
      creatable={true}
      columns={[
    { key: 'key', label: { ar: 'المفتاح', en: 'Key' } },
    { key: 'subjectAr', label: { ar: 'الموضوع', en: 'Subject AR' } },
    { key: 'subjectEn', label: { ar: 'Subject', en: 'Subject EN' } },
    { key: 'isActive', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
