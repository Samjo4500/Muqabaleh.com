'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';

export default function SettingsGeneralPage() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.general.ar, en: L.general.en }}
        description={{
          ar: 'الإعدادات العامة لمنصة مقابلة.',
          en: 'General settings for the Muqabaleh platform.',
        }}
      />
      <div className="space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6 text-sm">
        <div>
          <BiLabel ar="اسم المنصة" en="Platform Name" />
          <p className="mt-1 text-[var(--text-secondary)]">Muqabaleh / مقابلة</p>
        </div>
        <div>
          <BiLabel ar="اللغة الافتراضية" en="Default Locale" />
          <p className="mt-1 text-[var(--text-secondary)]">ar</p>
        </div>
        <div>
          <BiLabel ar="نطاق المنتج" en="Product Scope" />
          <p className="mt-1 text-[var(--text-secondary)]">
            <BiInline
              ar="مقابلات وظيفية بالذكاء الاصطناعي فقط — بدون اختبارات لغة."
              en="AI job-interview practice only — no language proficiency exams."
            />
          </p>
        </div>
      </div>
    </div>
  );
}
