'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'سجلات النشاط', en: 'Audit Logs' }}
      description={{
        ar: 'سجل محمي من التعديل لكل إجراء مسؤول. تصفية حسب المسؤول، نوع الإجراء، التاريخ، والعنصر. التصدير فقط — محمي من الحذف.',
        en: 'Activity log protected from editing for every admin action. Filter by admin, action, date, entity. Export only — protected from deletion.',
      }}
      resource="audit_logs"
      creatable={false}
      columns={[
        {
          key: 'admin',
          label: { ar: 'المسؤول', en: 'Admin' },
          render: (row) => {
            const a = row.admin as { email?: string; name?: string } | undefined;
            return a?.email ?? a?.name ?? String(row.adminId ?? '—');
          },
        },
        { key: 'action', label: { ar: 'نوع الإجراء', en: 'Action type' } },
        { key: 'entity', label: { ar: 'العنصر', en: 'Entity affected' } },
        { key: 'entityId', label: { ar: 'معرف العنصر', en: 'Entity ID' } },
        {
          key: 'createdAt',
          label: { ar: 'التاريخ', en: 'Date' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
        },
      ]}
    />
  );
}
