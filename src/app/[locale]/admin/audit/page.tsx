'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "سجل التدقيق", en: "Audit Trail" }}
      resource="audit_logs"
      creatable={false}
      columns={[
    { key: 'action', label: { ar: 'الإجراء', en: 'Action' } },
    { key: 'entity', label: { ar: 'الكيان', en: 'Entity' } },
    { key: 'entityId', label: { ar: 'المعرّف', en: 'Entity ID' } },
    { key: 'createdAt', label: { ar: 'الوقت', en: 'Timestamp' } }
      ]}
    />
  );
}
