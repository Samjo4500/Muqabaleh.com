'use client';

import { AdminResourceClient } from '@/components/admin/AdminResourceClient';

export default function Page() {
  return (
    <AdminResourceClient
      title={{ ar: "الاشتراكات", en: "Subscriptions" }}
      resource="subscriptions"
      creatable={false}
      columns={[
    { key: 'paypalSubscriptionId', label: { ar: 'معرّف PayPal', en: 'PayPal ID' } },
    { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
    { key: 'paypalPlanId', label: { ar: 'الخطة', en: 'Plan' } }
      ]}
    />
  );
}
