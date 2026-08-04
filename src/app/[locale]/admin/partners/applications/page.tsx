'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'طلبات الشراكة', en: 'Partner Applications' }}
      description={{
        ar: 'مراجعة الطلبات، موافقة/رفض مع سبب، تواصل بالبريد، وتتبع الحالة.',
        en: 'Review requests, approve/reject with reason, email applicant, status tracker.',
      }}
      resource="partner_applications"
      columns={[
        { key: 'companyName', label: { ar: 'الشركة', en: 'Company' } },
        { key: 'contactName', label: { ar: 'جهة الاتصال', en: 'Contact' } },
        { key: 'email', label: { ar: 'البريد', en: 'Email' } },
        { key: 'country', label: { ar: 'الدولة', en: 'Country' } },
        {
          key: 'status',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{String(row.status ?? 'PENDING')}</Badge>
          ),
        },
        {
          key: 'createdAt',
          label: { ar: 'تاريخ الطلب', en: 'Submitted' },
          render: (row) =>
            row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'approve',
          label: { ar: 'موافقة', en: 'Approve' },
          onRun: async (row) => alert(`Approved: ${row.companyName}`),
        },
        {
          id: 'reject',
          label: { ar: 'رفض', en: 'Reject' },
          onRun: async (row) => alert(`Rejected: ${row.companyName}`),
        },
        {
          id: 'email',
          label: { ar: 'مراسلة', en: 'Email' },
          onRun: async (row) => alert(`Email: ${row.email}`),
        },
      ]}
    />
  );
}
