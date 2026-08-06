'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useCallback } from 'react';
import { Calendar, DollarSign, Star, ShieldCheck, AlertTriangle, Building2, Clock } from 'lucide-react';
import { GlowCard } from '@/components/brand';
import { Badge } from '@/components/ui/badge';

interface InterviewerStats {
  completedInterviews: number;
  upcomingBookings: number;
  totalEarnings: number;
}

interface InterviewerData {
  rating: number;
  idVerified: boolean;
  status: string;
  stats: InterviewerStats;
}

interface BookingItem {
  id: string;
  candidateName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingLink: string | null;
}

export default function InterviewerDashboard() {
  const t = useTranslations('interviewerPanel');
  const tc = useTranslations('common');

  const [interviewer, setInterviewer] = useState<InterviewerData | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [meRes, bookingsRes] = await Promise.all([
        fetch('/api/interviewer/me'),
        fetch('/api/interviewer/bookings?status=UPCOMING'),
      ]);

      if (!meRes.ok || !bookingsRes.ok) {
        const errData = await (meRes.ok ? bookingsRes : meRes).json().catch(() => ({}));
        const msg = errData?.error?.en || tc('error');
        setError(msg);
        return;
      }

      const meJson = await meRes.json();
      const bookingsJson = await bookingsRes.json();

      setInterviewer(meJson.interviewer);
      setUpcomingBookings(bookingsJson.bookings || []);
    } catch {
      setError(tc('error'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCents = (cents: number) =>
    `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
          ))}
        </div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('dashTitle')}
        </h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 text-sm text-teal-300 hover:underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!interviewer) return null;

  const kpis = [
    {
      label: t('kpiUpcoming'),
      value: String(interviewer.stats.upcomingBookings),
      icon: Calendar,
      color: 'text-cyan-400',
    },
    {
      label: t('kpiEarnings'),
      value: formatCents(interviewer.stats.totalEarnings),
      icon: DollarSign,
      color: 'text-teal-300',
    },
    {
      label: t('kpiRating'),
      value: interviewer.rating > 0 ? interviewer.rating.toFixed(1) : '—',
      icon: Star,
      color: 'text-teal-300',
    },
    {
      label: t('kpiAccreditation'),
      value: t('accredited'),
      icon: ShieldCheck,
      color: interviewer.idVerified ? 'text-emerald-400' : 'text-amber-400',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('dashTitle')}
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlowCard key={kpi.label} className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 ${kpi.color}`}>
                <Icon size={24} strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm text-[var(--text-muted)]">{kpi.label}</p>
                <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('upcomingBookings')}
        </h2>
        {upcomingBookings.length === 0 ? (
          <GlowCard>
            <p className="text-center text-sm text-[var(--text-muted)]">
              {t('upcomingBookings')}
            </p>
          </GlowCard>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingBookings.map((booking) => {
              const { date, time } = formatDateTime(booking.scheduledAt);
              const isNearSession = new Date(booking.scheduledAt).getTime() - Date.now() < 2 * 60 * 60 * 1000;
              return (
                <GlowCard key={booking.id}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-[var(--text-primary)]">
                        {booking.candidateName}
                      </p>
                      <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                        {t('statusUpcoming')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Clock size={16} strokeWidth={1.75} />
                      <span>{date}</span>
                      <span className="text-[var(--text-faint)]">|</span>
                      <span>{time}</span>
                    </div>
                    {!booking.meetingLink && isNearSession && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        <AlertTriangle size={16} strokeWidth={1.75} />
                        <span>{t('addMeetingUrlWarning')}</span>
                      </div>
                    )}
                  </div>
                </GlowCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
