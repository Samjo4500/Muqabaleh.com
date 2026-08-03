'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { DollarSign, Clock, CheckCircle2, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';

interface EarningsData {
  totalEarnings: number;
  totalPaidOut: number;
  pendingPayout: number;
  unclaimedEarnings: number;
  payoutEmail: string | null;
}

interface PayoutRecord {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  paypalTransactionId: string | null;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
}

export default function EarningsPage() {
  const t = useTranslations('interviewerPanel');
  const tc = useTranslations('common');

  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/interviewer/earnings');
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData?.error?.en || tc('error'));
        return;
      }
      const data = await res.json();
      setEarnings(data.earnings);
      setPayouts(data.recentPayouts || []);
    } catch {
      setError(tc('error'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const formatCents = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('earningsTitle')}
        </h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchEarnings}
            className="mt-3 text-sm text-gold hover:underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!earnings) return null;

  const stats = [
    { label: t('totalEarnings'), value: formatCents(earnings.totalEarnings), icon: DollarSign, color: 'text-gold', bgColor: 'bg-gold/10', borderColor: 'border-gold/20' },
    { label: t('pendingEarnings'), value: formatCents(earnings.pendingPayout), icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/20' },
    { label: t('paidEarnings'), value: formatCents(earnings.totalPaidOut), icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-400/10', borderColor: 'border-emerald-400/20' },
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

      {/* Payout History Table */}
      <GlowCard className="overflow-hidden !p-0">
        {payouts.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            <Wallet size={32} strokeWidth={1.75} className="mx-auto mb-3 text-[var(--text-faint)]" />
            {t('noPayouts')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colDate')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colAmount')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colStatus')}</th>
                  <th className="px-4 py-3 text-start text-sm font-medium text-[var(--text-muted)]">{t('colMethod')}</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.04] last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-[var(--text-primary)]">
                      {new Date(row.createdAt).toLocaleDateString('en-CA')}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gold">
                      {formatCents(row.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          row.status === 'PAID'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        }
                      >
                        <Wallet size={12} strokeWidth={1.75} className="me-1" />
                        {row.status === 'PAID' ? t('statusPaid') : t('statusPending')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-muted)]">
                      {row.paypalTransactionId ? t('methodPaypal') : t('methodBank')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlowCard>
    </div>
  );
}
