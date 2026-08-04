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

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    FREE: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    PRO: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    UNLIMITED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };
  return (
    <Badge variant="outline" className={map[tier] ?? 'bg-white/5 text-[var(--text-muted)] border-white/10'}>
      {tier}
    </Badge>
  );
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  country: string | null;
  subscriptionTier: string;
  sessionsLeft: number;
  role: string;
  accountType: string;
  isActive: boolean;
  createdAt: string;
  _count: { interviews: number; payments: number };
}

export default function AdminUsersPage() {
  const t = useTranslations('adminPanel.users');
  const tc = useTranslations('adminPanel.common');

  const [data, setData] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tierFilter, setTierFilter] = useState('');
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
      if (tierFilter) params.set('tier', tierFilter);
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [page, tierFilter, search, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / limit);
  const expanded = data.find((u) => u.id === expandedId);

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
        <Select value={tierFilter} onValueChange={(v) => { setTierFilter(v === 'ALL' ? '' : v); setPage(1); }}>
          <SelectTrigger className="w-full border-white/10 bg-white/5 sm:w-40 text-[var(--text-primary)]">
            <SelectValue placeholder={t('tierFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t('tierAll')}</SelectItem>
            <SelectItem value="FREE">{t('tierFree')}</SelectItem>
            <SelectItem value="PRO">{t('tierPro')}</SelectItem>
            <SelectItem value="UNLIMITED">{t('tierUnlimited')}</SelectItem>
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
                    <TableHead className="text-[var(--text-muted)]">{t('colEmail')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colTier')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colSessionsUsed')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colTotalSpent')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colSignupDate')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id} className="border-white/[0.04]">
                      <TableCell className="text-sm font-medium text-[var(--text-primary)]">{item.email}</TableCell>
                      <TableCell><TierBadge tier={item.subscriptionTier} /></TableCell>
                      <TableCell className="text-sm text-[var(--text-primary)]">{item._count.interviews}</TableCell>
                      <TableCell className="text-sm text-[var(--text-primary)]">—</TableCell>
                      <TableCell className="text-sm text-[var(--text-muted)]">{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm" variant="ghost"
                          className="h-7 px-2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        >
                          <Eye size={14} className="me-1" />{t('view')}
                        </Button>
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
            <DetailRow label={t('colEmail')} value={expanded.email} />
            <DetailRow label={t('colName')} value={expanded.name ?? '—'} />
            <DetailRow label={t('colTier')} value={expanded.subscriptionTier} />
            <DetailRow label={t('colRole')} value={expanded.role} />
            <DetailRow label={t('colCountry')} value={expanded.country ?? '—'} />
            <DetailRow label={t('colSessionsUsed')} value={String(expanded._count.interviews)} />
            <DetailRow label={t('colSignupDate')} value={formatDate(expanded.createdAt)} />
            <DetailRow label={t('colTotalSpent')} value={`${expanded._count.payments} payments`} />
          </div>
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
