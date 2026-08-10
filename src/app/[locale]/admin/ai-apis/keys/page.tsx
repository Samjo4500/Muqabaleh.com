'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'مفاتيح API', en: 'API Keys' }}
      description={{
        ar: 'سجلات المفاتيح (تلميح فقط) — تفعيل أو إلغاء دون كشف الأسرار.',
        en: 'API key records (hints only) — activate or revoke without exposing secrets.',
      }}
      resource="api_keys"
      columns={[
        { key: 'label', label: { ar: 'التسمية', en: 'Label' } },
        { key: 'provider', label: { ar: 'الخدمة', en: 'Provider' } },
        { key: 'keyHint', label: { ar: 'المفتاح', en: 'Key hint' } },
        {
          key: 'isActive',
          label: { ar: 'الحالة', en: 'Status' },
          render: (row) => (
            <Badge variant="outline">{row.isActive ? 'Active' : 'Revoked'}</Badge>
          ),
        },
        {
          key: 'lastUsedAt',
          label: { ar: 'آخر استخدام', en: 'Last used' },
          render: (row) =>
            row.lastUsedAt ? new Date(String(row.lastUsedAt)).toLocaleString() : '—',
        },
      ]}
      rowActions={[
        {
          id: 'revoke',
          label: { ar: 'إلغاء', en: 'Revoke' },
          onRun: async (row) => {
            const res = await fetch('/api/admin/keys', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keyId: row.id, isActive: false }),
            });
            if (!res.ok) {
              alert((await res.json()).error || 'Failed');
              return;
            }
            window.location.reload();
          },
        },
        {
          id: 'activate',
          label: { ar: 'تفعيل', en: 'Activate' },
          onRun: async (row) => {
            const res = await fetch('/api/admin/keys', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ keyId: row.id, isActive: true }),
            });
            if (!res.ok) {
              alert((await res.json()).error || 'Failed');
              return;
            }
            window.location.reload();
          },
        },
      ]}
    />
  );
}
