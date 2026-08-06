'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CheckCircle2,
  Star,
  Calendar,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SkeletonBlock } from '@/components/brand';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

interface DashboardBooking {
  id: string;
  candidateName: string;
  candidateEmail: string;
  scheduledAt: string;
  durationMinutes: number;
  priceTotal: number;
  interviewerPayout: number;
  status: BookingStatus;
  meetingLink: string | null;
}

interface DashboardStats {
  totalEarnings: number;
  platformFees: number;
  netIncome: number;
  sessionsCompleted: number;
  upcomingCount: number;
  avgRating: number;
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: 'easeOut' as const },
  }),
};

const tableVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.4, duration: 0.5, ease: 'easeOut' as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  CONFIRMED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  COMPLETED: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const STATUS_KEYS: Record<BookingStatus, string> = {
  PENDING: 'statusPending',
  CONFIRMED: 'statusConfirmed',
  COMPLETED: 'statusCompleted',
  CANCELLED: 'statusCancelled',
};

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDateTime(iso: string, locale: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
  const time = d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
  return { date, time };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InterviewerDashboardPage() {
  const t = useTranslations('interviewerDash');
  const tBookings = useTranslations('app.bookings');
  const locale = useLocale();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Fetch data ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsRes, earningsRes] = await Promise.all([
        fetch('/api/interviewer/bookings'),
        fetch('/api/interviewer/earnings'),
      ]);

      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings((data.bookings || []).slice(0, 10));
      }

      if (earningsRes.ok) {
        const data = await earningsRes.json();
        setStats({
          totalEarnings: data.totalEarnings || 0,
          platformFees: data.platformFees || 0,
          netIncome: data.netIncome || 0,
          sessionsCompleted: data.sessionsCompleted || 0,
          upcomingCount: data.upcomingCount || 0,
          avgRating: data.avgRating || 0,
        });
      }
    } catch (err) {
      console.warn('[Dashboard] API unavailable, using defaults');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Derived stats ── */
  const displayStats = stats || {
    totalEarnings: 0,
    platformFees: 0,
    netIncome: 0,
    sessionsCompleted: 0,
    upcomingCount: 0,
    avgRating: 0,
  };

  const statCards = [
    { value: formatCents(displayStats.netIncome), labelKey: 'netIncome' as const, icon: DollarSign, color: 'text-teal-300' },
    { value: String(displayStats.sessionsCompleted), labelKey: 'sessionsCompleted' as const, icon: CheckCircle2, color: 'text-emerald-400' },
    { value: displayStats.avgRating > 0 ? `${displayStats.avgRating.toFixed(1)} ⭐` : '—', labelKey: 'avgRating' as const, icon: Star, color: 'text-teal-300' },
    { value: String(displayStats.upcomingCount), labelKey: 'upcomingCount' as const, icon: Calendar, color: 'text-blue-400' },
  ];

  /* ── Render ── */
  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-teal-300 md:text-3xl">
        {t('overview')}
      </h1>

      {/* Stats cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} lines={2} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.labelKey}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-[#0B0F17] border border-[rgba(212,175,55,0.1)] rounded-xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-400/10">
                    <Icon size={24} strokeWidth={1.75} className="text-teal-300" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-sm text-[var(--text-muted)]">{t(stat.labelKey)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Recent bookings table */}
      {loading ? (
        <SkeletonBlock lines={6} className="h-64 rounded-xl" />
      ) : (
        <motion.div
          variants={tableVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#0B0F17] rounded-xl overflow-hidden"
        >
          {bookings.length > 0 ? (
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-[var(--text-muted)]">
                      {locale === 'ar' ? 'المرشح' : 'Candidate'}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {locale === 'ar' ? 'التاريخ' : 'Date'}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {locale === 'ar' ? 'المبلغ' : 'Amount'}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {locale === 'ar' ? 'الحالة' : 'Status'}
                    </TableHead>
                    <TableHead className="text-[var(--text-muted)]">
                      {locale === 'ar' ? 'الإجراء' : 'Action'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b) => {
                    const { date, time } = formatDateTime(b.scheduledAt, locale);
                    const statusKey = b.status as BookingStatus;
                    return (
                      <TableRow
                        key={b.id}
                        className="border-white/[0.06] hover:bg-white/[0.02]"
                      >
                        <TableCell className="font-medium text-[var(--text-primary)]">
                          {b.candidateName}
                        </TableCell>
                        <TableCell className="text-[var(--text-muted)] text-sm">
                          {date} · {time}
                        </TableCell>
                        <TableCell className="text-[var(--text-muted)] font-mono text-sm">
                          {formatCents(b.interviewerPayout)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={STATUS_COLORS[statusKey] || ''}>
                            {tBookings(STATUS_KEYS[statusKey] || 'statusPending')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(b.status === 'CONFIRMED') && b.meetingLink && (
                            <a
                              href={b.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 cursor-pointer"
                              >
                                <ExternalLink size={14} strokeWidth={1.75} />
                                {t('startInterview')}
                              </button>
                            </a>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Calendar size={40} strokeWidth={1.75} className="text-[var(--text-faint)] mb-4" />
              <p className="text-[var(--text-muted)]">
                {locale === 'ar' ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
