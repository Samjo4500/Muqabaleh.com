'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

const payments = [
  { dateKey: 'payD1', pkgKey: 'payPkg1', amount: '$49', status: 'captured', orderId: 'MQBL-ORD-0041' },
  { dateKey: 'payD2', pkgKey: 'payPkg2', amount: '$49', status: 'failed', orderId: 'MQBL-ORD-0038' },
  { dateKey: 'payD3', pkgKey: 'payPkg3', amount: '$69', status: 'captured', orderId: 'MQBL-ORD-0035' },
  { dateKey: 'payD4', pkgKey: 'payPkg4', amount: '$29', status: 'pending', orderId: 'MQBL-ORD-0033' },
  { dateKey: 'payD5', pkgKey: 'payPkg5', amount: '$69', status: 'captured', orderId: 'MQBL-ORD-0029' },
] as const;

export default function PaymentsPage() {
  const t = useTranslations('app.payments');

  const statusBadge = (status: string) => {
    switch (status) {
      case 'captured':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald/10 px-2.5 py-0.5 text-xs font-medium text-emerald">
            <CheckCircle2 size={12} strokeWidth={1.75} />
            {t('captured')}
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
            <XCircle size={12} strokeWidth={1.75} />
            {t('failed')}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/10 px-2.5 py-0.5 text-xs font-medium text-amber">
            <Clock size={12} strokeWidth={1.75} />
            {t('pending')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03]">
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('date')}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('package')}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('amount')}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('status')}</th>
              <th className="px-4 py-3 text-start text-xs font-medium text-[var(--text-faint)]">{t('orderId')}</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((row, i) => (
              <tr
                key={i}
                className="border-b border-white/[0.05] last:border-0 transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3 text-[var(--text-muted)]">{t(row.dateKey)}</td>
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{t(row.pkgKey)}</td>
                <td className="px-4 py-3 text-[var(--text-primary)]">{row.amount}</td>
                <td className="px-4 py-3">{statusBadge(row.status)}</td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--text-faint)]">{row.orderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
