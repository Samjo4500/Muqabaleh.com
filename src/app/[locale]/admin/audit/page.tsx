'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'سجلات التدقيق', en: 'Audit Logs' }}
      description={{
        ar: 'سجل غير قابل للحذف لكل إجراء مشرف. تصفية حسب المشرف، نوع الإجراء، التاريخ، والكيان. التصدير فقط — لا حذف.',
        en: 'Immutable log of every admin action. Filter by admin, action, date, entity. Export only — cannot be deleted.',
      }}
      resource="audit_logs"
      creatable={false}
      columns={[
        {
          key: 'admin',
          label: { ar: 'المشرف', en: 'Admin' },
          render: (row) => {
            const a = row.admin as { email?: string; name?: string } | undefined;
            return a?.email ?? a?.name ?? String(row.adminId ?? '—');
          },
        },
        { key: 'action', label: { ar: 'نوع الإجراء', en: 'Action type' } },
        { key: 'entity', label: { ar: 'الكيان', en: 'Entity affected' } },
        { key: 'entityId', label: { ar: 'معرف الكيان', en: 'Entity ID' } },
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
