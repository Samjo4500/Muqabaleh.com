'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

async function subAction(subscriptionId: string, action: 'cancel' | 'extend') {
  const body: Record<string, unknown> = { subscriptionId, action };
  if (action === 'extend') {
    const days = Number(window.prompt('Extend days (1–365)', '30') || '30');
    body.days = days;
  } else if (!window.confirm('Cancel this PayPal subscription?')) {
    return;
  }
  const res = await fetch('/api/admin/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    alert(data.error || 'Failed');
    return;
  }
  alert(action === 'cancel' ? 'Cancelled' : `Extended to ${data.expiresAt}`);
  window.location.reload();
}

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'الاشتراكات النشطة', en: 'Active Subscriptions' }}
      description={{
        ar: 'إلغاء عبر PayPal أو تمديد محلي تكريمي لتاريخ انتهاء الصلاحية.',
        en: 'Cancel via PayPal or grant a complimentary local expiry extension.',
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
        {
          key: 'planId',
          label: { ar: 'الخطة', en: 'Plan' },
          render: (row) => String(row.paypalPlanId ?? row.planId ?? '—'),
        },
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
          label: { ar: 'تاريخ التجديد', en: 'Next billing' },
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
          onRun: async (row) => subAction(String(row.id), 'cancel'),
        },
        {
          id: 'extend',
          label: { ar: 'تمديد / ترقية مجانية', en: 'Extend / complimentary' },
          onRun: async (row) => subAction(String(row.id), 'extend'),
        },
      ]}
    />
  );
}
