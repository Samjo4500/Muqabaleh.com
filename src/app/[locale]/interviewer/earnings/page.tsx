'use client';

import { useTranslations } from 'next-intl';
import { DollarSign, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';

const earningsRows = [
  { date: '2026-08-01', candidateKey: 'cand4Name', amount: 65, status: 'paid' as const, methodKey: 'methodBank' },
  { date: '2026-07-30', candidateKey: 'cand5Name', amount: 65, status: 'pending' as const, methodKey: 'methodPaypal' },
  { date: '2026-07-28', candidateKey: 'cand6Name', amount: 45, status: 'paid' as const, methodKey: 'methodBank' },
  { date: '2026-07-25', candidateKey: 'cand1Name', amount: 85, status: 'paid' as const, methodKey: 'methodWallet' },
  { date: '2026-07-22', candidateKey: 'cand2Name', amount: 45, status: 'pending' as const, methodKey: 'methodBank' },
  { date: '2026-07-20', candidateKey: 'cand3Name', amount: 130, status: 'paid' as const, methodKey: 'methodBank' },
  { date: '2026-07-18', candidateKey: 'cand4Name', amount: 45, status: 'paid' as const, methodKey: 'methodPaypal' },
  { date: '2026-07-15', candidateKey: 'cand5Name', amount: 65, status: 'paid' as const, methodKey: 'methodBank' },
];

export default function EarningsPage() {
  const t = useTranslations('interviewerPanel');

  const stats = [
    { label: t('totalEarnings'), value: '$1,240', icon: DollarSign, color: 'text-gold', bgColor: 'bg-gold/10', borderColor: 'border-gold/20' },
    { label: t('pendingEarnings'), value: '$195', icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/20' },
    { label: t('paidEarnings'), value: '$1,045', icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/20' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('earningsTitle')}
      </h1>

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlowCard key={stat.label} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${stat.bgColor} ${stat.borderColor} ${stat.color}`}>
                <Icon size={24} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* Earnings Table */}
      <GlowCard className="overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colDate')}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colCandidate')}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colAmount')}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colStatus')}</th>
                <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colMethod')}</th>
              </tr>
            </thead>
            <tbody>
              {earningsRows.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-white/[0.04] last:border-b-0"
                >
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{row.date}</td>
                  <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{t(row.candidateKey)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gold">${row.amount}</td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        row.status === 'paid'
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                      }
                    >
                      <Wallet size={12} strokeWidth={1.75} className="me-1" />
                      {row.status === 'paid' ? t('statusPaid') : t('statusPending')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-[var(--text-muted)]">{t(row.methodKey)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlowCard>
    </div>
  );
}
