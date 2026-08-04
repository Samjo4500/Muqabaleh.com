'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';

export default function Page() {
  return (
    <AdminConfigPanel
      title={{ ar: 'شركاء العلامة البيضاء', en: 'Whitelabel Partners' }}
      description={{
        ar: 'نموذج الانضمام، النطاق المخصص، الشعار والألوان، ومفتاح API لكل شريك.',
        en: 'Onboarding form, custom domain, logo & branding, color scheme, API key per partner.',
      }}
      sections={[
        {
          title: { ar: 'إعداد الشريك', en: 'Partner setup' },
          fields: [
            { key: 'companyName', label: { ar: 'اسم الشركة', en: 'Company name' }, type: 'text' },
            { key: 'contactEmail', label: { ar: 'بريد التواصل', en: 'Contact email' }, type: 'text' },
            { key: 'customDomain', label: { ar: 'النطاق المخصص', en: 'Custom domain' }, type: 'text', value: 'interviews.partner.com' },
            { key: 'logoUrl', label: { ar: 'رابط الشعار', en: 'Logo URL' }, type: 'text' },
            { key: 'primaryColor', label: { ar: 'اللون الأساسي', en: 'Primary color' }, type: 'text', value: '#0ea5e9' },
            { key: 'secondaryColor', label: { ar: 'اللون الثانوي', en: 'Secondary color' }, type: 'text', value: '#0f172a' },
            { key: 'apiKey', label: { ar: 'مفتاح API للشريك', en: 'Partner API key' }, type: 'password', value: '' },
            { key: 'active', label: { ar: 'تفعيل الشريك', en: 'Partner active' }, type: 'toggle', value: true },
          ],
        },
      ]}
    />
  );
}
