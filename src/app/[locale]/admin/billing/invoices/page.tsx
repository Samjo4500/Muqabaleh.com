'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline } from '@/components/admin/BiLabel';

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: "الفواتير", en: "Invoices" }}
        description={{ ar: "عرض فواتير المدفوعات المكتملة.", en: "View invoices generated from completed payments." }}
      />
      <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6 text-sm text-[var(--text-secondary)]">
        <BiInline ar="هذه الصفحة جاهزة للإعدادات التشغيلية في مقابلة." en="This page is ready for Muqabaleh operational configuration." />
      </div>
    </div>
  );
}
