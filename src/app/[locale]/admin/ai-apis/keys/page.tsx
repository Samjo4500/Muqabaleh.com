'use client';

import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { Badge } from '@/components/ui/badge';

export default function Page() {
  return (
    <AdminDataTable
      title={{ ar: 'مفاتيح API', en: 'API Keys' }}
      description={{
        ar: 'إنشاء/إلغاء مفاتيح داخلية ولشركاء، حد المعدل، وتحليلات الاستخدام لكل مفتاح.',
        en: 'Generate/revoke internal & partner keys, rate limits, per-key usage analytics.',
      }}
      resource="api_keys"
      columns={[
        { key: 'label', label: { ar: 'التسمية', en: 'Label' } },
        { key: 'provider', label: { ar: 'المزوّد', en: 'Provider' } },
        { key: 'keyHint', label: { ar: 'المفتاح', en: 'Key hint' } },
        {
          key: 'rateLimit',
          label: { ar: 'حد المعدل', en: 'Rate limit' },
          render: (row) => String(row.rateLimit ?? '60/min'),
        },
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
          onRun: async (row) => alert(`Revoke key ${row.id}`),
        },
      ]}
    />
  );
}
