'use client';

import { useState, useEffect, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Video, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
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
  currentTitle: string;
  currentTitleAr: string;
  priceTier: string;
  rating: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getPriceFromTier(tier: string): number {
  switch (tier) {
    case 'ELITE':
      return 99;
    case 'PREMIUM':
      return 49;
    default:
      return 29;
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

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

function BookPageContent() {
  const t = useTranslations('booking');
  const tc = useTranslations('common');
  const locale = useLocale();
  const params = useParams();
  const searchParams = useSearchParams();

  const interviewerId = params.interviewerId as string;
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';

  /* ── State ── */
  const [interviewer, setInterviewer] = useState<InterviewerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  const price = interviewer ? getPriceFromTier(interviewer.priceTier) : 0;

  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  /* ── Handlers ── */
  const handlePay = () => {
    if (!termsAccepted) return;
    setProcessing(true);
    // Simulate PayPal — redirect to confirmation
    const randomId = Math.random().toString(36).substring(2, 10);
    window.location.href =
      `/${locale}/booking/confirmation?interviewerId=${interviewerId}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&meetingId=${randomId}`;
  };

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
                    {formatDate(date, locale)} · {formatTime(time, locale)}
                  </p>
                </div>

                {/* Duration */}
                <div>
                  <p className="text-sm text-gray-400">{t('duration')}</p>
                  <p className="mt-1 text-white">
                    30 {t('minutes')}
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
                  <span className="text-sm text-gray-400">Price</span>
                  <span className="text-2xl font-bold text-[var(--gold)]">
                    ${price}
                  </span>
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-gray-500">
                Interviewer not found
              </p>
            )}
          </div>

          {/* Note textarea */}
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

          {/* Pay button */}
          <button
            onClick={handlePay}
            disabled={!termsAccepted || processing || !date || !time || !interviewer}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--gold)] py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-[var(--gold)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing && <Loader2 size={16} className="animate-spin" />}
            {t('payAndBook')}
          </button>
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