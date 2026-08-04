'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'الإعدادات العامة', en: 'General Settings' }}
      description={{
        ar: 'اسم الموقع، الشعار، اللغة الافتراضية، المنطقة الزمنية، العملة، ووضع الصيانة.',
        en: 'Site name, logo & favicon, default language, timezone, currency, maintenance mode.',
      }}
      sections={[
        {
          title: { ar: 'هوية الموقع', en: 'Site identity' },
          fields: [
            { key: 'siteNameAr', label: { ar: 'اسم الموقع (عربي)', en: 'Site name AR' }, type: 'text', value: 'مقابلة' },
            { key: 'siteNameEn', label: { ar: 'اسم الموقع (إنجليزي)', en: 'Site name EN' }, type: 'text', value: 'Muqabaleh' },
            { key: 'logoUrl', label: { ar: 'الشعار', en: 'Site logo URL' }, type: 'text' },
            { key: 'faviconUrl', label: { ar: 'أيقونة الموقع', en: 'Favicon URL' }, type: 'text' },
            {
              key: 'defaultLang',
              label: { ar: 'اللغة الافتراضية', en: 'Default language' },
              type: 'select',
              value: 'ar',
              options: [
                { value: 'ar', label: 'Arabic' },
                { value: 'en', label: 'English' },
              ],
            },
            {
              key: 'timezone',
              label: { ar: 'المنطقة الزمنية', en: 'Timezone' },
              type: 'select',
              value: 'Asia/Riyadh',
              options: [
                { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
                { value: 'Asia/Dubai', label: 'Asia/Dubai' },
                { value: 'Africa/Cairo', label: 'Africa/Cairo' },
                { value: 'UTC', label: 'UTC' },
              ],
            },
            {
              key: 'currency',
              label: { ar: 'العملة الافتراضية', en: 'Default currency' },
              type: 'select',
              value: 'USD',
              options: [
                { value: 'USD', label: 'USD' },
                { value: 'SAR', label: 'SAR' },
                { value: 'AED', label: 'AED' },
              ],
            },
            { key: 'maintenance', label: { ar: 'وضع الصيانة', en: 'Maintenance mode' }, type: 'toggle', value: false },
            { key: 'maintenanceMsg', label: { ar: 'رسالة الصيانة', en: 'Maintenance message' }, type: 'textarea', value: 'We will be back shortly. / سنعود قريباً.' },
          ],
        },
      ]}
    />
  );
}
