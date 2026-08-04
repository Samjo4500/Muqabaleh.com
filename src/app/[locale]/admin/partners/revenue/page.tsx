'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: "إيرادات الشركاء", en: "Partner Revenue" }}
        description={{ ar: "ملخص إيرادات الشركاء وحصة المنصة.", en: "Partner revenue share overview for Muqabaleh." }}
      />
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6 text-sm text-[var(--text-secondary)]">
        <BiInline ar="هذه الصفحة جاهزة للإعدادات التشغيلية في مقابلة." en="This page is ready for Muqabaleh operational configuration." />
      </div>
    </div>
  );
}
