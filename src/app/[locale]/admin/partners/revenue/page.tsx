'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'مشاركة الأرباح', en: 'Partner Revenue Share' }}
      description={{
        ar: 'نسبة العمولة، تقرير الأرباح الشهري، حالة التحويل، وتكامل PayPal.',
        en: 'Commission %, monthly earnings, payout status, PayPal payout integration.',
      }}
      resource="partner_applications"
      creatable={false}
      columns={[
        { key: 'companyName', label: { ar: 'الشريك', en: 'Partner' } },
        {
          key: 'commission',
          label: { ar: 'نسبة العمولة', en: 'Commission %' },
          render: (row) => String(row.commission ?? '15%'),
        },
        {
          key: 'monthlyEarnings',
          label: { ar: 'أرباح الشهر', en: 'Monthly earnings' },
          render: (row) => String(row.monthlyEarnings ?? '$0.00'),
        },
        {
          key: 'payoutStatus',
          label: { ar: 'حالة التحويل', en: 'Payout status' },
          render: (row) => (
            <Badge variant="outline">{String(row.payoutStatus ?? 'Pending')}</Badge>
          ),
        },
      ]}
      demoRows={[
        {
          id: 'rev-1',
          companyName: 'Gulf Hire',
          commission: '18%',
          monthlyEarnings: '$1,240.00',
          payoutStatus: 'Paid',
        },
        {
          id: 'rev-2',
          companyName: 'Cairo Talent',
          commission: '12%',
          monthlyEarnings: '$420.00',
          payoutStatus: 'Pending',
        },
      ]}
    />
  );
}
