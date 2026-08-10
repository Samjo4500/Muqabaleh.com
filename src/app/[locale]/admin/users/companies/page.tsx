'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'حسابات الشركات', en: 'Company Accounts' }}
      description={{
        ar: 'حقول Company الحقيقية: الباقة، الرصيد، الحالة، الشريك المرتبط، وعدد المستخدمين.',
        en: 'Real Company fields: plan, credits, status, linked partner, user count.',
      }}
      resource="companies"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'اسم الشركة', en: 'Company name' } },
        { key: 'industry', label: { ar: 'القطاع', en: 'Industry' } },
        { key: 'country', label: { ar: 'الدولة', en: 'Country' } },
        { key: 'size', label: { ar: 'الحجم', en: 'Size' } },
        { key: 'plan', label: { ar: 'الباقة', en: 'Plan' } },
        {
          key: 'credits',
          label: { ar: 'الرصيد', en: 'Credits' },
          render: (row) => String(row.credits ?? 0),
        },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status ?? 'ACTIVE')}</Badge>,
        },
        {
          key: 'partnerId',
          label: { ar: 'الشريك', en: 'Partner' },
          render: (row) => String(row.partnerId ?? '—'),
        },
        {
          key: 'users',
          label: { ar: 'المستخدمون', en: 'Users' },
          render: (row) => {
            const c = row._count as { users?: number } | undefined;
            return String(c?.users ?? '—');
          },
        },
      ]}
    />
  );
}
