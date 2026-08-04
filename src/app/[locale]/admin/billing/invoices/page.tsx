'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminDataTable
        title={{ ar: 'الفواتير', en: 'Invoices' }}
        description={{
          ar: 'إنشاء/عرض الفواتير، تحميل PDF، ترقيم الفواتير، وإعدادات الضريبة/VAT.',
          en: 'Generate/view invoices, download PDF, invoice numbering, tax/VAT settings.',
        }}
        resource="transactions"
        creatable={false}
        columns={[
          { key: 'id', label: { ar: 'رقم الفاتورة', en: 'Invoice #' } },
          {
            key: 'user',
            label: { ar: 'المستخدم', en: 'User' },
            render: (row) => {
              const u = row.user as { email?: string } | undefined;
              return u?.email ?? '—';
            },
          },
          {
            key: 'amount',
            label: { ar: 'المبلغ', en: 'Amount' },
            render: (row) => `$${Number(row.amount ?? 0).toFixed(2)}`,
          },
          { key: 'currency', label: { ar: 'العملة', en: 'Currency' } },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          {
            key: 'createdAt',
            label: { ar: 'التاريخ', en: 'Date' },
            render: (row) =>
              row.createdAt ? new Date(String(row.createdAt)).toLocaleDateString() : '—',
          },
        ]}
        rowActions={[
          {
            id: 'pdf',
            label: { ar: 'تحميل PDF', en: 'Download PDF' },
            onRun: async (row) => alert(`PDF invoice ${row.id}`),
          },
        ]}
      />
      <AdminConfigPanel
        title={{ ar: 'إعدادات الفواتير', en: 'Invoice settings' }}
        sections={[
          {
            title: { ar: 'إعدادات الضريبة وضريبة القيمة المضافة', en: 'Numbering & tax' },
            fields: [
              { key: 'prefix', label: { ar: 'بادئة الرقم', en: 'Number prefix' }, type: 'text', value: 'MQBL-INV-' },
              { key: 'nextNumber', label: { ar: 'الرقم التالي', en: 'Next number' }, type: 'number', value: '1001' },
              { key: 'vatRate', label: { ar: 'ضريبة القيمة المضافة %', en: 'VAT %' }, type: 'number', value: '15' },
              { key: 'vatEnabled', label: { ar: 'تفعيل الضريبة وضريبة القيمة المضافة', en: 'Enable tax/VAT' }, type: 'toggle', value: true },
            ],
          },
        ]}
      />
    </div>
  );
}
