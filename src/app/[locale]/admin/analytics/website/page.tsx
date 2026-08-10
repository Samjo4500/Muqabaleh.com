'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Users, UserPlus, CreditCard, BadgeDollarSign } from 'lucide-react';

type Data = {
  website?: {
    usersTotal: number;
    signups24h: number;
    signups7d: number;
    activeSubs: number;
    revenue30dUsd: number;
    paymentsOk: number;
    paymentsFailed: number;
    refundRate: number;
  };
};

export default function Page() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    void fetch('/api/admin/analytics/overview')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  const w = data?.website;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات أداء الموقع', en: 'Website Analytics' }}
        description={{
          ar: 'أرقام حقيقية من قاعدة البيانات (مستخدمون، اشتراكات، إيرادات، استردادات).',
          en: 'Live database metrics (users, subscriptions, revenue, refunds).',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'إجمالي المستخدمين', en: 'Total users' }} value={String(w?.usersTotal ?? '—')} icon={Users} />
        <AdminStatCard label={{ ar: 'تسجيلات ٢٤ ساعة', en: 'Signups 24h' }} value={String(w?.signups24h ?? '—')} icon={UserPlus} />
        <AdminStatCard label={{ ar: 'اشتراكات نشطة', en: 'Active subs' }} value={String(w?.activeSubs ?? '—')} icon={CreditCard} />
        <AdminStatCard label={{ ar: 'إيراد ٣٠ يوماً', en: 'Revenue 30d' }} value={w ? `$${Number(w.revenue30dUsd).toFixed(0)}` : '—'} icon={BadgeDollarSign} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="المدفوعات" en="Payments" />
          <ul className="mt-4 space-y-2 text-sm">
            <li className="flex justify-between border-b border-white/5 py-2">
              <span>Completed</span>
              <span className="text-cyan-300">{w?.paymentsOk ?? 0}</span>
            </li>
            <li className="flex justify-between border-b border-white/5 py-2">
              <span>Failed</span>
              <span className="text-cyan-300">{w?.paymentsFailed ?? 0}</span>
            </li>
            <li className="flex justify-between border-b border-white/5 py-2">
              <span>Refund rate</span>
              <span className="text-cyan-300">{w?.refundRate ?? 0}%</span>
            </li>
            <li className="flex justify-between border-b border-white/5 py-2">
              <span>Signups 7d</span>
              <span className="text-cyan-300">{w?.signups7d ?? 0}</span>
            </li>
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="ملاحظة" en="Note" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            GA4 pageviews are not mixed into these cards. Product metrics come from Postgres so Super Admin decisions stay accurate offline of analytics cookies.
          </p>
        </section>
      </div>
    </div>
  );
}
