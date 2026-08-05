'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'طلبات الانضمام للشراكة', en: 'Partner Applications' }}
      description={{
        ar: 'مراجعة الطلبات، موافقة مع تهيئة حساب الشريك، رفض، وتتبع الحالة.',
        en: 'Review requests, approve with partner provisioning, reject, and track status.',
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
          label: { ar: 'موافقة وتهيئة', en: 'Approve & provision' },
          onRun: async (row) => {
            const res = await fetch('/api/admin/partners/provision', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ applicationId: row.id }),
            });
            const data = await res.json();
            if (!res.ok) {
              alert(data.error || 'Provision failed');
              return;
            }
            alert(
              data.already
                ? `Already provisioned: ${data.partnerId}`
                : `Provisioned ${data.slug}\nLogin: ${data.email}\nTemp password: ${data.tempPassword}`,
            );
            window.location.reload();
          },
        },
        {
          id: 'reject',
          label: { ar: 'رفض', en: 'Reject' },
          onRun: async (row) => {
            alert(`Marked for rejection: ${row.companyName}. Update status in DB / support workflow.`);
          },
        },
        {
          id: 'email',
          label: { ar: 'مراسلة', en: 'Email' },
          onRun: async (row) => {
            window.location.href = `mailto:${row.email}?subject=Muqabaleh%20Partnership`;
          },
        },
      ]}
    />
  );
}
