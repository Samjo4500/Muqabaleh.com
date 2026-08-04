'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'الاشتراكات النشطة', en: 'Active Subscriptions' }}
      description={{
        ar: 'المستخدم/الشركة، الخطة، تاريخ البدء، الفوترة التالية، الحالة، وطريقة الدفع.',
        en: 'User/Company, plan, start date, next billing, status, payment method.',
      }}
      resource="subscriptions"
      creatable={false}
      columns={[
        {
          key: 'user',
          label: { ar: 'المستخدم/الشركة', en: 'User/Company' },
          render: (row) => {
            const u = row.user as { email?: string } | undefined;
            return u?.email ?? String(row.email ?? '—');
          },
        },
        { key: 'planId', label: { ar: 'الخطة', en: 'Plan' }, render: (row) => String(row.planId ?? row.plan ?? '—') },
        {
          key: 'startDate',
          label: { ar: 'تاريخ البدء', en: 'Start date' },
          render: (row) =>
            row.startTime || row.createdAt
              ? new Date(String(row.startTime ?? row.createdAt)).toLocaleDateString()
              : '—',
        },
        {
          key: 'nextBilling',
          label: { ar: 'الفوترة التالية', en: 'Next billing' },
          render: (row) =>
            row.nextBillingTime
              ? new Date(String(row.nextBillingTime)).toLocaleDateString()
              : '—',
        },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => <Badge variant="outline">{String(row.status ?? '—')}</Badge>,
        },
        {
          key: 'paymentMethod',
          label: { ar: 'طريقة الدفع', en: 'Payment method' },
          render: () => 'PayPal',
        },
      ]}
      rowActions={[
        {
          id: 'cancel',
          label: { ar: 'إلغاء الاشتراك', en: 'Cancel' },
          onRun: async (row) => alert(`Cancel subscription ${row.id}`),
        },
        {
          id: 'extend',
          label: { ar: 'تمديد / ترقية مجانية', en: 'Extend / complimentary' },
          onRun: async (row) => alert(`Extend ${row.id}`),
        },
      ]}
    />
  );
}
