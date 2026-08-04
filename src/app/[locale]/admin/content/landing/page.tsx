'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: "محتوى الصفحة الرئيسية", en: "Landing Content" }}
        description={{ ar: "إدارة نصوص صفحة مقابلة الرئيسية (بدون محتوى اختبارات لغة).", en: "Manage Muqabaleh landing copy (interview platform only — no language-exam content)." }}
      />
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6 text-sm text-[var(--text-secondary)]">
        <BiInline ar="هذه الصفحة جاهزة للإعدادات التشغيلية في مقابلة." en="This page is ready for Muqabaleh operational configuration." />
      </div>
    </div>
  );
}
