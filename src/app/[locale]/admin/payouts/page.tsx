'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw, Loader2, Send, Ban, CheckCircle2 } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

/** Format InterviewerPayout.amount (USD dollars). */
function formatDollars(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  PROCESSING: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={STATUS_STYLES[status] ?? 'bg-white/5 text-[var(--text-muted)] border-white/10'}>
      {status}
    </Badge>
  );
}

interface Payout {
  id: string;
  amount: number;
  paypalEmail: string;
  status: string;
  adminNote: string | null;
  batchId: string | null;
  requestedAt: string;
  processedAt: string | null;
  completedAt: string | null;
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

  // Action states
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [paypalLoading, setPaypalLoading] = useState<string | null>(null);

  // Reject dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);

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

  // Mark as paid manually
  const handleMarkPaid = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/payouts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed');
        return;
      }
      toast.success(t('markAsPaid'));
      fetchData();
    } catch {
      toast.error('Error');
    } finally {
      setProcessingId(null);
    }
  };

  // Process via PayPal
  const handlePayPal = async (id: string) => {
    setPaypalLoading(id);
    try {
      const res = await fetch('/api/paypal/send-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId: id }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(t('paypalError', { error: json.error || 'Unknown error' }));
        return;
      }
      toast.success(t('paypalSent'));
      fetchData();
    } catch {
      toast.error('Error');
    } finally {
      setPaypalLoading(null);
    }
  };

  // Reject flow
  const openRejectDialog = (id: string) => {
    setRejectId(id);
    setRejectNote('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!rejectId || !rejectNote.trim()) {
      toast.error(t('rejectReasonRequired'));
      return;
    }
    setRejectLoading(true);
    try {
      const res = await fetch(`/api/admin/payouts/${rejectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', adminNote: rejectNote.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || 'Failed');
        return;
      }
      toast.success(t('rejected'));
      setRejectDialogOpen(false);
      fetchData();
    } catch {
      toast.error('Error');
    } finally {
      setRejectLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={statusFilter || 'ALL'} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-40 text-[var(--text-primary)]">
            <SelectValue placeholder={t('statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
            <SelectItem value="PROCESSING">{t('statusProcessing')}</SelectItem>
            <SelectItem value="COMPLETED">{t('statusCompleted')}</SelectItem>
            <SelectItem value="REJECTED">{t('rejected')}</SelectItem>
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
            <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">{t('colInterviewer')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colPaypalEmail')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colAmount')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colRequestedDate')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-white/[0.04]">
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">
                        <div>
                          <p>{item.interviewer?.fullName ?? '—'}</p>
                          {item.adminNote && (
                            <p className="mt-1 text-xs text-red-400">{item.adminNote}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">
                        {item.paypalEmail}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">{formatDollars(item.amount)}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{formatDate(item.requestedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {item.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm" variant="ghost"
                                className="h-7 px-2 text-sky-400 hover:text-sky-300"
                                disabled={paypalLoading === item.id}
                                onClick={() => handlePayPal(item.id)}
                              >
                                {paypalLoading === item.id
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <Send size={14} className="me-1" />}
                                {t('processPaypal')}
                              </Button>
                              <Button
                                size="sm" variant="ghost"
                                className="h-7 px-2 text-emerald-400 hover:text-emerald-300"
                                disabled={processingId === item.id}
                                onClick={() => handleMarkPaid(item.id)}
                              >
                                {processingId === item.id
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <CheckCircle2 size={14} className="me-1" />}
                                {t('markPaidManually')}
                              </Button>
                              <Button
                                size="sm" variant="ghost"
                                className="h-7 px-2 text-red-400 hover:text-red-300"
                                onClick={() => openRejectDialog(item.id)}
                              >
                                <Ban size={14} className="me-1" />
                                {t('reject')}
                              </Button>
                            </>
                          )}
                          {item.status === 'PROCESSING' && (
                            <span className="text-xs text-[var(--text-faint)]">
                              {item.batchId ? `Batch: ${item.batchId.slice(0, 12)}…` : ''}
                            </span>
                          )}
                          {item.status === 'COMPLETED' && item.completedAt && (
                            <span className="text-xs text-[var(--text-faint)]">
                              {formatDate(item.completedAt)}
                            </span>
                          )}
                        </div>
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="border-white/10 bg-[var(--bg-panel)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('rejectPayout')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[var(--text-muted)]">{t('rejectReason')}</Label>
              <Input
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder={t('rejectReasonRequired')}
                className="border-white/10 bg-white/5 text-[var(--text-primary)]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-[var(--text-muted)]"
                onClick={() => setRejectDialogOpen(false)}
                disabled={rejectLoading}
              >
                {t('statusPending').replace('Pending', 'Cancel')}
              </Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                onClick={handleReject}
                disabled={rejectLoading || !rejectNote.trim()}
              >
                {rejectLoading && <Loader2 size={14} className="me-2 animate-spin" />}
                {t('reject')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
