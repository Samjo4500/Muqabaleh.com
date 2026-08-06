'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { PhoneOff, Loader2, ArrowLeft, Clock, User, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';

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
  const tMobile = useTranslations('mobile');
  const locale = useLocale();
  const router = useRouter();
  const isMobile = useIsMobile();

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
  const [controlsVisible, setControlsVisible] = useState(true);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
          router.push(localePath('/', locale));
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

  /* ---- Auto-hide controls timer (mobile) ---- */
  const resetAutoHide = useCallback(() => {
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    setControlsVisible(true);
    autoHideRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);

  /* Start auto-hide when entering call on mobile */
  useEffect(() => {
    if (!inCall || !isMobile) return;
    resetAutoHide();
    return () => {
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [inCall, isMobile, resetAutoHide]);

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
      setControlsVisible(true);

      // Request fullscreen on mobile
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          // Fullscreen API may not be available
        }
      }
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

    // Stop timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoHideRef.current) {
      clearTimeout(autoHideRef.current);
      autoHideRef.current = null;
    }

    // Exit fullscreen
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        // ignore
      }
    }

    setInCall(false);
    setEnded(true);
    setEnding(false);

    // Optionally redirect after 3 seconds
    setTimeout(() => {
      router.push(localePath('/app/bookings', locale));
    }, 3000);
  }, [bookingId, ending, router]);

  /* ================================================================ */
  /*  RENDER                                                             */
  /* ================================================================ */

  /* ---- Loading ---- */
  if (loading) {
    return (
      <div className="mq-atelier relative flex min-h-screen items-center justify-center overflow-x-hidden">
        <Loader2 className="h-8 w-8 animate-spin text-teal-300" />
      </div>
    );
  }

  /* ---- Error ---- */
  if (error) {
    return (
      <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-4 overflow-x-hidden p-6">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="text-center text-sm text-[var(--text-muted)]">{error}</p>
        <Button
          variant="outline"
          onClick={() => router.push(localePath('/', locale))}
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
      <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-hidden p-6">
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
          onClick={() => router.push(localePath('/', locale))}
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
      <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-hidden p-6">
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
          onClick={() => router.push(localePath('/app/bookings', locale))}
          className="cursor-pointer bg-teal-400 text-[#070b14] hover:bg-teal-300"
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
      <div
        className="relative h-screen w-screen overflow-hidden bg-black"
        onClick={() => resetAutoHide()}
      >
        {/* Single iframe fills entire viewport (z-0) */}
        <iframe
          ref={iframeRef}
          src={roomUrl}
          allow="camera; microphone; fullscreen; display-capture; autoplay"
          className="absolute inset-0 z-0 h-full w-full border-0"
          title="Muqabaleh Video Call"
        />

        {/* ============ Mobile overlay controls (md:hidden) ============ */}

        {/* Mobile top bar — conditionally visible */}
        <div
          className={
            'absolute top-0 left-0 right-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 py-3 transition-all duration-300 md:hidden' +
            (controlsVisible
              ? ' translate-y-0 opacity-100'
              : ' -translate-y-full opacity-0 pointer-events-none')
          }
        >
          <span className="text-sm font-bold text-white">
            Muqabaleh
          </span>
          <div className="flex items-center gap-2">
            <User size={14} className="text-white/70" />
            <span className="text-xs text-white/90">{interviewerName}</span>
            <span className="font-mono text-xs font-medium text-emerald">
              {formatTimer(callSeconds)}
            </span>
          </div>
        </div>

        {/* Mobile tap-to-show hint */}
        <div
          className={
            'pointer-events-none absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-2 text-center transition-opacity duration-700 md:hidden' +
            (controlsVisible
              ? ' opacity-100'
              : ' opacity-0')
          }
        >
          <span className="text-xs text-white/80">
            {tCommon('tapToShowControls')}
          </span>
        </div>

        {/* Mobile floating end-call button — ALWAYS visible */}
        <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2 md:hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEndCall();
            }}
            disabled={ending}
            className="flex h-[60px] min-w-[60px] cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-white shadow-lg shadow-red-600/40 transition-colors hover:bg-red-700 active:scale-95 disabled:opacity-50"
            aria-label={tMobile('endCall')}
          >
            {ending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <PhoneOff size={20} />
            )}
            <span className="text-sm font-medium">{tMobile('endCall')}</span>
          </button>
        </div>

        {/* ============ Desktop overlay controls (hidden on mobile) ============ */}
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 hidden shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#070b14]/80 px-4 py-3 backdrop-blur-md md:flex">
          <span className="text-lg font-bold text-teal-300">
            Muqabaleh
          </span>
          <div className="flex items-center gap-3">
            <User size={16} className="text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">
              {interviewerName}
            </span>
            <span className="font-mono text-sm font-medium text-emerald">
              {formatTimer(callSeconds)}
            </span>
          </div>
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
            <span>{t('endCall')}</span>
          </Button>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 hidden shrink-0 items-center justify-between border-t border-white/[0.08] bg-[#070b14]/80 px-4 py-3 backdrop-blur-md md:flex">
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
    <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <BrandLogo size="nav" priority />
          <p className="text-sm text-white/55">{t('videoSession')}</p>
        </div>

        {/* Session info card */}
        <div className="glass-card space-y-4 p-6">
          {/* Interviewer */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-400/10">
              <User size={20} className="text-teal-300" />
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
              <Clock size={16} className="text-teal-300" />
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
