'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'رسائل التنبيهات', en: 'Notification Messages' }}
      description={{
        ar: 'قوالب تنبيهات داخل التطبيق، التنبيهات الفورية، والرسائل النصية إن وُجدت.',
        en: 'In-app, push, and SMS notification templates.',
      }}
      sections={[
        {
          title: { ar: 'داخل التطبيق', en: 'In-app templates' },
          fields: [
            { key: 'inAppAr', label: { ar: 'نص عربي', en: 'Arabic text' }, type: 'textarea', value: 'جلستك جاهزة للمراجعة.' },
            { key: 'inAppEn', label: { ar: 'نص إنجليزي', en: 'English text' }, type: 'textarea', value: 'Your session is ready to review.' },
          ],
        },
        {
          title: { ar: 'التنبيهات الفورية', en: 'Push templates' },
          fields: [
            { key: 'pushAr', label: { ar: 'نص عربي', en: 'Arabic text' }, type: 'textarea' },
            { key: 'pushEn', label: { ar: 'نص إنجليزي', en: 'English text' }, type: 'textarea' },
          ],
        },
        {
          title: { ar: 'SMS', en: 'SMS templates' },
          note: { ar: 'اختياري', en: 'If applicable' },
          fields: [
            { key: 'smsEnabled', label: { ar: 'تفعيل SMS', en: 'Enable SMS' }, type: 'toggle', value: false },
            { key: 'smsBody', label: { ar: 'نص الرسالة', en: 'SMS body' }, type: 'textarea' },
          ],
        },
      ]}
    />
  );
}
