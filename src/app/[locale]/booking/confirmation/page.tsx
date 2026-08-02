'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewerData {
  id: string;
  fullName: string;
  fullNameAr: string;
  initials: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

function generateICS(
  title: string,
  dateStr: string,
  timeStr: string,
  meetingUrl: string,
): string {
  const start = parseToUTC(dateStr, timeStr);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
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

export default function BookingConfirmationPage() {
  const t = useTranslations('booking');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const interviewerId = searchParams.get('interviewerId') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const meetingId = searchParams.get('meetingId') || Math.random().toString(36).substring(2, 10);

  /* ── State ── */
  const [interviewer, setInterviewer] = useState<InterviewerData | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch interviewer ── */
  useEffect(() => {
    if (!interviewerId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/interviewers/${interviewerId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!cancelled) setInterviewer(data.interviewer);
      } catch {
        if (!cancelled) setInterviewer(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [interviewerId]);

  /* ── Derived ── */
  const interviewerName = locale === 'ar' && interviewer?.fullNameAr
    ? interviewer.fullNameAr
    : interviewer?.fullName || '';

  const meetingUrl = `https://meet.jit.si/muqabaleh-${meetingId}`;

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

  const handleAddToCalendar = () => {
    const icsContent = generateICS(
      `Muqabaleh Interview with ${interviewerName || 'Interviewer'}`,
      date,
      time,
      meetingUrl,
    );
    downloadICS(icsContent, `muqabaleh-${meetingId}.ics`);
  };

  /* ── Render ── */
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-void)]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-2xl px-4 mt-16 mb-16 text-center">
          {/* Success animation */}
          <motion.div
            className="inline-flex"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <CheckCircle size={64} className="text-[var(--gold)]" strokeWidth={1.5} />
          </motion.div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold text-[var(--gold)]">
            {t('confirmTitle2')}
          </h1>

          {/* Booking summary card */}
          <div className="mt-8 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] p-6 text-start">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
              </div>
            ) : (
              <div className="space-y-5">
                {/* Interviewer row */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10">
                    <span className="text-xs font-bold text-[var(--gold)]">
                      {interviewer?.initials || '??'}
                    </span>
                  </div>
                  <p className="font-semibold text-white">
                    {interviewerName || interviewerId}
                  </p>
                </div>

                <div className="border-t border-white/5" />

                {/* Date/time */}
                <div>
                  <p className="text-sm text-gray-400">{t('selectedSlot')}</p>
                  <p className="mt-1 text-white">
                    {formatDate(date, locale)} · {formatTime(time, locale)}
                  </p>
                </div>

                <div className="border-t border-white/5" />

                {/* Meeting link */}
                <div>
                  <p className="mb-2 text-sm text-gray-400">{t('joinMeeting')}</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-[var(--gold)] transition-colors hover:text-[var(--gold)]/80 break-all"
                    >
                      <ExternalLink size={14} className="shrink-0" />
                      <span className="truncate">{meetingUrl}</span>
                    </a>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={handleCopyLink}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                    >
                      <Copy size={14} />
                      {t('copyLink')}
                    </button>
                    <button
                      onClick={handleAddToCalendar}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/10 hover:text-[var(--gold)]"
                    >
                      <CalendarPlus size={14} />
                      {t('addToCalendar')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preparation checklist */}
          <div className="mt-8 rounded-xl border border-white/5 bg-[#0B0F17] p-6 text-start">
            <h3 className="mb-4 text-base font-semibold text-white">
              {locale === 'ar' ? 'قائمة التحضير' : 'Preparation Checklist'}
            </h3>
            <ul className="space-y-3">
              {(['checklist1', 'checklist2', 'checklist3'] as const).map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span className="text-sm text-gray-300">{t(key)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Back to home */}
          <a
            href={`/${locale}`}
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--gold)] transition-colors hover:text-[var(--gold)]/80"
          >
            {t('backToHome')}
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
