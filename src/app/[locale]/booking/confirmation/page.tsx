'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  CalendarPlus,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BookingRealData {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  meetingLink: string | null;
  priceTotal: number;
  status: string;
  interviewer: {
    id: string;
    fullName: string;
    fullNameAr: string;
    priceTier: string;
    hourlyRate: number;
    rating: number;
    totalInterviews: number;
    languages: string | null;
    specialties: string | null;
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDateFull(isoStr: string, locale: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

function formatTimeFromISO(isoStr: string, locale: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

function formatDate(dateStr: string, locale: string): string {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatTime(time: string, locale: string): string {
  try {
    const [h, m] = time.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return time;
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function generateICS(
  title: string,
  dateStr: string,
  timeStr: string,
  meetingUrl: string,
  durationMinutes: number,
): string {
  const start = parseToUTC(dateStr, timeStr);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Muqabaleh//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:Join meeting: ${meetingUrl}`,
    `URL:${meetingUrl}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Your interview starts in 15 minutes!',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

function parseToUTC(dateStr: string, timeStr: string): Date {
  // If dateStr is ISO format (from real booking), parse directly
  if (dateStr.includes('T')) {
    return new Date(dateStr);
  }
  const [y, mo, d] = dateStr.split('-').map(Number);
  const [h, m] = timeStr.split(':').map(Number);
  return new Date(Date.UTC(y, mo - 1, d, h, m, 0));
}

function downloadICS(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

function BookingConfirmationContent() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get('bookingId') || '';
  // Legacy URL params for fallback
  const interviewerId = searchParams.get('interviewerId') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const meetingId = searchParams.get('meetingId') || '';

  /* ── State ── */
  const [booking, setBooking] = useState<BookingRealData | null>(null);
  const [loading, setLoading] = useState(!!bookingId);
  const [fetchError, setFetchError] = useState(false);

  /* ── Fetch booking from API if bookingId exists ── */
  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = (await res.json()) as { booking?: BookingRealData };
        if (!cancelled && data.booking) {
          setBooking(data.booking);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [bookingId]);

  /* ── Derived from real booking or URL params ── */
  const hasRealData = !!booking;

  const interviewerName = hasRealData
    ? (locale === 'ar' && booking.interviewer.fullNameAr
        ? booking.interviewer.fullNameAr
        : booking.interviewer.fullName)
    : interviewerId;

  const initials = hasRealData
    ? getInitials(locale === 'ar' && booking.interviewer.fullNameAr
        ? booking.interviewer.fullNameAr
        : booking.interviewer.fullName)
    : '??';

  // For real booking, meeting link comes from the booking record
  const meetingUrl = hasRealData
    ? (booking.meetingLink || `https://meet.jit.si/muqabaleh-${booking.id.slice(0, 8)}`)
    : (meetingId ? `https://meet.jit.si/muqabaleh-${meetingId}` : '');

  // For real booking, format date/time from ISO scheduledAt
  const displayDate = hasRealData
    ? formatDateFull(booking.scheduledAt, locale)
    : formatDate(date, locale);

  const displayTime = hasRealData
    ? formatTimeFromISO(booking.scheduledAt, locale)
    : formatTime(time, locale);

  const durationMinutes = hasRealData ? booking.durationMinutes : 30;

  // For ICS generation
  const icsDateStr = hasRealData ? booking.scheduledAt : date;
  const icsTimeStr = hasRealData ? booking.scheduledAt : time;

  /* ── Handlers ── */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      toast.success(t('copied'));
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = meetingUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(t('copied'));
    }
  };

  const handleAddToCalendar = useCallback(() => {
    const icsContent = generateICS(
      `Muqabaleh Interview with ${interviewerName || 'Interviewer'}`,
      icsDateStr,
      icsTimeStr,
      meetingUrl,
      durationMinutes,
    );
    const id = bookingId || meetingId || 'booking';
    downloadICS(icsContent, `muqabaleh-${id.slice(0, 8)}.ics`);
  }, [interviewerName, icsDateStr, icsTimeStr, meetingUrl, durationMinutes, bookingId, meetingId]);

  /* ── Render ── */
  return (
    <AtelierShell>
      <div className="mq-wrap mx-auto max-w-2xl py-14 text-center md:py-20">
        <motion.div
          className="inline-flex"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ duration: 1, ease: 'easeOut' as const }}
        >
          <CheckCircle size={64} className="text-teal-300" strokeWidth={1.5} />
        </motion.div>

        <h1 className="mq-display mt-6 text-3xl font-bold text-white">
          {t('confirmTitle2')}
        </h1>

        <div className="mq-panel mt-8 rounded-2xl p-6 text-start">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-teal-300" />
            </div>
          ) : fetchError ? (
            <div className="py-8 text-center">
              <p className="text-white/55">
                {locale === 'ar'
                  ? 'لم يتم العثور على بيانات الحجز'
                  : 'Booking data not found'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/10">
                  <span className="text-xs font-bold text-teal-300">{initials}</span>
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {interviewerName || (locale === 'ar' ? 'محاور' : 'Interviewer')}
                  </p>
                  {hasRealData && booking.interviewer.rating > 0 && (
                    <p className="text-xs text-white/50">
                      {locale === 'ar' ? 'تقييم' : 'Rating'}:{' '}
                      {booking.interviewer.rating.toFixed(1)} / 5.0
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-white/10" />

              <div>
                <p className="text-sm text-white/50">{t('selectedSlot')}</p>
                <p className="mt-1 text-white">
                  {displayDate} · {displayTime}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {durationMinutes} {t('minutes')}
                </p>
              </div>

              {hasRealData && (
                <>
                  <div className="border-t border-white/10" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/50">
                      {locale === 'ar' ? 'السعر المدفوع' : 'Amount Paid'}
                    </span>
                    <span className="text-lg font-bold text-[var(--mq-sand)]">
                      ${(booking.priceTotal / 100).toFixed(2)} USD
                    </span>
                  </div>
                </>
              )}

              <div className="border-t border-white/10" />

              <div>
                <p className="mb-2 text-sm text-white/50">{t('joinMeeting')}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all text-sm text-teal-300 transition-colors hover:text-teal-200"
                  >
                    <ExternalLink size={14} className="shrink-0" />
                    <span className="truncate">{meetingUrl}</span>
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="mq-btn mq-btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <Copy size={14} />
                    {t('copyLink')}
                  </button>
                  <button
                    onClick={handleAddToCalendar}
                    className="mq-btn mq-btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                  >
                    <CalendarPlus size={14} />
                    {t('addToCalendar')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mq-panel mt-8 rounded-2xl p-6 text-start">
          <h3 className="mb-4 text-base font-semibold text-white">
            {locale === 'ar' ? 'قائمة التحضير' : 'Preparation Checklist'}
          </h3>
          <ul className="space-y-3">
            {(['checklist1', 'checklist2', 'checklist3'] as const).map((key) => (
              <li key={key} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-teal-300" />
                <span className="text-sm text-white/70">{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={`/${locale}`}
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-teal-300 transition-colors hover:text-teal-200"
        >
          {t('backToHome')}
        </a>
      </div>
    </AtelierShell>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense>
      <BookingConfirmationContent />
    </Suspense>
  );
}
