'use client';

import { useEffect, useState } from 'react';
import { AdminDataTable } from '@/components/admin/AdminDataTable';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { Activity, DollarSign, Zap } from 'lucide-react';

export default function Page() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    void fetch('/api/admin/resources?resource=ai_usage')
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d.items) ? d.items : []))
      .catch(() => setRows([]));
  }, []);

  const cost = rows.reduce((s, r) => s + Number(r.estimatedCostUsd ?? 0), 0);
  const tokens = rows.reduce(
    (s, r) => s + Number(r.inputTokens ?? 0) + Number(r.outputTokens ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label={{ ar: 'حجم الاستدعاءات', en: 'API call volume' }} value={String(rows.length)} icon={Activity} />
        <AdminStatCard label={{ ar: 'الرموز', en: 'Tokens' }} value={String(tokens)} icon={Zap} />
        <AdminStatCard label={{ ar: 'التكلفة التقديرية', en: 'Cost per provider' }} value={`$${cost.toFixed(4)}`} icon={DollarSign} />
      </div>
      <AdminDataTable
        title={{ ar: 'الاستهلاك والتكاليف', en: 'Usage & Costs' }}
        description={{
          ar: 'الاستهلاك اليومي/الشهري، التكلفة لكل مزوّد، وتنبيهات عند وصول ٨٠٪ من الميزانية.',
          en: 'Daily/monthly volume, cost per provider, alerts at 80% budget threshold.',
        }}
        resource="ai_usage"
        creatable={false}
        columns={[
          { key: 'provider', label: { ar: 'المزوّد', en: 'Provider' } },
          { key: 'model', label: { ar: 'النموذج', en: 'Model' } },
          { key: 'operation', label: { ar: 'العملية', en: 'Operation' } },
          { key: 'inputTokens', label: { ar: 'رموز الإدخال', en: 'Input tokens' } },
          { key: 'outputTokens', label: { ar: 'رموز الإخراج', en: 'Output tokens' } },
          {
            key: 'estimatedCostUsd',
            label: { ar: 'التكلفة', en: 'Cost USD' },
            render: (row) => `$${Number(row.estimatedCostUsd ?? 0).toFixed(4)}`,
          },
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
