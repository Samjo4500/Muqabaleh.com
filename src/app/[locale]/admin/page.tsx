'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { DollarSign, Users, UserCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    PENDING: 'bg-white/5 text-[var(--text-muted)] border-white/10',
    REFUNDED: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <Badge variant="outline" className={colorMap[status] ?? 'bg-white/5 text-[var(--text-muted)] border-white/10'}>
      {status}
    </Badge>
  );
}

interface Stats {
  revenueTodayCents: number;
  revenueThisMonthCents: number;
  activeUsers: number;
  pendingApplications: number;
}

interface Transaction {
  id: string;
  email: string;
  name: string | null;
  packageType: string;
  amountUsdCents: number;
  status: string;
  capturedAt: string | null;
  createdAt: string;
}

interface Interviewer {
  id: string;
  fullName: string;
  payoutEmail: string | null;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const t = useTranslations('adminPanel.dashboard');
  const tc = useTranslations('adminPanel.common');

  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingInterviewers, setPendingInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, txRes, intRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/transactions?limit=20'),
        fetch('/api/admin/interviewers?status=PENDING&limit=5'),
      ]);
      if (!statsRes.ok || !txRes.ok || !intRes.ok) throw new Error('Failed');
      const [statsData, txData, intData] = await Promise.all([
        statsRes.json(),
        txRes.json(),
        intRes.json(),
      ]);
      setStats(statsData);
      setTransactions(txData.data ?? []);
      setPendingInterviewers(intData.data ?? []);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/admin/interviewers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });
    fetchData();
  };

  const handleReject = async (id: string) => {
    await fetch(`/api/admin/interviewers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    fetchData();
  };

  const kpiCards = [
    { label: t('revenueToday'), value: stats ? formatCents(stats.revenueTodayCents) : '...', icon: DollarSign },
    { label: t('revenueThisMonth'), value: stats ? formatCents(stats.revenueThisMonthCents) : '...', icon: DollarSign },
    { label: t('activeUsers'), value: stats ? String(stats.activeUsers) : '...', icon: Users },
    { label: t('pendingApplications'), value: stats ? String(stats.pendingApplications) : '...', icon: UserCheck },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <Icon size={24} strokeWidth={1.75} className="text-gold" />
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">{kpi.label}</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {loading ? <Skeleton className="inline-block h-8 w-20" /> : kpi.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw size={14} className="me-2" />
            {tc('retry')}
          </Button>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('recentTransactions')}
        </h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-faint)]">{t('noData')}</p>
        ) : (
          <div className="max-h-96 overflow-x-auto overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[var(--text-muted)]">{t('colEmail')}</TableHead>
                  <TableHead className="text-[var(--text-muted)]">{t('colAmount')}</TableHead>
                  <TableHead className="text-[var(--text-muted)]">{t('colPlan')}</TableHead>
                  <TableHead className="text-[var(--text-muted)]">{t('colDate')}</TableHead>
                  <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id} className="border-white/[0.04]">
                    <TableCell className="text-sm text-[var(--text-primary)]">{tx.email}</TableCell>
                    <TableCell className="text-sm font-medium text-[var(--text-primary)]">{formatCents(tx.amountUsdCents)}</TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)]">{tx.packageType}</TableCell>
                    <TableCell className="text-sm text-[var(--text-muted)]">{formatDate(tx.createdAt)}</TableCell>
                    <TableCell><StatusBadge status={tx.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pending Applications */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('pendingApplicationsTitle')}
        </h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : pendingInterviewers.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-faint)]">{t('noData')}</p>
        ) : (
          <div className="space-y-3">
            {pendingInterviewers.map((intv) => (
              <div
                key={intv.id}
                className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{intv.fullName}</p>
                  <p className="text-xs text-[var(--text-muted)]">{intv.payoutEmail ?? ''}</p>
                  <p className="text-xs text-[var(--text-faint)]">{formatDate(intv.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                    onClick={() => handleApprove(intv.id)}
                  >
                    {t('approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleReject(intv.id)}
                  >
                    {t('reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
