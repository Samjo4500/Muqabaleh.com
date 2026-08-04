'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type UsageRow = {
  id: string;
  provider: string;
  model: string;
  operation: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  success: boolean;
  createdAt: string;
};

export default function AiUsagePage() {
  const [rows, setRows] = useState<UsageRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/resources?resource=ai_usage')
      .then((r) => r.json())
      .then((d) => setRows(Array.isArray(d.items) ? d.items : []))
      .catch(() => setRows([]));
  }, []);

  const totals = useMemo(() => {
    const input = rows.reduce((a, r) => a + (r.inputTokens || 0), 0);
    const output = rows.reduce((a, r) => a + (r.outputTokens || 0), 0);
    const cost = rows.reduce((a, r) => a + (r.estimatedCostUsd || 0), 0);
    return { input, output, cost };
  }, [rows]);

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'استخدام Gemini', en: 'Gemini Usage' }}
        description={{
          ar: 'إحصاءات الاستخدام وتقدير التكلفة لمزوّد Gemini.',
          en: 'Usage stats and cost estimates for the Gemini provider.',
        }}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4">
          <BiLabel ar="رموز الإدخال" en="Input Tokens" size="sm" />
          <p className="mt-2 text-2xl font-bold">{totals.input.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4">
          <BiLabel ar="رموز الإخراج" en="Output Tokens" size="sm" />
          <p className="mt-2 text-2xl font-bold">{totals.output.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-4">
          <BiLabel ar="تكلفة تقديرية" en="Estimated Cost" size="sm" />
          <p className="mt-2 text-2xl font-bold">${totals.cost.toFixed(4)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-panel)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <BiLabel ar="المزوّد" en="Provider" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="النموذج" en="Model" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="العملية" en="Operation" size="sm" />
              </TableHead>
              <TableHead>
                <BiLabel ar="التكلفة" en="Cost" size="sm" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <BiInline
                    ar="لا توجد سجلات استخدام بعد. ستظهر بعد استدعاءات Gemini."
                    en="No usage rows yet. They appear after Gemini calls are logged."
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.provider}</TableCell>
                  <TableCell>{r.model}</TableCell>
                  <TableCell>{r.operation}</TableCell>
                  <TableCell>${Number(r.estimatedCostUsd || 0).toFixed(4)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
