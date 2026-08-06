'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Clock, CreditCard } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

type PaymentRow = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  packageType: string | null;
  paypalOrderId: string | null;
  sessionsCredited: number;
  capturedAt: string | null;
  createdAt: string;
};

export default function PaymentsPage() {
  const t = useTranslations('app.payments');
  const locale = useLocale();
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/candidate/payments');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        if (!cancelled) setPayments(data.payments || []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusBadge = (status: string) => {
    const key = status.toLowerCase();
    if (key === 'captured' || key === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
          <CheckCircle2 size={12} strokeWidth={1.75} />
          {t('captured')}
        </span>
      );
    }
    if (key === 'failed' || key === 'cancelled' || key === 'canceled') {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
          <XCircle size={12} strokeWidth={1.75} />
          {t('failed')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
        <Clock size={12} strokeWidth={1.75} />
        {t('pending')}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-white/55">{t('subtitle')}</p>
      </div>

      {loading ? (
        <p className="text-sm text-white/50">{t('loading')}</p>
      ) : error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
            <CreditCard size={28} strokeWidth={1.75} />
          </div>
          <p className="text-base font-semibold text-white">{t('emptyTitle')}</p>
          <p className="mt-2 max-w-md text-sm text-white/50">{t('emptySub')}</p>
          <Link
            href={localePath('/app/packages', locale)}
            className="mq-btn mq-btn-primary mt-6 inline-flex min-h-[44px] items-center px-5 text-sm font-bold"
          >
            {t('browsePackages')}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-4 py-3 text-start text-xs font-medium text-white/40">{t('date')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-white/40">{t('package')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-white/40">{t('amount')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-white/40">{t('status')}</th>
                <th className="px-4 py-3 text-start text-xs font-medium text-white/40">{t('orderId')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3 text-white/60">
                    {new Date(row.createdAt).toLocaleDateString(locale)}
                  </td>
                  <td className="px-4 py-3 font-medium text-white">
                    {row.packageType || '—'}
                    {row.sessionsCredited > 0 ? (
                      <span className="ms-2 text-xs text-white/40">
                        +{row.sessionsCredited}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {row.currency} {row.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">{statusBadge(row.status)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/40">
                    {row.paypalOrderId || row.id.slice(0, 12)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
