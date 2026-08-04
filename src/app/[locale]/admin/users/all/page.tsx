'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';
import { L } from '@/lib/admin/labels';

async function patchUser(id: string, body: Record<string, unknown>) {
  await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...body }),
  });
}

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'جميع المستخدمين', en: 'All Users' }}
      description={{
        ar: 'بحث، تصفية، فرز، إجراءات جماعية وتصدير CSV/Excel.',
        en: 'Search, filter, sort, bulk actions, and CSV/Excel export.',
      }}
      resource="users"
      creatable={false}
      selectable
      columns={[
        { key: 'id', label: { ar: 'المعرّف', en: 'ID' } },
        { key: 'name', label: { ar: 'الاسم', en: 'Name' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'role', label: { ar: 'الدور', en: 'Role' } },
        {
          key: 'accountType',
          label: { ar: 'النوع', en: 'Type (B2C/B2B)' },
          render: (row) => {
            const t = String(row.accountType ?? 'INDIVIDUAL');
            const isB2B = t === 'COMPANY' || t === 'B2B' || Boolean(row.companyId);
            return <Badge variant="outline">{isB2B ? 'B2B' : 'B2C'}</Badge>;
          },
        },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{row.isActive ? 'Active' : 'Inactive'}</Badge>
          ),
        },
        {
          key: 'createdAt',
          label: { ar: 'تاريخ الإنشاء', en: 'Created At' },
          render: (row) => (row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—'),
        },
      ]}
      bulkActions={[
        {
          id: 'activate',
          label: L.activate,
          onRun: async (ids) => {
            await Promise.all(ids.map((id) => patchUser(id, { isActive: true })));
          },
        },
        {
          id: 'deactivate',
          label: L.deactivate,
          onRun: async (ids) => {
            await Promise.all(ids.map((id) => patchUser(id, { isActive: false })));
          },
        },
        {
          id: 'email',
          label: L.emailAction,
          onRun: async (ids) => {
            alert(`${L.emailAction.ar} / ${L.emailAction.en}: ${ids.length}`);
          },
        },
      ]}
      rowActions={[
        {
          id: 'activate',
          label: L.activate,
          onRun: async (row) => patchUser(String(row.id), { isActive: true }),
        },
        {
          id: 'deactivate',
          label: L.deactivate,
          onRun: async (row) => patchUser(String(row.id), { isActive: false }),
        },
      ]}
    />
  );
}
