'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Review = {
  id: string;
  candidate: string;
  specialty: string;
  date: string;
  rating: number;
  comment: string;
  reply?: string;
};

type RatingBreakdown = {
  stars: number;
  count: number;
};

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const ratingBreakdown: RatingBreakdown[] = [
  { stars: 5, count: 89 },
  { stars: 4, count: 28 },
  { stars: 3, count: 7 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

const totalReviews = ratingBreakdown.reduce((sum, r) => sum + r.count, 0);

const mockReviews: Review[] = [
  {
    id: 'r1',
    candidate: 'مرشح · مبيعات',
    date: '2025-07-28',
    rating: 5,
    comment: 'مقابلة ممتازة جداً، المحاور كان محترف جداً وطرح أسئلة عملية وتحديات حقيقية من سوق العمل. ساعدني كثيراً في تحضيري للمقابلة الفعلية.',
    reply: 'شكراً جزيلاً! سعيدة أن المقابلة كانت مفيدة. بالتوفيق في مقابلتك القادمة.',
  },
  {
    id: 'r2',
    candidate: 'مرشح · هندسة برمجيات',
    date: '2025-07-25',
    rating: 5,
    comment: 'تجربة رائعة! الأسئلة كانت شاملة وتغطي مجالات مختلفة. التقييم المفصل ساعدني أتعرف على نقاط الضعف.',
  },
  {
    id: 'r3',
    candidate: 'مرشح · تصميم UI/UX',
    date: '2025-07-22',
    rating: 4,
    comment: 'جلسة مفيدة جداً. المحاور كان متفهم وصبور. أتمنى لو كان الوقت أطول شوية.',
    reply: 'شكراً لتقييمك! الوقت القياسي ٣٠ دقيقة، لكن يمكنك حجز جلسة إضافية إذا أحببت.',
  },
  {
    id: 'r4',
    candidate: 'مرشح · علوم البيانات',
    date: '2025-07-20',
    rating: 5,
    comment: 'من أفضل التجارب اللي مرت علي. التغذية الراجعة كانت مفصلة ومباشرة. أنصح به بقوة.',
  },
  {
    id: 'r5',
    candidate: 'مرشح · إدارة مشاريع',
    date: '2025-07-18',
    rating: 4,
    comment: 'المقابلة كانت جيدة لكن الأنترنت انقطع شوي في النص. بشكل عام تجربة إيجابية.',
  },
  {
    id: 'r6',
    candidate: 'مرشح · تطوير Flutter',
    date: '2025-07-15',
    rating: 5,
    comment: 'محاور خبير فعلاً في المجال. أسئلة تقنية عميقة وتحديات عملية من مشاريع حقيقية.',
  },
  {
    id: 'r7',
    candidate: 'مرشح · تسويق رقمي',
    date: '2025-07-12',
    rating: 3,
    comment: 'المحتوى كان جيد لكن الأسئلة كانت عامة شوية. أتمنى تكون أكثر تحديداً في التخصص.',
  },
  {
    id: 'r8',
    candidate: 'مرشح · أمن معلومات',
    date: '2025-07-10',
    rating: 5,
    comment: 'أفضل محاكاة مقابلة جربتها. المحاور كان يعرف كل التفاصيل عن أمن المعلومات وساعدني أتحضر بشكل أفضل بكثير.',
    reply: 'شكراً لك! أتمنى لك التوفيق في مشوارك المهني.',
  },
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const headerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1, duration: 0.45, ease: 'easeOut' },
  },
};

const breakdownVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.3, duration: 0.45, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

/* ------------------------------------------------------------------ */
/*  Star visual                                                        */
/* ------------------------------------------------------------------ */

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rating ? 'currentColor' : 'none'}
          className={star <= rating ? 'text-gold' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReviewsPage() {
  const t = useTranslations('interviewerDash');
  const locale = useLocale();
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  function toggleReply(id: string) {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gold md:text-3xl">
        {t('reviews')}
      </h1>

      {/* Header: Big average rating */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#0B0F17] border border-[rgba(212,175,55,0.1)] rounded-xl p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:gap-10">
          {/* Left: Big number */}
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <p className="text-6xl font-bold text-gold">4.8</p>
            <div className="mt-2">
              <StarRating rating={5} size={20} />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {locale === 'ar'
                ? `بناءً على ${totalReviews} تقييم`
                : `Based on ${totalReviews} reviews`}
            </p>
          </div>

          {/* Right: Breakdown bars */}
          <div className="flex-1 w-full max-w-md space-y-2.5">
            {ratingBreakdown.map((row) => {
              const percent = (row.count / totalReviews) * 100;
              return (
                <div key={row.stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="text-sm text-[var(--text-muted)]">{row.stars}</span>
                    <Star size={12} fill="currentColor" className="text-gold" />
                  </div>
                  {/* Bar */}
                  <div className="flex-1 h-2.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gold/70 transition-all duration-700"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {/* Count */}
                  <span className="text-xs text-[var(--text-muted)] w-8 text-right">
                    {row.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Rating breakdown */}
      <motion.div
        variants={breakdownVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {ratingBreakdown.map((row) => {
          const percent = ((row.count / totalReviews) * 100).toFixed(1);
          return (
            <div
              key={row.stars}
              className="bg-[#0B0F17] border border-white/[0.06] rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-bold text-gold">{row.count}</p>
              <div className="flex items-center justify-center gap-0.5 mt-1">
                <Star size={14} fill="currentColor" className="text-gold" />
                <span className="text-xs text-[var(--text-muted)]">{row.stars}</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">{percent}%</p>
            </div>
          );
        })}
      </motion.div>

      {/* Review cards */}
      <div className="space-y-4 mt-8">
        {mockReviews.map((review, i) => (
          <motion.div
            key={review.id}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-[#0B0F17] border border-white/[0.06] rounded-xl p-5"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <p className="font-semibold text-white text-sm">{review.candidate}</p>
                <p className="text-xs text-[var(--text-muted)] font-mono">{review.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} size={14} />
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] px-3 py-1 text-xs text-[var(--text-muted)] transition-colors hover:bg-white/5 cursor-pointer"
                >
                  <MessageSquare size={12} />
                  {locale === 'ar' ? 'رد' : 'Reply'}
                </button>
              </div>
            </div>

            {/* Comment */}
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">{review.comment}</p>

            {/* Reply section */}
            {review.reply && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => toggleReply(review.id)}
                  className="inline-flex items-center gap-1 text-xs text-gold/70 hover:text-gold transition-colors cursor-pointer"
                >
                  {expandedReplies.has(review.id) ? (
                    <ChevronUp size={14} />
                  ) : (
                    <ChevronDown size={14} />
                  )}
                  {locale === 'ar'
                    ? `${expandedReplies.has(review.id) ? 'إخفاء' : 'عرض'} الرد`
                    : `${expandedReplies.has(review.id) ? 'Hide' : 'Show'} reply`}
                </button>

                {expandedReplies.has(review.id) && (
                  <div className="mt-2 bg-gray-800/50 rounded-lg p-3 border-s-2 border-gold/20">
                    <p className="text-xs text-gold/70 mb-1">
                      {locale === 'ar' ? 'ردك:' : 'Your reply:'}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">{review.reply}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
