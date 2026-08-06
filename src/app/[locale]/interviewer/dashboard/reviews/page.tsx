'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Star, MessageSquare, Loader2 } from 'lucide-react';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  candidateName: string | null;
};

type Breakdown = { stars: number; count: number };

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          fill={star <= rating ? 'currentColor' : 'none'}
          className={star <= rating ? 'text-teal-300' : 'text-white/20'}
        />
      ))}
    </div>
  );
}

export default function InterviewerReviewsPage() {
  const t = useTranslations('interviewerDash');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [breakdown, setBreakdown] = useState<Breakdown[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/interviewer/reviews')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed');
        if (cancelled) return;
        setAverageRating(Number(data.averageRating) || 0);
        setTotalReviews(Number(data.totalReviews) || 0);
        setBreakdown(data.breakdown || []);
        setReviews(data.reviews || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        {isAr ? 'جارٍ التحميل…' : 'Loading…'}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </p>
    );
  }

  const maxCount = Math.max(1, ...breakdown.map((b) => b.count));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mq-display text-2xl font-bold text-teal-300 md:text-3xl">
          {t('reviews')}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {isAr
            ? 'تقييمات المرشحين الحقيقية لحجوزاتك المكتملة.'
            : 'Real candidate ratings from your completed bookings.'}
        </p>
      </div>

      {totalReviews === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
            <MessageSquare size={28} strokeWidth={1.75} />
          </div>
          <p className="text-base font-semibold text-white">
            {isAr ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
          </p>
          <p className="mt-2 max-w-md text-sm text-white/50">
            {isAr
              ? 'ستظهر هنا تقييمات المرشحين بعد إكمال الجلسات.'
              : 'Candidate reviews will appear here after sessions are completed.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-5xl font-bold text-teal-300">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </p>
              <div className="mt-2">
                <StarRow rating={Math.round(averageRating)} />
              </div>
              <p className="mt-2 text-xs text-white/45">
                {totalReviews} {isAr ? 'تقييم' : 'reviews'}
              </p>
            </div>
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              {breakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-8 text-white/50">{row.stars}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-teal-400/70 transition-all"
                      style={{ width: `${(row.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-end text-white/45">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          <ul className="space-y-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-white">
                    {review.candidateName || (isAr ? 'مرشح' : 'Candidate')}
                  </p>
                  <span className="text-xs text-white/40">
                    {new Date(review.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                  </span>
                </div>
                <div className="mt-2">
                  <StarRow rating={review.rating} />
                </div>
                {review.comment ? (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-white/65">{review.comment}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
