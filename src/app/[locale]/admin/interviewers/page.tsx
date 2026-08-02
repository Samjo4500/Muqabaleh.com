'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Check,
  X,
  Ban,
  Download,
  Star,
  ExternalLink,
  ShieldCheck,
  ShieldX,
  Play,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { GlowCard } from '@/components/brand';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { SkeletonBlock } from '@/components/brand';

// ── Types ──
type InterviewerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

type Interviewer = {
  id: string;
  fullName: string;
  fullNameAr: string | null;
  email: string | null;
  phone: string | null;
  status: InterviewerStatus;
  priceTier: string;
  specialties: string;
  industries: string | null;
  languages: string | null;
  yearsExperience: number;
  rating: number;
  totalInterviews: number;
  createdAt: string;
  idVerified: boolean;
  bio: string | null;
  bioAr: string | null;
  linkedInUrl: string | null;
  videoIntroUrl: string | null;
  rejectionReason?: string;
  suspensionReason?: string;
};

type TabKey = 'ALL' | InterviewerStatus;

const TABS: TabKey[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const SPECIALTY_LABELS: Record<string, { ar: string; en: string }> = {
  SOFTWARE_ENGINEER: { ar: 'مهندس برمجيات', en: 'Software Engineer' },
  PROJECT_MANAGER: { ar: 'مدير مشاريع', en: 'Project Manager' },
  HR_MANAGER: { ar: 'مدير موارد بشرية', en: 'HR Manager' },
  CUSTOMER_SERVICE: { ar: 'خدمة عملاء', en: 'Customer Service' },
  SALES_MANAGER: { ar: 'مدير مبيعات', en: 'Sales Manager' },
  MARKETING_SPECIALIST: { ar: 'متخصص تسويق', en: 'Marketing Specialist' },
  ACCOUNTANT: { ar: 'محاسب', en: 'Accountant' },
  DATA_ANALYST: { ar: 'محلل بيانات', en: 'Data Analyst' },
  GRAPHIC_DESIGNER: { ar: 'مصمم جرافيك', en: 'Graphic Designer' },
  OPERATIONS_MANAGER: { ar: 'مدير عمليات', en: 'Operations Manager' },
};

const STATUS_BADGE_COLORS: Record<InterviewerStatus, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  REJECTED: 'bg-red-500/10 text-red-400 border-red-500/30',
  SUSPENDED: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
};

const STATUS_I18N_KEYS: Record<InterviewerStatus, string> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
};

const TIER_KEYS: Record<string, string> = {
  STANDARD: 'standard',
  PREMIUM: 'premium',
  ELITE: 'elite',
};

// ── Component ──
export default function AdminInterviewersPage() {
  const t = useTranslations('adminInterviewers');
  const locale = useLocale();

  const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Profile modal
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileInterviewer, setProfileInterviewer] = useState<Interviewer | null>(null);

  // Reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Suspend modal
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendId, setSuspendId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  // Action loading
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch interviewers ──
  const fetchInterviewers = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/admin/interviewers?status=ALL');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInterviewers(data.interviewers || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviewers();
  }, [fetchInterviewers]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    let list = interviewers;
    if (activeTab !== 'ALL') {
      list = list.filter((i) => i.status === activeTab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (i) =>
          i.fullName.toLowerCase().includes(q) ||
          (i.fullNameAr && i.fullNameAr.includes(q)) ||
          (i.email && i.email.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [interviewers, activeTab, search]);

  // ── Helpers ──
  const displayName = (i: Interviewer) =>
    locale === 'ar' && i.fullNameAr ? i.fullNameAr : i.fullName;

  const displayBio = (i: Interviewer) =>
    locale === 'ar' && i.bioAr ? i.bioAr : i.bio;

  const formatSpecialties = (specs: string) => {
    const keys = specs.split(',').map((s) => s.trim());
    return keys
      .map((k) => {
        const label = SPECIALTY_LABELS[k];
        return label ? (locale === 'ar' ? label.ar : label.en) : k;
      })
      .join(', ');
  };

  const formatLanguages = (langs: string | null) => {
    if (!langs) return t('na');
    return langs
      .split(',')
      .map((l) => l.trim())
      .join(', ');
  };

  // ── Actions ──
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'suspend', reason?: string) => {
    setActionLoading(true);
    try {
      const body = reason ? { reason } : {};
      const res = await fetch(`/api/admin/interviewers/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      await fetchInterviewers();
    } catch {
      // Error handled silently — list refresh will reflect state
    } finally {
      setActionLoading(false);
    }
  };

  const openProfile = (i: Interviewer) => {
    setProfileInterviewer(i);
    setProfileOpen(true);
  };

  const openReject = (id: string) => {
    setRejectId(id);
    setRejectReason('');
    setRejectOpen(true);
  };

  const confirmReject = () => {
    if (rejectId) {
      handleAction(rejectId, 'reject', rejectReason || undefined);
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason('');
      setProfileOpen(false);
    }
  };

  const openSuspend = (id: string) => {
    setSuspendId(id);
    setSuspendReason('');
    setSuspendOpen(true);
  };

  const confirmSuspend = () => {
    if (suspendId) {
      handleAction(suspendId, 'suspend', suspendReason || undefined);
      setSuspendOpen(false);
      setSuspendId(null);
      setSuspendReason('');
      setProfileOpen(false);
    }
  };

  // ── Bulk actions ──
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  };

  const bulkApprove = async () => {
    for (const id of selectedIds) {
      await handleAction(id, 'approve');
    }
    setSelectedIds(new Set());
  };

  const bulkReject = async () => {
    for (const id of selectedIds) {
      await handleAction(id, 'reject');
    }
    setSelectedIds(new Set());
  };

  // ── CSV Export ──
  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Status', 'Specialties', 'Experience', 'Rating', 'Price Tier'];
    const rows = filtered.map((i) => [
      displayName(i),
      i.email || '',
      i.phone || '',
      i.status,
      formatSpecialties(i.specialties),
      `${i.yearsExperience} ${t('years')}`,
      i.rating > 0 ? i.rating.toFixed(1) : '-',
      i.priceTier,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'interviewers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Tab counts ──
  const tabCounts = useMemo(() => {
    const counts: Record<TabKey, number> = {
      ALL: interviewers.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      SUSPENDED: 0,
    };
    for (const i of interviewers) {
      if (i.status in counts) counts[i.status as InterviewerStatus]++;
    }
    return counts;
  }, [interviewers]);

  // ── Render ──
  return (
    <div className="mx-auto max-w-7xl mt-8 mb-16 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gold">{t('title')}</h1>
        <Button
          variant="outline"
          className="border-gold/30 text-gold hover:bg-gold/10 gap-2"
          onClick={exportCSV}
          disabled={loading || filtered.length === 0}
        >
          <Download size={16} strokeWidth={1.75} />
          {t('exportCsv')}
        </Button>
      </div>

      {/* ── Status Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              setSelectedIds(new Set());
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab
                ? 'bg-gold text-void'
                : 'border border-white/10 text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]'
            }`}
          >
            {tab === 'ALL' ? t('all') : t(STATUS_I18N_KEYS[tab])}
            <span className="ms-2 opacity-60">({tabCounts[tab]})</span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search
          size={18}
          strokeWidth={1.75}
          className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-full border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] py-3 ps-12 pe-4 text-sm text-[var(--text-primary)] placeholder:text-gray-500 focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
        />
      </div>

      {/* ── Bulk Actions Bar ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-gold/20 bg-gold/5 p-3"
          >
            <span className="text-sm font-medium text-gold">
              {selectedIds.size} {t('selected')}
            </span>
            <div className="flex gap-2 ms-auto">
              <Button
                size="sm"
                className="h-8 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 gap-1"
                onClick={bulkApprove}
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                <Check size={14} strokeWidth={1.75} />
                {t('approveSelected')}
              </Button>
              <Button
                size="sm"
                className="h-8 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 gap-1"
                onClick={bulkReject}
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 size={14} className="animate-spin" />}
                <X size={14} strokeWidth={1.75} />
                {t('rejectSelected')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <GlowCard className="!p-0 overflow-hidden">
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </GlowCard>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <GlowCard className="p-8 text-center">
          <p className="text-[var(--text-muted)]">{t('error')}</p>
          <Button
            variant="outline"
            className="mt-4 border-gold/30 text-gold hover:bg-gold/10"
            onClick={fetchInterviewers}
          >
            {locale === 'ar' ? 'إعادة المحاولة' : 'Retry'}
          </Button>
        </GlowCard>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && filtered.length === 0 && (
        <GlowCard className="p-8 text-center">
          <p className="text-lg font-medium text-[var(--text-primary)]">{t('noResults')}</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('noResultsDesc')}</p>
        </GlowCard>
      )}

      {/* ── Desktop Table ── */}
      {!loading && !error && filtered.length > 0 && (
        <>
          {/* Desktop */}
          <GlowCard className="hidden md:block overflow-hidden !p-0">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colName')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colExperience')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colSpecialties')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colStatus')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colRating')}</TableHead>
                    <TableHead className="text-[var(--text-muted)]">{t('colActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((interviewer) => (
                    <TableRow
                      key={interviewer.id}
                      className={`border-white/[0.06] hover:bg-white/[0.02] ${
                        interviewer.status === 'PENDING' ? 'bg-yellow-500/[0.03]' : ''
                      }`}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(interviewer.id)}
                          onCheckedChange={() => toggleSelect(interviewer.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-[var(--text-primary)]">
                            {displayName(interviewer)}
                          </span>
                          {interviewer.email && (
                            <span className="text-xs text-[var(--text-faint)]">{interviewer.email}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-[var(--text-muted)]">
                        {interviewer.yearsExperience} {t('years')}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        <span className="text-xs text-[var(--text-muted)] truncate block">
                          {formatSpecialties(interviewer.specialties)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={STATUS_BADGE_COLORS[interviewer.status]}
                        >
                          {t(STATUS_I18N_KEYS[interviewer.status])}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {interviewer.rating > 0 ? (
                          <span className="flex items-center gap-1 font-mono text-gold">
                            <Star size={14} fill="currentColor" strokeWidth={0} />
                            {interviewer.rating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[var(--text-faint)]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-[var(--text-muted)] hover:text-gold hover:bg-gold/10"
                            onClick={() => openProfile(interviewer)}
                          >
                            <Eye size={16} strokeWidth={1.75} />
                          </Button>
                          {interviewer.status === 'PENDING' && (
                            <>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10"
                                onClick={() => handleAction(interviewer.id, 'approve')}
                                disabled={actionLoading}
                              >
                                <Check size={16} strokeWidth={1.75} />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                                onClick={() => openReject(interviewer.id)}
                                disabled={actionLoading}
                              >
                                <X size={16} strokeWidth={1.75} />
                              </Button>
                            </>
                          )}
                          {interviewer.status === 'APPROVED' && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-yellow-400 hover:bg-yellow-500/10"
                              onClick={() => openSuspend(interviewer.id)}
                              disabled={actionLoading}
                            >
                              <Ban size={16} strokeWidth={1.75} />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </GlowCard>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map((interviewer) => (
              <GlowCard key={interviewer.id} className={`!p-0 overflow-hidden ${interviewer.status === 'PENDING' ? 'ring-1 ring-yellow-500/20' : ''}`}>
                <div className="p-4 space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Checkbox
                        checked={selectedIds.has(interviewer.id)}
                        onCheckedChange={() => toggleSelect(interviewer.id)}
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text-primary)] truncate">
                          {displayName(interviewer)}
                        </p>
                        {interviewer.email && (
                          <p className="text-xs text-[var(--text-faint)] truncate">{interviewer.email}</p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={STATUS_BADGE_COLORS[interviewer.status]}
                    >
                      {t(STATUS_I18N_KEYS[interviewer.status])}
                    </Badge>
                  </div>

                  {/* Card Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[var(--text-faint)]">{t('colExperience')}</span>
                      <p className="text-[var(--text-primary)]">{interviewer.yearsExperience} {t('years')}</p>
                    </div>
                    <div>
                      <span className="text-[var(--text-faint)]">{t('colRating')}</span>
                      <p className="text-[var(--text-primary)]">
                        {interviewer.rating > 0 ? (
                          <span className="flex items-center gap-1 font-mono text-gold">
                            <Star size={12} fill="currentColor" strokeWidth={0} />
                            {interviewer.rating.toFixed(1)}
                          </span>
                        ) : (
                          '—'
                        )}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-[var(--text-faint)]">{t('colSpecialties')}</span>
                    <p className="text-sm text-[var(--text-muted)]">{formatSpecialties(interviewer.specialties)}</p>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1 border-gold/30 text-gold hover:bg-gold/10 flex-1"
                      onClick={() => openProfile(interviewer)}
                    >
                      <Eye size={14} strokeWidth={1.75} />
                      {t('viewProfile')}
                    </Button>
                    {interviewer.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          className="h-8 gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 flex-1"
                          onClick={() => handleAction(interviewer.id, 'approve')}
                          disabled={actionLoading}
                        >
                          <Check size={14} strokeWidth={1.75} />
                          {t('approve')}
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 gap-1 bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 flex-1"
                          onClick={() => openReject(interviewer.id)}
                          disabled={actionLoading}
                        >
                          <X size={14} strokeWidth={1.75} />
                          {t('reject')}
                        </Button>
                      </>
                    )}
                    {interviewer.status === 'APPROVED' && (
                      <Button
                        size="sm"
                        className="h-8 gap-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/20 flex-1"
                        onClick={() => openSuspend(interviewer.id)}
                        disabled={actionLoading}
                      >
                        <Ban size={14} strokeWidth={1.75} />
                        {t('suspend')}
                      </Button>
                    )}
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        </>
      )}

      {/* ── View Profile Modal ── */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gold text-xl">{t('profileTitle')}</DialogTitle>
            <DialogDescription className="sr-only">{t('profileTitle')}</DialogDescription>
          </DialogHeader>

          {profileInterviewer && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Name + Status */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    {displayName(profileInterviewer)}
                  </h3>
                  {profileInterviewer.email && (
                    <p className="text-sm text-[var(--text-muted)]">{profileInterviewer.email}</p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={STATUS_BADGE_COLORS[profileInterviewer.status]}
                >
                  {t(STATUS_I18N_KEYS[profileInterviewer.status])}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label={t('profileEmail')} value={profileInterviewer.email} />
                <InfoRow label={t('profilePhone')} value={profileInterviewer.phone} />
                <InfoRow
                  label={t('profileLinkedIn')}
                  value={profileInterviewer.linkedInUrl}
                  render={(v) =>
                    v ? (
                      <a
                        href={v}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gold hover:underline"
                      >
                        <ExternalLink size={14} />
                        {locale === 'ar' ? 'الملف الشخصي' : 'Profile'}
                      </a>
                    ) : (
                      <span className="text-[var(--text-faint)]">{t('na')}</span>
                    )
                  }
                />
                <InfoRow label={t('profileExperience')} value={`${profileInterviewer.yearsExperience} ${t('years')}`} />
                <InfoRow label={t('profilePriceTier')} value={t(TIER_KEYS[profileInterviewer.priceTier] || 'standard')} />
                <InfoRow
                  label={t('profileIdVerified')}
                  render={() =>
                    profileInterviewer.idVerified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <ShieldCheck size={14} />
                        {t('profileIdVerified')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <ShieldX size={14} />
                        {t('profileIdNotVerified')}
                      </span>
                    )
                  }
                />
                <InfoRow label={t('profileLanguages')} value={formatLanguages(profileInterviewer.languages)} />
                <InfoRow
                  label={t('profileAppliedAt')}
                  value={new Date(profileInterviewer.createdAt).toLocaleDateString(
                    locale === 'ar' ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'long', day: 'numeric' },
                  )}
                />
              </div>

              {/* Specialties */}
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">{t('profileSpecialties')}</span>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {profileInterviewer.specialties.split(',').map((s) => {
                    const label = SPECIALTY_LABELS[s.trim()];
                    return (
                      <Badge
                        key={s}
                        variant="outline"
                        className="border-gold/20 bg-gold/5 text-gold"
                      >
                        {label ? (locale === 'ar' ? label.ar : label.en) : s.trim()}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Industries */}
              {profileInterviewer.industries && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">{t('profileIndustries')}</span>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {profileInterviewer.industries.split(',').map((i) => i.trim()).join(', ')}
                  </p>
                </div>
              )}

              {/* Bio */}
              {displayBio(profileInterviewer) && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">{t('profileBio')}</span>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                    {displayBio(profileInterviewer)}
                  </p>
                </div>
              )}

              {/* Video Intro */}
              {profileInterviewer.videoIntroUrl && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">{t('profileVideoIntro')}</span>
                  <a
                    href={profileInterviewer.videoIntroUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3 text-sm text-gold hover:bg-gold/10 transition-colors"
                  >
                    <Play size={18} />
                    {locale === 'ar' ? 'مشاهدة المقدمة' : 'Watch Introduction'}
                  </a>
                </div>
              )}

              {/* Rejection/Suspension reason if exists */}
              {profileInterviewer.rejectionReason && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-red-400">{t('rejectReason')}</span>
                  <p className="mt-1 text-sm text-red-300">{profileInterviewer.rejectionReason}</p>
                </div>
              )}
              {profileInterviewer.suspensionReason && (
                <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-yellow-400">{t('suspendReason')}</span>
                  <p className="mt-1 text-sm text-yellow-300">{profileInterviewer.suspensionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {(profileInterviewer.status === 'PENDING' || profileInterviewer.status === 'APPROVED') && (
                <DialogFooter className="flex-row gap-2 sm:justify-end">
                  {profileInterviewer.status === 'PENDING' && (
                    <>
                      <Button
                        className="bg-emerald-500/80 text-white hover:bg-emerald-500 font-bold gap-2"
                        onClick={() => {
                          handleAction(profileInterviewer.id, 'approve');
                          setProfileOpen(false);
                        }}
                        disabled={actionLoading}
                      >
                        {actionLoading && <Loader2 size={16} className="animate-spin" />}
                        <Check size={16} strokeWidth={1.75} />
                        {t('approve')}
                      </Button>
                      <Button
                        className="bg-red-500/80 text-white hover:bg-red-500 font-bold gap-2"
                        onClick={() => openReject(profileInterviewer.id)}
                        disabled={actionLoading}
                      >
                        <X size={16} strokeWidth={1.75} />
                        {t('reject')}
                      </Button>
                    </>
                  )}
                  {profileInterviewer.status === 'APPROVED' && (
                    <Button
                      className="bg-yellow-500/80 text-void hover:bg-yellow-500 font-bold gap-2"
                      onClick={() => openSuspend(profileInterviewer.id)}
                      disabled={actionLoading}
                    >
                      <Ban size={16} strokeWidth={1.75} />
                      {t('suspend')}
                    </Button>
                  )}
                </DialogFooter>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Reject Confirmation Modal ── */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('confirmReject')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label className="text-[var(--text-muted)]">{t('rejectReason')}</Label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t('rejectReasonPlaceholder')}
              className="glass-input min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="border-white/10 text-[var(--text-muted)] hover:bg-white/5"
              onClick={() => setRejectOpen(false)}
            >
              {t('close')}
            </Button>
            <Button
              className="bg-red-500/80 text-white hover:bg-red-500 font-bold"
              onClick={confirmReject}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 size={16} className="me-2 animate-spin" />}
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Suspend Confirmation Modal ── */}
      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent className="glass-card !bg-[var(--bg-panel)] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[var(--text-primary)]">{t('confirmSuspend')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Label className="text-[var(--text-muted)]">{t('suspendReason')}</Label>
            <Textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder={t('suspendReasonPlaceholder')}
              className="glass-input min-h-[100px]"
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="border-white/10 text-[var(--text-muted)] hover:bg-white/5"
              onClick={() => setSuspendOpen(false)}
            >
              {t('close')}
            </Button>
            <Button
              className="bg-yellow-500/80 text-void hover:bg-yellow-500 font-bold"
              onClick={confirmSuspend}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 size={16} className="me-2 animate-spin" />}
              {t('suspend')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ──
function InfoRow({
  label,
  value,
  render,
}: {
  label: string;
  value?: string | null;
  render?: (value: string | null) => React.ReactNode;
}) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-faint)]">{label}</span>
      {render ? (
        <div className="mt-0.5">{render(value ?? null)}</div>
      ) : (
        <p className="mt-0.5 text-sm text-[var(--text-primary)]">{value || "—"}</p>
      )}
    </div>
  );
}
