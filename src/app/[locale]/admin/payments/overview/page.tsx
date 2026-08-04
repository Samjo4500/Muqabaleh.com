'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Skeleton } from '@/components/ui/skeleton';

export default function PaymentsOverviewPage() {
  const [stats, setStats] = useState<{
    revenueTodayCents?: number;
    revenueThisMonthCents?: number;
  } | null>(null);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, []);

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'نظرة عامة على المدفوعات', en: 'Payments Overview' }}
        description={{
          ar: 'ملخص مدفوعات PayPal لمنصة مقابلة.',
          en: 'PayPal payments summary for Muqabaleh.',
        }}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6">
          <BiLabel ar="إيرادات اليوم" en="Revenue Today" />
          <p className="mt-3 text-3xl font-bold">
            {stats ? `$${((stats.revenueTodayCents ?? 0) / 100).toFixed(2)}` : <Skeleton className="h-8 w-28" />}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-6">
          <BiLabel ar="إيرادات الشهر" en="Revenue This Month" />
          <p className="mt-3 text-3xl font-bold">
            {stats ? `$${((stats.revenueThisMonthCents ?? 0) / 100).toFixed(2)}` : <Skeleton className="h-8 w-28" />}
          </p>
        </div>
      </div>
      <p className="mt-6 text-sm text-[var(--text-muted)]">
        <BiInline
          ar="استخدم صفحة المعاملات لعرض واسترداد مدفوعات PayPal."
          en="Use the Transactions page to view and refund PayPal payments."
        />
      </p>
    </div>
  );
}
