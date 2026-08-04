'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "مفاتيح واجهات البرمجة", en: "API Keys" }}
      resource="api_keys"
      creatable={true}
      columns={[
    { key: 'provider', label: { ar: 'المزوّد', en: 'Provider' } },
    { key: 'label', label: { ar: 'التسمية', en: 'Label' } },
    { key: 'keyHint', label: { ar: 'المفتاح', en: 'Key' } },
    { key: 'isActive', label: { ar: 'الحالة', en: 'Status' } }
      ]}
    />
  );
}
