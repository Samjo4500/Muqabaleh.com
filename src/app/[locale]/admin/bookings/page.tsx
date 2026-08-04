'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Search, RefreshCw, Eye, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' ' + d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PENDING: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    CONFIRMED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
    REFUNDED: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  };
  return (
    <Badge variant="outline" className={map[status] ?? 'bg-white/5 text-[var(--text-muted)] border-white/10'}>
      {status}
    </Badge>
  );
}

interface Booking {
  id: string;
  candidateName: string;
  candidateEmail: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  priceTotal: number;
  platformFee: number;
  interviewerPayout: number;
  meetingLink: string | null;
  candidateNote: string | null;
  interviewerNotes: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
  createdAt: string;
  interviewer: {
    id: string;
    fullName: string;
    fullNameAr: string | null;
    payoutEmail: string | null;
  };
}

interface InterviewerOption {
  id: string;
  fullName: string;
}

export default function AdminBookingsPage() {
  const t = useTranslations('adminPanel.bookings');
  const tc = useTranslations('adminPanel.common');

  const [data, setData] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [interviewerFilter, setInterviewerFilter] = useState('');
  const [interviewerOptions, setInterviewerOptions] = useState<InterviewerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const limit = 20;

  const fetchInterviewers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/interviewers?limit=100');
      if (res.ok) {
        const json = await res.json();
        setInterviewerOptions((json.data ?? []).map((i: { id: string; fullName: string }) => ({ id: i.id, fullName: i.fullName })));
      }
    } catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('from', dateFrom);
      if (dateTo) params.set('to', dateTo);
      if (interviewerFilter) params.set('interviewerId', interviewerFilter);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateFrom, dateTo, interviewerFilter, t]);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: string, status: string) => {
    await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);
  const expanded = data.find((b) => b.id === expandedId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-40 text-[var(--text-primary)]">
            <SelectValue placeholder={t('statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
            <SelectItem value="CONFIRMED">{t('statusConfirmed')}</SelectItem>
            <SelectItem value="COMPLETED">{t('statusCompleted')}</SelectItem>
            <SelectItem value="CANCELLED">{t('statusCancelled')}</SelectItem>
            <SelectItem value="REFUNDED">{t('statusRefunded')}</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-full border-white/10 bg-white/5 text-[var(--text-primary)] sm:w-40"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-full border-white/10 bg-white/5 text-[var(--text-primary)] sm:w-40"
          />
        </div>

        <Select value={interviewerFilter} onValueChange={(v) => { setInterviewerFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-48 text-[var(--text-primary)]">
            <SelectValue placeholder={t('interviewerFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('allInterviewers')}</SelectItem>
            {interviewerOptions.map((i) => (
              <SelectItem key={i.id} value={i.id}>{i.fullName}</SelectItem>
            ))}
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
            <div className="max-h-96 overflow-x-auto overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">{t('colUser')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colInterviewer')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colDateTime')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colAmount')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colCommission')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-white/[0.04]">
                      <TableCell className="text-sm text-[var(--text-primary)]">{item.candidateName}</TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{item.interviewer?.fullName ?? '—'}</TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{formatDateTime(item.scheduledAt)}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">{formatCents(item.priceTotal)}</TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{formatCents(item.platformFee)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm" variant="ghost"
                            className="h-7 px-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          >
                            <Eye size={14} />
                          </Button>
                          {(item.status === 'PENDING' || item.status === 'CONFIRMED') && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => handleAction(item.id, 'CANCELLED')}>
                              {t('cancel')}
                            </Button>
                          )}
                          {(item.status === 'PENDING' || item.status === 'CONFIRMED' || item.status === 'COMPLETED') && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-orange-400 hover:text-orange-300" onClick={() => handleAction(item.id, 'REFUNDED')}>
                              {t('refund')}
                            </Button>
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

      {/* Detail Panel */}
      {expanded && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">{t('detail')}</h2>
            <Button size="sm" variant="ghost" onClick={() => setExpandedId(null)} className="text-[var(--text-muted)]">
              <X size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailRow label={t('colCandidateName')} value={expanded.candidateName} />
            <DetailRow label={t('colCandidateEmail')} value={expanded.candidateEmail} />
            <DetailRow label={t('colInterviewer')} value={expanded.interviewer?.fullName ?? '—'} />
            <DetailRow label={t('colDateTime')} value={formatDateTime(expanded.scheduledAt)} />
            <DetailRow label={t('colDuration')} value={`${expanded.durationMinutes} min`} />
            <DetailRow label={t('colStatus')} value={expanded.status} />
            <DetailRow label={t('colAmount')} value={formatCents(expanded.priceTotal)} />
            <DetailRow label={t('colCommission')} value={formatCents(expanded.platformFee)} />
            <DetailRow label="Interviewer Payout" value={formatCents(expanded.interviewerPayout)} />
          </div>
          {expanded.meetingLink && (
            <DetailRow label={t('colMeetingLink')} value={expanded.meetingLink} />
          )}
          {expanded.candidateNote && (
            <DetailRow label={t('colNote')} value={expanded.candidateNote} />
          )}
          {expanded.cancelledAt && (
            <DetailRow label="Cancelled By" value={`${expanded.cancelledBy ?? 'Unknown'} at ${formatDateTime(expanded.cancelledAt)}`} />
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--text-faint)]">{label}</p>
      <p className="text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
