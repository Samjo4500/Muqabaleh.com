'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const map: Record<string, string> = {
    PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    REQUESTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    PROCESSING: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };
  return (
    <Badge variant="outline" className={map[status] ?? 'bg-white/5 text-[var(--text-muted)] border-white/10'}>
      {status}
    </Badge>
  );
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  paidAt: string | null;
  paypalTransactionId: string | null;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  interviewer: {
    id: string;
    fullName: string;
    fullNameAr: string | null;
    payoutEmail: string | null;
  };
}

export default function AdminPayoutsPage() {
  const t = useTranslations('adminPanel.payouts');
  const tc = useTranslations('adminPanel.common');

  const [data, setData] = useState<Payout[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/payouts?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkPaid = async (id: string) => {
    await fetch(`/api/admin/payouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-40 text-[var(--text-primary)]">
            <SelectValue placeholder={t('statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="REQUESTED">{t('statusPending')}</SelectItem>
            <SelectItem value="PROCESSING">{t('statusProcessing')}</SelectItem>
            <SelectItem value="COMPLETED">{t('statusCompleted')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-sm text-red-400">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw size={14} className="me-2" />{tc('retry')}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--text-faint)]">{t('noData')}</p>
        ) : (
          <>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">{t('colInterviewer')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colAmount')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colRequestedDate')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colPeriod')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-white/[0.04]">
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">
                        <div>
                          <p>{item.interviewer?.fullName ?? '—'}</p>
                          <p className="text-xs text-[var(--text-faint)]">{item.interviewer?.payoutEmail ?? ''}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">{formatCents(item.amount)}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{formatDate(item.createdAt)}</TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">
                        {formatDate(item.periodStart)} - {formatDate(item.periodEnd)}
                      </TableCell>
                      <TableCell>
                        {item.status !== 'COMPLETED' && (
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-emerald-400 hover:text-emerald-300"
                            onClick={() => handleMarkPaid(item.id)}
                          >
                            {t('markAsPaid')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)} className="border-white/10 text-[var(--text-muted)]">
                  {tc('prev')}
                </Button>
                <span className="text-xs text-[var(--text-faint)]">{tc('page')} {page} {tc('of')} {totalPages}</span>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="border-white/10 text-[var(--text-muted)]">
                  {tc('next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
