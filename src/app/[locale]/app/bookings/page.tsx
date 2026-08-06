'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, Clock, CheckCircle2, XCircle, CalendarX, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState, GlowCard, SkeletonBlock } from '@/components/brand';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ReviewDialog } from '@/components/ReviewDialog';
import { toast } from 'sonner';
import { localePath } from '@/i18n/navigation';

interface BookingInterviewer {
  id: string;
  fullName: string | null;
  fullNameAr: string | null;
  rating: number | null;
}

interface Booking {
  id: string;
  interviewer: BookingInterviewer;
  scheduledAt: string;
  durationMinutes: number;
  priceTotal: number;
  status: string;
  meetingLink: string | null;
  dailyRoomUrl: string | null;
  review: { id: string; rating: number } | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function formatDateTime(iso: string, locale: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return { date, time };
}

// ─── Join Call Button (disabled until 15 min before session) ───
function JoinCallButton({ bookingId, scheduledAt }: { bookingId: string; scheduledAt: string }) {
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
          ? 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-xs'
          : 'cursor-not-allowed text-xs text-[var(--text-muted)] border border-white/10'
      }
    >
      <Video size={14} strokeWidth={1.75} className="me-1.5" />
      {label}
    </Button>
  );
}

export default function BookingsPage() {
  const t = useTranslations('app.bookings');
  const tc = useTranslations('common');
  const locale = useLocale();

  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Review dialog state
  const [reviewBooking, setReviewBooking] = useState<{
    bookingId: string;
    interviewerId: string;
    interviewerName: string;
  } | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [upRes, pastRes] = await Promise.all([
        fetch('/api/bookings?status=UPCOMING'),
        fetch('/api/bookings?status=PAST'),
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

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED', cancelledBy: 'CANDIDATE' }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error?.en || tc('error'));
        return;
      }
      toast.success(tc('cancel'));
      fetchBookings();
    } catch {
      toast.error(tc('error'));
    } finally {
      setCancelling(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            <Clock size={14} strokeWidth={1.75} className="me-1.5" />
            {t('statusPending')}
          </Badge>
        );
      case 'CONFIRMED':
        return (
          <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={14} strokeWidth={1.75} className="me-1.5" />
            {t('statusConfirmed')}
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400">
            <CheckCircle2 size={14} strokeWidth={1.75} className="me-1.5" />
            {t('statusCompleted')}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
            <XCircle size={14} strokeWidth={1.75} className="me-1.5" />
            {t('statusCancelled')}
          </Badge>
        );
      default:
        return null;
    }
  };

  const getInterviewerName = (interviewer: BookingInterviewer) => {
    return locale === 'ar'
      ? (interviewer.fullNameAr || interviewer.fullName || ' - ')
      : (interviewer.fullName || interviewer.fullNameAr || ' - ');
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const interviewerName = getInterviewerName(booking.interviewer);
    const initials = getInitials(locale === 'ar' ? booking.interviewer.fullNameAr : booking.interviewer.fullName);
    const { date, time } = formatDateTime(booking.scheduledAt, locale);
    const isUpcoming = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
    const isCompleted = booking.status === 'COMPLETED';

    return (
      <GlowCard className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar / Initials */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold">
            {initials}
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
              {interviewerName}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <Clock size={12} strokeWidth={1.75} />
                {date} &middot; {time}
              </span>
              <span>{t('duration', { minutes: booking.durationMinutes })}</span>
              <span className="font-medium text-[var(--text-primary)]">
                {t('price', { amount: formatCents(booking.priceTotal) })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {statusBadge(booking.status)}

          <div className="flex items-center gap-2">
            {/* Join Call for CONFIRMED/UPCOMING */}
            {isUpcoming && (
              <JoinCallButton bookingId={booking.id} scheduledAt={booking.scheduledAt} />
            )}

            {/* Cancel for UPCOMING/PENDING */}
            {isUpcoming && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[var(--text-muted)] hover:text-red-400 cursor-pointer"
                    disabled={cancelling === booking.id}
                  >
                    {cancelling === booking.id && <Loader2 size={12} className="me-1 animate-spin" />}
                    {t('cancelSession')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[var(--bg-panel)] border-white/10">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-[var(--text-primary)]">
                      {t('cancelSession')}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[var(--text-muted)]">
                      {t('cancelConfirm')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                      {tc('cancel')}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleCancel(booking.id)}
                      className="bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                    >
                      {t('cancelSession')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* Leave Review for COMPLETED without review */}
            {isCompleted && !booking.review && (
              <Button
                variant="outline"
                size="sm"
                className="border-gold/30 text-gold hover:bg-gold/10 cursor-pointer text-xs"
                onClick={() =>
                  setReviewBooking({
                    bookingId: booking.id,
                    interviewerId: booking.interviewer.id,
                    interviewerName,
                  })
                }
              >
                {t('leaveReview')}
              </Button>
            )}
          </div>
        </div>
      </GlowCard>
    );
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-white/10" />
        <div className="flex gap-2">
          <div className="h-10 w-28 animate-pulse rounded-lg bg-white/10" />
          <div className="h-10 w-20 animate-pulse rounded-lg bg-white/10" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} lines={2} />
          ))}
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchBookings}
            className="mt-3 text-sm text-gold hover:underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="bg-white/5 p-1">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-[var(--text-muted)] cursor-pointer"
            >
              {t('upcoming')}
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-gold/20 data-[state=active]:text-gold text-[var(--text-muted)] cursor-pointer"
            >
              {t('past')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcoming.length === 0 ? (
              <EmptyState icon={<CalendarX size={40} strokeWidth={1.75} />} title={t('noUpcoming')} />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {past.length === 0 ? (
              <EmptyState icon={<Clock size={40} strokeWidth={1.75} />} title={t('noPast')} />
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      {reviewBooking && (
        <ReviewDialog
          bookingId={reviewBooking.bookingId}
          interviewerId={reviewBooking.interviewerId}
          interviewerName={reviewBooking.interviewerName}
          open={!!reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={() => fetchBookings()}
        />
      )}
    </>
  );
}
