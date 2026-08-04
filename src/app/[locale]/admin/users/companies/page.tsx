'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'حسابات الشركات', en: 'Company Accounts' }}
      description={{
        ar: 'ملف الشركة، عدد المرشحين، باقة الاشتراك، وحالة العلامة البيضاء.',
        en: 'Company profile, candidates count, subscription tier, whitelabel status.',
      }}
      resource="companies"
      creatable={false}
      columns={[
        { key: 'name', label: { ar: 'اسم الشركة', en: 'Company name' } },
        { key: 'industry', label: { ar: 'المجال', en: 'Industry' } },
        { key: 'country', label: { ar: 'الدولة', en: 'Country' } },
        { key: 'plan', label: { ar: 'الباقة', en: 'Subscription tier' } },
        {
          key: 'employees',
          label: { ar: 'الموظفون/المرشحون', en: 'Employees/Candidates' },
          render: (row) => String(row.credits ?? row.employees ?? '—'),
        },
        {
          key: 'whitelabel',
          label: { ar: 'العلامة البيضاء', en: 'Whitelabel' },
          render: (row) => (
            <Badge variant="outline">{String(row.whitelabelStatus ?? 'Pending')}</Badge>
          ),
        },
        { key: 'domain', label: { ar: 'النطاق', en: 'Domain' }, render: (row) => String(row.domain ?? '—') },
      ]}
      demoRows={[
        {
          id: 'demo-co-1',
          name: 'NEOM Tech',
          industry: 'Technology',
          country: 'SA',
          plan: 'B2B_BUSINESS',
          credits: 42,
          whitelabelStatus: 'Active',
          domain: 'hire.neomtech.sa',
        },
      ]}
    />
  );
}
