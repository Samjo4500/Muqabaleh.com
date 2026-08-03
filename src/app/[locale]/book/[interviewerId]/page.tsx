'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Video, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BookingPayPalButton } from '@/components/BookingPayPalButton';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewerData {
  id: string;
  fullName: string;
  fullNameAr: string;
  initials: string;
  currentTitle: string;
  currentTitleAr: string;
  priceTier: string;
  rating: number;
}

interface BookingData {
  id: string;
  priceTotal: number;
  status: string;
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

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

function BookPageContent() {
  const t = useTranslations('booking');
  const tc = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const interviewerId = params.interviewerId as string;
  const date = searchParams.get('date') || '';
  const startTime = searchParams.get('startTime') || searchParams.get('time') || '';
  const endTime = searchParams.get('endTime') || '';
  const duration = searchParams.get('duration') || '30';

  /* ── State ── */
  const [interviewer, setInterviewer] = useState<InterviewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [bookingError, setBookingError] = useState('');

  /* ── Fetch interviewer ── */
  useEffect(() => {
    if (!interviewerId) return;
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

  // Show real price from booking if available, otherwise show estimated from tier
  const displayPrice = booking
    ? (booking.priceTotal / 100)
    : 0;

  const displayTime = startTime || '';

  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  /* ── Create booking handler ── */
  const handleCreateBooking = useCallback(async () => {
    if (!termsAccepted || !date || !startTime || !interviewerId) return;

    setCreatingBooking(true);
    setBookingError('');

    try {
      // Build an ISO datetime string for scheduledAt
      const scheduledAt = new Date(`${date}T${startTime}:00`).toISOString();

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewerId,
          scheduledAt,
          durationMinutes: parseInt(duration, 10) || 30,
          candidateNote: note.trim() || undefined,
        }),
      });

      const data = (await res.json()) as {
        booking?: BookingData;
        error?: { en?: string; ar?: string };
      };

      if (!res.ok || data.error) {
        const msg = locale === 'ar'
          ? (data.error?.ar || 'حدث خطأ أثناء إنشاء الحجز')
          : (data.error?.en || 'Error creating booking');
        setBookingError(msg);
        return;
      }

      if (data.booking) {
        setBooking(data.booking);
      }
    } catch {
      setBookingError(locale === 'ar' ? 'حدث خطأ في الشبكة' : 'Network error');
    } finally {
      setCreatingBooking(false);
    }
  }, [termsAccepted, date, startTime, interviewerId, duration, note, locale]);

  /* ── PayPal success handler ── */
  const handlePayPalSuccess = useCallback(() => {
    if (!booking) return;
    router.push(`/${locale}/booking/confirmation?bookingId=${booking.id}`);
  }, [booking, locale, router]);

  /* ── PayPal error handler ── */
  const handlePayPalError = useCallback((err: string) => {
    setBookingError(err);
  }, []);

  /* ── Render ── */
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-void)]">
      <Navbar />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-2xl px-4 mt-8 mb-16">
          {/* Back link */}
          <a
            href={`/${locale}/interviewer/${interviewerId}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-[var(--gold)]"
          >
            <BackArrow size={16} />
            {tc('back')}
          </a>

          {/* Title */}
          <h1 className="mt-4 text-3xl font-bold text-[var(--gold)]">
            {t('confirmTitle')}
          </h1>

          {/* Booking summary card */}
          <div className="mt-6 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--gold)]" />
              </div>
            ) : interviewer ? (
              <div className="space-y-5">
                {/* Interviewer info row */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10">
                    <span className="text-xs font-bold text-[var(--gold)]">
                      {interviewer.initials}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">
                      {interviewerName}
                    </p>
                    <p className="text-xs text-gray-400">
                      {locale === 'ar' && interviewer.currentTitleAr
                        ? interviewer.currentTitleAr
                        : interviewer.currentTitle}
                    </p>
                  </div>
                </div>

                <div className="border-t border-white/5" />

                {/* Selected date/time */}
                <div>
                  <p className="text-sm text-gray-400">{t('selectedSlot')}</p>
                  <p className="mt-1 text-white">
                    {formatDate(date, locale)} · {formatTime(displayTime, locale)}
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-sm text-gray-400">{t('duration')}</p>
                  <p className="mt-1 text-white">
                    {duration} {t('minutes')}
                  </p>
                </div>

                {/* Meeting method */}
                <div>
                  <p className="text-sm text-gray-400">{t('method')}</p>
                  <div className="mt-1 flex items-center gap-2 text-white">
                    <Video size={16} className="text-[var(--gold)]" />
                    <span>{t('jitsiBrowser')}</span>
                  </div>
                </div>

                <div className="border-t border-white/5" />

                {/* Price */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {locale === 'ar' ? 'السعر' : 'Price'}
                  </span>
                  <span className="text-2xl font-bold text-[var(--gold)]">
                    {booking
                      ? `$${displayPrice.toFixed(2)}`
                      : '—'
                    }
                  </span>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                {locale === 'ar' ? 'المحاور غير موجود' : 'Interviewer not found'}
              </p>
            )}
          </div>

          {/* Note textarea - only show when booking hasn't been created yet */}
          {!booking && (
            <>
              <div className="mt-6">
                <label className="mb-2 block text-sm text-gray-300">
                  {t('addNote')}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('notePlaceholder')}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[rgba(212,175,55,0.15)] bg-[#0B0F17] p-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-[var(--gold)]/40 focus:ring-1 focus:ring-[var(--gold)]/20 transition-colors"
                />
              </div>

              {/* Terms checkbox */}
              <div className="mt-6 flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                  className="mt-0.5 border-[var(--gold)]/40 data-[state=checked]:bg-[var(--gold)] data-[state=checked]:border-[var(--gold)]"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm leading-relaxed text-gray-400"
                >
                  {t('cancellationTerms')}
                </label>
              </div>

              {/* Error message */}
              {bookingError && (
                <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-center text-sm text-red-400">
                  {bookingError}
                </div>
              )}

              {/* Create booking button - creates the booking and then shows PayPal */}
              <button
                onClick={handleCreateBooking}
                disabled={!termsAccepted || creatingBooking || !date || !startTime || !interviewer}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-[var(--gold)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingBooking && <Loader2 size={16} className="animate-spin" />}
                {t('payAndBook')}
              </button>
            </>
          )}

          {/* PayPal button - show after booking is created */}
          {booking && (
            <div className="mt-6">
              <BookingPayPalButton
                bookingId={booking.id}
                amount={displayPrice}
                onSuccess={handlePayPalSuccess}
                onError={handlePayPalError}
              />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense>
      <BookPageContent />
    </Suspense>
  );
}
