'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { localePath } from '@/i18n/navigation';
import { Badge } from '@/components/ui/badge';
import { BiInline } from '@/components/admin/BiLabel';

export default function Page() {
  const locale = useLocale();
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          href={localePath('/admin/payouts', locale)}
          className="inline-flex h-9 items-center rounded-md border border-white/10 px-3 text-sm hover:bg-white/5"
        >
          <BiInline ar="فتح لوحة المدفوعات الكاملة" en="Open full payouts console" />
        </Link>
      </div>
      <AdminDataTable
        title={{ ar: 'المبالغ المدفوعة', en: 'Payouts' }}
        description={{
          ar: 'مدفوعات الشركاء والشركاء بالعمولة، والتحقق من طريقة الدفع.',
          en: 'Partner payouts, affiliate payouts, payout method verification.',
        }}
        resource="partner_applications"
        creatable={false}
        columns={[
          { key: 'companyName', label: { ar: 'المستفيد', en: 'Payee' } },
          {
            key: 'type',
            label: { ar: 'النوع', en: 'Type' },
            render: () => 'Partner',
          },
          {
            key: 'amount',
            label: { ar: 'المبلغ', en: 'Amount' },
            render: (row) => String(row.amount ?? '$0.00'),
          },
          {
            key: 'method',
            label: { ar: 'طريقة الدفع', en: 'Method' },
            render: () => 'PayPal',
          },
          {
            key: 'verified',
            label: { ar: 'التحقق', en: 'Verified' },
            render: () => <Badge variant="outline">Verified</Badge>,
          },
          {
            key: 'status',
            label: { ar: 'الحالة', en: 'Status' },
            render: (row) => <Badge variant="outline">{String(row.status ?? 'PENDING')}</Badge>,
          },
        ]}
        demoRows={[
          {
            id: 'po-1',
            companyName: 'Gulf Hire',
            amount: '$1,240.00',
            status: 'PAID',
          },
          {
            id: 'po-2',
            companyName: 'Cairo Talent',
            amount: '$420.00',
            status: 'PENDING',
          },
        ]}
      />
    </div>
  );
}
