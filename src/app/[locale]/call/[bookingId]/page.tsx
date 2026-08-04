'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PhoneOff, Loader2, ArrowLeft, Clock, User, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface InterviewerInfo {
  fullName: string | null;
  fullNameAr: string | null;
}

interface Booking {
  id: string;
  status: string;
  scheduledAt: string;
  durationMinutes: number;
  interviewer: InterviewerInfo;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getInterviewerName(
  interviewer: InterviewerInfo | undefined,
  locale: string,
): string {
  if (!interviewer) return '';
  return locale === 'ar' && interviewer.fullNameAr
    ? interviewer.fullNameAr
    : interviewer.fullName || '';
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                      */
/* ------------------------------------------------------------------ */

export default function CallPage({
  params,
}: {
  params: Promise<{ bookingId: string; locale: string }>;
}) {
  const t = useTranslations('call');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  /* ---- State ---- */
  const [bookingId, setBookingId] = useState('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [inCall, setInCall] = useState(false);
  const [roomUrl, setRoomUrl] = useState('');
  const [joining, setJoining] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [ended, setEnded] = useState(false);
  const [ending, setEnding] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- Resolve params (Next.js 16 async pattern) ---- */
  useEffect(() => {
    params.then(({ bookingId: id }) => {
      setBookingId(id);
    });
  }, [params]);

  /* ---- Fetch booking ---- */
  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (cancelled) return;

        if (res.status === 403) {
          router.push('/');
          return;
        }
        if (!res.ok) {
          setError(t('errorFetching'));
          setLoading(false);
          return;
        }

        const data = await res.json();
        setBooking(data.booking);
      } catch {
        if (!cancelled) setError(t('errorFetching'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [bookingId, router, t]);

  /* ---- Countdown tick (updates every second) ---- */
  useEffect(() => {
    countdownRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  /* ---- Call timer (counts up from 00:00) ---- */
  useEffect(() => {
    if (!inCall) return;
    timerRef.current = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inCall]);

  /* ---- Derived values ---- */
  const scheduledTime = booking ? new Date(booking.scheduledAt).getTime() : 0;
  const timeUntilStart = scheduledTime - now;
  const isMoreThan15MinAway = timeUntilStart > 15 * 60 * 1000;
  const isCancelled = booking?.status === 'CANCELLED';
  const interviewerName = getInterviewerName(booking?.interviewer, locale);

  /* ---- Join Call handler ---- */
  const handleJoinCall = useCallback(async () => {
    if (!bookingId || joining) return;
    setJoining(true);

    try {
      // 1. Create / get room
      const res = await fetch('/api/daily/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || t('errorCreatingRoom'));
        setJoining(false);
        return;
      }

      const { roomUrl: url } = await res.json();
      setRoomUrl(url);
      setInCall(true);
    } catch {
      toast.error(t('errorCreatingRoom'));
    } finally {
      setJoining(false);
    }
  }, [bookingId, joining, t]);

  /* ---- End Call handler ---- */
  const handleEndCall = useCallback(async () => {
    if (!bookingId || ending) return;
    setEnding(true);

    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
    } catch {
      // best-effort
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setInCall(false);
    setEnded(true);
    setEnding(false);

    // Optionally redirect after 3 seconds
    setTimeout(() => {
      router.push('/app/bookings');
    }, 3000);
  }, [bookingId, ending, router]);

  /* ================================================================ */
  /*  RENDER                                                             */
  /* ================================================================ */

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-void)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-void)] p-6">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-center text-sm text-[var(--text-muted)]">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="border-white/10 text-[var(--text-primary)] hover:bg-white/5"
        >
          <ArrowLeft size={16} className="me-2" />
          {t('goHome')}
        </Button>
      </div>
    );
  }

  /* ---- Cancelled ---- */
  if (isCancelled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--bg-void)] p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/30 bg-red-500/10">
          <PhoneOff className="h-8 w-8 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('cancelled')}
        </h1>
        <p className="max-w-md text-center text-sm text-[var(--text-muted)]">
          {t('cancelledDescription')}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/')}
          className="border-white/10 text-[var(--text-primary)] hover:bg-white/5"
        >
          <ArrowLeft size={16} className="me-2" />
          {t('goHome')}
        </Button>
      </div>
    );
  }

  /* ---- Session Ended ---- */
  if (ended) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--bg-void)] p-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald/30 bg-emerald/10">
          <PhoneOff className="h-8 w-8 text-emerald" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('sessionEnded')}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          {t('sessionDuration')}: {formatTimer(callSeconds)}
        </p>
        <Button
          onClick={() => router.push('/app/bookings')}
          className="btn-gold cursor-pointer"
        >
          {t('leaveReview')}
        </Button>
        <p className="text-xs text-[var(--text-faint)]">
          {t('redirecting')}
        </p>
      </div>
    );
  }

  /* ---- In Call ---- */
  if (inCall && roomUrl) {
    return (
      <div className="flex h-screen flex-col bg-[var(--bg-void)]">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-3 backdrop-blur-md">
          {/* Left: Logo */}
          <span className="text-lg font-bold text-[var(--gold)]">
            Muqabaleh
          </span>

          {/* Center: Interviewer name + timer */}
          <div className="flex items-center gap-3">
            <User size={16} className="text-[var(--text-muted)]" />
            <span className="hidden text-sm font-medium text-[var(--text-primary)] sm:inline">
              {interviewerName}
            </span>
            <span className="text-xs text-[var(--text-faint)] sm:hidden">
              {interviewerName}
            </span>
            <span className="font-mono text-sm font-medium text-emerald">
              {formatTimer(callSeconds)}
            </span>
          </div>

          {/* Right: End Call */}
          <Button
            onClick={handleEndCall}
            disabled={ending}
            variant="destructive"
            className="flex cursor-pointer items-center gap-2 bg-red-600 text-white hover:bg-red-700"
          >
            {ending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <PhoneOff size={16} />
            )}
            <span className="hidden sm:inline">{t('endCall')}</span>
          </Button>
        </div>

        {/* Video iframe — full area minus top bar */}
        <div className="relative flex-1">
          <iframe
            ref={iframeRef}
            src={roomUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="absolute inset-0 h-full w-full border-0"
            title="Muqabaleh Video Call"
          />
        </div>

        {/* Bottom info bar */}
        <div className="flex shrink-0 items-center justify-between border-t border-white/[0.08] bg-[var(--bg-panel)]/80 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {interviewerName}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {formatTimer(callSeconds)}
            </span>
          </div>
          <a
            href="/support"
            className="flex items-center gap-1 text-xs text-[var(--text-faint)] transition-colors hover:text-[var(--text-muted)]"
          >
            {t('connectionIssues')}
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  /* ---- Waiting Room (pre-call) ---- */
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-void)] p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <span className="gold-gradient-text text-3xl font-bold">Muqabaleh</span>
          <p className="text-sm text-[var(--text-muted)]">{t('videoSession')}</p>
        </div>

        {/* Session info card */}
        <div className="glass-card space-y-4 p-6">
          {/* Interviewer */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gold)]/10">
              <User size={20} className="text-[var(--gold)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {interviewerName}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {t('interviewer')}
              </p>
            </div>
          </div>

          {/* Session details */}
          {booking && (
            <div className="space-y-2 border-t border-white/[0.08] pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('date')}</span>
                <span className="text-[var(--text-primary)]">
                  {new Date(booking.scheduledAt).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('time')}</span>
                <span className="text-[var(--text-primary)]">
                  {new Date(booking.scheduledAt).toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">{t('duration')}</span>
                <span className="text-[var(--text-primary)]">
                  {booking.durationMinutes} {t('minutes')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Countdown or Join button */}
        {isMoreThan15MinAway ? (
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-[var(--text-muted)]">
              <Clock size={16} className="text-[var(--gold)]" />
              <span className="text-sm">{t('startsIn')}</span>
            </div>
            <p className="font-mono text-4xl font-bold tracking-wider text-[var(--text-primary)]">
              {formatCountdown(timeUntilStart)}
            </p>
            <p className="text-xs text-[var(--text-faint)]">
              {t('joinAvailable')} {formatCountdown(timeUntilStart - 15 * 60 * 1000)}
            </p>
          </div>
        ) : (
          <Button
            onClick={handleJoinCall}
            disabled={joining}
            size="lg"
            className="w-full cursor-pointer bg-emerald text-white hover:bg-emerald/90"
          >
            {joining ? (
              <Loader2 size={18} className="me-2 animate-spin" />
            ) : null}
            {t('joinCall')}
          </Button>
        )}
      </div>
    </div>
  );
}
