'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { SystemHealthPanel } from '@/components/admin/SystemHealthPanel';
import { L } from '@/lib/admin/labels';

export default function SystemHealthPage() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.systemHealth.ar, en: L.systemHealth.en }}
        description={{
          ar: 'تشخيص حي للمنصة — قاعدة البيانات، جيني، الصوت، البريد، الدفع، والمصادقة.',
          en: 'Live platform diagnostics — database, Jeannie, speech, email, payments, and auth.',
        }}
        backHref="/admin/dashboard"
      />
      <SystemHealthPanel />
    </div>
  );
}
