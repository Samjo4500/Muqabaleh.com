'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminConfigPanel
        settingKey="notification_center"
        title={{ ar: 'مركز التنبيهات', en: 'Notification Center' }}
        description={{
          ar: 'بث عام أو لشريحة أو لمستخدم محدد، جدولة، وسجل التنبيهات، واختبار الدفع.',
          en: 'Broadcast to all/segment/user, scheduled notifications, history, push test sender.',
        }}
        footerNote={{
          ar: 'يُحفظ نموذج البث في AdminSetting. سجل التنبيهات أدناه يعرض السجلات الحقيقية إن وُجدت.',
          en: 'Broadcast draft persists to AdminSetting. History below shows real logs when present.',
        }}
        sections={[
          {
            title: { ar: 'بث جديد', en: 'New broadcast' },
            note: { ar: 'مسودة محلية', en: 'Local draft' },
            fields: [
              {
                key: 'audience',
                label: { ar: 'الفئة المستهدفة', en: 'Audience' },
                type: 'select',
                value: 'ALL',
                options: [
                  { value: 'ALL', label: 'All users' },
                  { value: 'B2C', label: 'B2C segment' },
                  { value: 'B2B', label: 'B2B segment' },
                  { value: 'USER', label: 'Specific user' },
                ],
              },
              { key: 'userId', label: { ar: 'معرف المستخدم (إن وجد)', en: 'Specific user id' }, type: 'text' },
              { key: 'titleAr', label: { ar: 'العنوان (عربي)', en: 'Title AR' }, type: 'text' },
              { key: 'titleEn', label: { ar: 'العنوان (إنجليزي)', en: 'Title EN' }, type: 'text' },
              { key: 'bodyAr', label: { ar: 'النص (عربي)', en: 'Body AR' }, type: 'textarea' },
              { key: 'bodyEn', label: { ar: 'النص (إنجليزي)', en: 'Body EN' }, type: 'textarea' },
              { key: 'scheduleAt', label: { ar: 'جدولة التنبيه', en: 'Schedule at (ISO)' }, type: 'text' },
              { key: 'pushTest', label: { ar: 'اختبار التنبيهات الفورية', en: 'Push notification test' }, type: 'toggle', value: false },
            ],
          },
        ]}
      />
      <AdminDataTable
        title={{ ar: 'سجل التنبيهات', en: 'Notification history' }}
        resource="notification_logs"
        creatable={false}
        columns={[
          { key: 'channel', label: { ar: 'القناة', en: 'Channel' } },
          { key: 'recipient', label: { ar: 'المستلم', en: 'Recipient' } },
          { key: 'subject', label: { ar: 'الموضوع', en: 'Subject' } },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          {
            key: 'createdAt',
            label: { ar: 'التاريخ', en: 'Date' },
            render: (row) =>
              row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
          },
        ]}
      />
    </div>
  );
}
