'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "طلبات الشركاء", en: "Partner Applications" }}
      resource="partner_applications"
      creatable={true}
      columns={[
    { key: 'companyName', label: { ar: 'الشركة', en: 'Company' } },
    { key: 'contactName', label: { ar: 'التواصل', en: 'Contact' } },
    { key: 'email', label: { ar: 'البريد', en: 'Email' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
