'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, AlertTriangle, CheckCircle2, XCircle, ExternalLink, Loader2, Video } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlowCard } from '@/components/brand';
import { toast } from 'sonner';
import { localePath } from '@/i18n/navigation';

interface Booking {
  id: string;
  candidateName: string;
  candidateEmail: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  meetingLink: string | null;
  interviewerPayout: number;
  priceTotal: number;
  cancelledBy: string | null;
  createdAt: string;
  updatedAt: string;
  review: { id: string; rating: number } | null;
}

function InterviewerJoinCall({ bookingId, scheduledAt }: { bookingId: string; scheduledAt: string }) {
  const tc = useTranslations('call');
  const locale = useLocale();
  const router = useRouter();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const msUntil = new Date(scheduledAt).getTime() - now;
  const isJoinable = msUntil <= 15 * 60 * 1000;

  const countdown = (() => {
    if (isJoinable || msUntil <= 0) return '';
    const totalSec = Math.floor(msUntil / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  })();

  const label = isJoinable
    ? tc('joinCall')
    : tc('startsIn', { time: countdown });

  return (
    <Button
      size="sm"
      disabled={!isJoinable}
      onClick={() => router.push(localePath(`/call/${bookingId}`, locale))}
      className={
        isJoinable
          ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'
          : 'cursor-not-allowed text-[var(--text-muted)] border border-white/10'
      }
    >
      <Video size={14} strokeWidth={1.75} className="me-1.5" />
      {label}
    </Button>
  );
}

interface BookingCardProps {
  booking: Booking;
  onUpdate: (id: string) => void;
}

function BookingCard({ booking, onUpdate }: BookingCardProps) {
  const t = useTranslations('interviewerPanel');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [actionLoading, setActionLoading] = useState(false);

  const isUpcoming = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const isPast = booking.status === 'COMPLETED' || booking.status === 'CANCELLED';
  const isPastDue = isUpcoming && new Date(booking.scheduledAt).getTime() < Date.now();

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('en-CA');
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date, time };
  };

  const { date, time } = formatDateTime(booking.scheduledAt);

  const handleMarkCompleted = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }
      toast.success(t('markCompleted'));
      onUpdate(booking.id);
    } catch {
      toast.error(tc('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', cancelledBy: 'INTERVIEWER' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }
      toast.success(tc('cancel'));
      onUpdate(booking.id);
    } catch {
      toast.error(tc('error'));
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = () => {
    if (booking.status === 'COMPLETED') {
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={14} strokeWidth={1.75} className="me-1.5" />
          {t('statusCompleted')}
        </Badge>
      );
    }
    if (booking.status === 'CANCELLED') {
      return (
        <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
          <XCircle size={14} strokeWidth={1.75} className="me-1.5" />
          {t('statusCancelled')}
        </Badge>
      );
    }
    if (booking.status === 'CONFIRMED') {
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 size={14} strokeWidth={1.75} className="me-1.5" />
          {t('statusConfirmed')}
        </Badge>
      );
    }
    return (
      <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
        {t('statusPending')}
      </Badge>
    );
  };

  return (
    <GlowCard>
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <p className="text-base font-bold text-[var(--text-primary)]">
            {booking.candidateName}
          </p>
          {statusBadge()}
        </div>

        {/* Date/time */}
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Clock size={16} strokeWidth={1.75} />
          <span>{date}</span>
          <span className="text-[var(--text-faint)]">|</span>
          <span>{time}</span>
        </div>

        {/* Join Call button for upcoming bookings */}
        {isUpcoming && (
          <InterviewerJoinCall bookingId={booking.id} scheduledAt={booking.scheduledAt} />
        )}

        {/* Evaluate link */}
        <Link
          href={localePath(`/interviewer/bookings/${booking.id}/evaluate`, locale)}
          className="inline-flex items-center gap-1.5 text-sm text-teal-300 transition-colors hover:text-teal-300/80"
        >
          <ExternalLink size={14} strokeWidth={1.75} />
          {t('evalTitle')}
        </Link>

        {/* Action buttons for confirmed bookings */}
        {booking.status === 'CONFIRMED' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleMarkCompleted}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 size={14} className="me-1 animate-spin" />}
              {t('markCompleted')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {tc('cancel')}
            </Button>
          </div>
        )}
      </div>
    </GlowCard>
  );
}

export default function BookingsPage() {
  const t = useTranslations('interviewerPanel');
  const tc = useTranslations('common');

  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [upRes, pastRes] = await Promise.all([
        fetch('/api/interviewer/bookings?status=UPCOMING'),
        fetch('/api/interviewer/bookings?status=PAST'),
      ]);

      if (!upRes.ok || !pastRes.ok) {
        const errData = await (upRes.ok ? pastRes : upRes).json().catch(() => ({}));
        setError(errData?.error?.en || tc('error'));
        return;
      }

      const upJson = await upRes.json();
      const pastJson = await pastRes.json();

      setUpcoming(upJson.bookings || []);
      setPast(pastJson.bookings || []);
    } catch {
      setError(tc('error'));
    } finally {
      setLoading(false);
    }
  }, [tc]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdate = useCallback((id: string) => {
    setUpcoming((prev) => prev.filter((b) => b.id !== id));
    setPast((prev) => {
      const moved = prev.find((b) => b.id === id);
      if (moved) {
        return past.map((b) => (b.id === id ? { ...moved, status: 'COMPLETED' } : b));
      }
      return past;
    });
    fetchBookings();
  }, [fetchBookings]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 w-48 animate-pulse rounded-lg bg-white/10" />
          ))}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.04] border border-white/[0.06]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('bookingsTitle')}
        </h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 text-sm text-teal-300 hover:underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        {t('bookingsTitle')}
      </h1>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="bg-white/5">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-teal-400 data-[state=active]:text-[var(--bg-void)]"
          >
            {t('tabUpcoming')}
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="data-[state=active]:bg-teal-400 data-[state=active]:text-[var(--bg-void)]"
          >
            {t('tabPast')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcoming.length === 0 ? (
            <GlowCard>
              <p className="text-center text-sm text-[var(--text-muted)]">
                {t('tabUpcoming')}
              </p>
            </GlowCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((b) => (
                <BookingCard key={b.id} booking={b} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {past.length === 0 ? (
            <GlowCard>
              <p className="text-center text-sm text-[var(--text-muted)]">
                {t('tabPast')}
              </p>
            </GlowCard>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {past.map((b) => (
                <BookingCard key={b.id} booking={b} onUpdate={handleUpdate} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
