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
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    BLOCKED: 'bg-red-500/10 text-red-400 border-red-500/30',
    REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return (
    <Badge variant="outline" className={map[status] ?? 'bg-white/5 text-[var(--text-muted)] border-white/10'}>
      {status}
    </Badge>
  );
}

interface Interviewer {
  id: string;
  fullName: string;
  fullNameAr: string | null;
  payoutEmail: string | null;
  status: string;
  rating: number;
  totalInterviews: number;
  totalEarnings: number;
  hourlyRate: number;
  specialties: string;
  industries: string;
  languages: string;
  yearsExperience: number;
  bio: string | null;
  bioAr: string | null;
  linkedInUrl: string | null;
  payoutMethod: string;
  idVerified: boolean;
  createdAt: string;
}

export default function AdminInterviewersPage() {
  const t = useTranslations('adminPanel.interviewers');
  const tc = useTranslations('adminPanel.common');

  const [data, setData] = useState<Interviewer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const limit = 20;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/interviewers?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAction = async (id: string, status: string) => {
    await fetch(`/api/admin/interviewers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const totalPages = Math.ceil(total / limit);
  const expanded = data.find((i) => i.id === expandedId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border-white/10 bg-white/5 ps-9 text-[var(--text-primary)]"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-40 text-[var(--text-primary)]">
            <SelectValue placeholder={t('statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('statusAll')}</SelectItem>
            <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
            <SelectItem value="ACTIVE">{t('statusActive')}</SelectItem>
            <SelectItem value="BLOCKED">{t('statusBlocked')}</SelectItem>
            <SelectItem value="REJECTED">{t('statusRejected')}</SelectItem>
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
                    <TableHead className="text-[var(--text-muted)]">{t('colName')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colEmail')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colRating')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colEarnings')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colSessions')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-white/[0.04]">
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">{item.fullName}</TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{item.payoutEmail ?? '—'}</TableCell>
                      <TableCell><StatusBadge status={item.status} /></TableCell>
                      <TableCell className="text-sm text-[var(--text-primary)]">{item.rating > 0 ? item.rating.toFixed(1) : '—'}</TableCell>
                      <TableCell className="text-sm text-[var(--text-primary)]">{formatCents(item.totalEarnings)}</TableCell>
                      <TableCell className="text-sm text-[var(--text-primary)]">{item.totalInterviews}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          >
                            <Eye size={14} />
                          </Button>
                          {item.status === 'PENDING' && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-emerald-400 hover:text-emerald-300" onClick={() => handleAction(item.id, 'ACTIVE')}>
                                {t('approve')}
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => handleAction(item.id, 'REJECTED')}>
                                {t('block')}
                              </Button>
                            </>
                          )}
                          {item.status === 'ACTIVE' && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-red-400 hover:text-red-300" onClick={() => handleAction(item.id, 'BLOCKED')}>
                              {t('block')}
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
            <DetailRow label={t('colName')} value={expanded.fullName} />
            <DetailRow label={t('colEmail')} value={expanded.payoutEmail ?? '—'} />
            <DetailRow label={t('colStatus')} value={expanded.status} />
            <DetailRow label={t('colRating')} value={expanded.rating > 0 ? String(expanded.rating) : '—'} />
            <DetailRow label={t('colSessions')} value={String(expanded.totalInterviews)} />
            <DetailRow label={t('colEarnings')} value={formatCents(expanded.totalEarnings)} />
            <DetailRow label={t('colHourlyRate')} value={formatCents(expanded.hourlyRate)} />
            <DetailRow label={t('colExperience')} value={`${expanded.yearsExperience} yrs`} />
            <DetailRow label={t('colPayoutMethod')} value={expanded.payoutMethod} />
            <DetailRow label={t('colAppliedDate')} value={formatDate(expanded.createdAt)} />
            <DetailRow label={t('colIdVerified')} value={expanded.idVerified ? 'Yes' : 'No'} />
            <DetailRow label={t('colLinkedIn')} value={expanded.linkedInUrl ?? '—'} />
          </div>
          <div className="space-y-2">
            <DetailRow label={t('colSpecialties')} value={expanded.specialties} />
            <DetailRow label={t('colIndustries')} value={expanded.industries} />
            <DetailRow label={t('colLanguages')} value={expanded.languages} />
          </div>
          {expanded.bio && (
            <div>
              <p className="text-xs text-[var(--text-faint)]">{t('colBio')}</p>
              <p className="text-sm text-[var(--text-primary)] mt-1">{expanded.bio}</p>
            </div>
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
