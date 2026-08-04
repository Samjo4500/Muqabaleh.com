'use client';

import { AdminConfigPanel } from '@/components/admin/AdminConfigPanel';
import { AdminDataTable } from '@/components/admin/AdminDataTable';

export default function Page() {
  return (
    <div className="space-y-10">
      <AdminConfigPanel
        title={{ ar: 'النسخ الاحتياطي والصيانة', en: 'Backup & Maintenance' }}
        description={{
          ar: 'نسخ قاعدة البيانات، تصدير البيانات، فحص الصحة، مسح الكاش، وعارض سجلات الأخطاء.',
          en: 'DB backup (manual/scheduled), export user/interview data, health check, clear cache, error log viewer.',
        }}
        sections={[
          {
            title: { ar: 'عمليات النظام', en: 'System operations' },
            fields: [
              { key: 'schedule', label: { ar: 'جدولة النسخ الاحتياطي', en: 'Scheduled backup' }, type: 'select', value: 'DAILY', options: [
                { value: 'MANUAL', label: 'Manual only' },
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
              ]},
              { key: 'health', label: { ar: 'فحص صحة النظام', en: 'System health check' }, type: 'toggle', value: true },
              { key: 'clearCache', label: { ar: 'مسح الذاكرة المؤقتة عند الحفظ', en: 'Clear cache on save' }, type: 'toggle', value: false },
              { key: 'errorLog', label: { ar: 'سجل الأخطاء', en: 'Error log viewer' }, type: 'textarea', value: 'No recent errors.' },
            ],
          },
        ]}
      />
      <AdminDataTable
        title={{ ar: 'سجل النسخ الاحتياطي', en: 'Backup log' }}
        resource="backup_logs"
        columns={[
          { key: 'type', label: { ar: 'النوع', en: 'Type' } },
          { key: 'status', label: { ar: 'الحالة', en: 'Status' } },
          { key: 'notes', label: { ar: 'ملاحظات', en: 'Notes' } },
          {
            key: 'createdAt',
            label: { ar: 'التاريخ', en: 'Date' },
            render: (row) =>
              row.createdAt ? new Date(String(row.createdAt)).toLocaleString() : '—',
          },
        ]}
      />
    </div>
  );
}
