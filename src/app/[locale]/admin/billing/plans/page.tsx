'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminDataTable
        title={{ ar: 'باقات الاشتراك', en: 'Subscription Plans' }}
        description={{
          ar: 'الاسم عربي/إنجليزي، السعر، العملة، الفترة، الميزات، رصيد المقابلات، ظهور الباقة الخطة، والتجربة المجانية.',
          en: 'Name EN/AR, price, currency, interval, features, interview credits, visibility, trial.',
        }}
        resource="subscriptions"
        creatable={false}
        columns={[
          { key: 'plan', label: { ar: 'الخطة', en: 'Plan' }, render: (row) => String(row.plan ?? row.planId ?? '—') },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          {
            key: 'user',
            label: { ar: 'مستخدم نموذجي', en: 'Sample user' },
            render: (row) => {
              const u = row.user as { email?: string } | undefined;
              return u?.email ?? '—';
            },
          },
        ]}
        demoRows={[
          { id: 'plan-free', plan: 'Free / مجاني', status: 'Public', user: { email: '—' } },
          { id: 'plan-pro', plan: 'Pro / احترافي — $9.99/mo', status: 'Public', user: { email: '—' } },
          { id: 'plan-unl', plan: 'Unlimited / بلا حدود — $29.99/mo', status: 'Public', user: { email: '—' } },
          { id: 'plan-partner', plan: 'Partner-only / للشركاء فقط', status: 'Partner-only', user: { email: '—' } },
        ]}
      />
      <AdminConfigPanel
        title={{ ar: 'محرر الباقة', en: 'Plan editor' }}
        sections={[
          {
            title: { ar: 'تفاصيل الباقة', en: 'Plan details' },
            fields: [
              { key: 'nameAr', label: { ar: 'الاسم (عربي)', en: 'Name AR' }, type: 'text', value: 'احترافي' },
              { key: 'nameEn', label: { ar: 'الاسم (إنجليزي)', en: 'Name EN' }, type: 'text', value: 'Pro' },
              { key: 'price', label: { ar: 'السعر', en: 'Price' }, type: 'number', value: '9.99' },
              {
                key: 'currency',
                label: { ar: 'العملة', en: 'Currency' },
                type: 'select',
                value: 'USD',
                options: [
                  { value: 'USD', label: 'USD' },
                  { value: 'SAR', label: 'SAR' },
                  { value: 'AED', label: 'AED' },
                ],
              },
              {
                key: 'interval',
                label: { ar: 'الفترة', en: 'Interval' },
                type: 'select',
                value: 'MONTHLY',
                options: [
                  { value: 'MONTHLY', label: 'Monthly' },
                  { value: 'YEARLY', label: 'Yearly' },
                ],
              },
              { key: 'credits', label: { ar: 'رصيد المقابلات', en: 'Interview credits' }, type: 'number', value: '10' },
              { key: 'features', label: { ar: 'قائمة الميزات', en: 'Features list' }, type: 'textarea', value: 'AI interviews\nDetailed scoring\nPDF report' },
              {
                key: 'visibility',
                label: { ar: 'الظهور الباقة', en: 'Visibility' },
                type: 'select',
                value: 'PUBLIC',
                options: [
                  { value: 'PUBLIC', label: 'Public' },
                  { value: 'HIDDEN', label: 'Hidden' },
                  { value: 'PARTNER', label: 'Partner-only' },
                ],
              },
              { key: 'trialDays', label: { ar: 'أيام التجربة المجانية', en: 'Trial days' }, type: 'number', value: '7' },
              { key: 'aiAvatar', label: { ar: 'وصول الأفاتار الذكي', en: 'AI avatar access' }, type: 'toggle', value: true },
            ],
          },
        ]}
      />
    </div>
  );
}
