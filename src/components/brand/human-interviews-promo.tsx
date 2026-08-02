'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Star, Users, Clock } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Interviewer Preview Cards Data                                    */
/* ------------------------------------------------------------------ */

const INTERVIEWER_PREVIEWS = [
  { initials: 'ف ر', name: 'فاطمة الراشد', flag: '🇸🇦', rating: '4.8', reviews: '127 تقييم', price: '$29' },
  { initials: 'م ع', name: 'محمد العتيبي', flag: '🇦🇪', rating: '4.9', reviews: '93 تقييم', price: '$35' },
  { initials: 'س أ', name: 'سارة الأحمد', flag: '🇪🇬', rating: '4.7', reviews: '158 تقييم', price: '$25' },
  { initials: 'ع خ', name: 'عبدالله الخالدي', flag: '🇶🇦', rating: '4.8', reviews: '112 تقييم', price: '$32' },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HumanInterviewsPromo() {
  const t = useTranslations('humanInterviews');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="w-full py-20"
      style={{
        background: 'linear-gradient(180deg, #0a1628 0%, #0f1d2e 100%)',
      }}
    >
      <motion.div
        className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Headline */}
        <h2
          className="text-4xl font-bold md:text-3xl"
          style={{ color: '#d4af37' }}
        >
          {t('promoHeadline')}
        </h2>

        {/* Subtext */}
        <p className="mt-4 max-w-[600px] text-lg text-white">
          {t('promoSubtext')}
        </p>

        {/* Stats Row */}
        <div className="mt-8 flex gap-8">
          <StatItem
            icon={<Users size={20} style={{ color: '#d4af37' }} />}
            number={t('statInterviewers')}
            label={t('statInterviewersLabel')}
          />
          <StatItem
            icon={<Star size={20} style={{ color: '#d4af37' }} />}
            number={t('statRating')}
            label={t('statRatingLabel')}
          />
          <StatItem
            icon={<Clock size={20} style={{ color: '#d4af37' }} />}
            number={t('statPrice')}
            label={t('statPriceLabel')}
          />
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/join-as-interviewer"
            className="rounded-lg px-8 py-3 text-center font-bold transition-all duration-300 hover:brightness-110"
            style={{
              background: '#d4af37',
              color: '#070A0F',
            }}
          >
            {t('becomeInterviewer')}
          </Link>
          <Link
            href="/human-interviews"
            className="rounded-lg px-8 py-3 text-center font-bold transition-all duration-300 hover:bg-[#d4af37]/10"
            style={{
              border: '1px solid #d4af37',
              color: '#d4af37',
            }}
          >
            {t('bookHuman')}
          </Link>
        </div>

        {/* Interviewer Preview Cards — Horizontal Scroll */}
        <div className="mt-10 flex w-full gap-4 overflow-x-auto pb-2">
          {INTERVIEWER_PREVIEWS.map((person, i) => (
            <div
              key={i}
              className="w-[280px] flex-shrink-0 rounded-xl border border-[rgba(212,175,55,0.2)] p-5 transition-all duration-300 hover:scale-[1.02] hover:border-[#d4af37]"
              style={{
                background: '#0B0F17',
              }}
            >
              {/* Avatar */}
              <div className="flex justify-center">
                <div
                  className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-2 text-2xl font-bold"
                  style={{
                    borderColor: '#d4af37',
                    color: '#d4af37',
                    background: 'rgba(212,175,55,0.08)',
                  }}
                >
                  {person.initials}
                </div>
              </div>

              {/* Name + Flag */}
              <div className="mt-3 text-center">
                <span className="text-sm font-bold text-white">
                  {person.name} {person.flag}
                </span>
              </div>

              {/* Rating */}
              <div
                className="mt-1 flex items-center justify-center gap-1 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <Star size={14} style={{ color: '#d4af37' }} />
                <span>
                  {person.rating} ({person.reviews})
                </span>
              </div>

              {/* Price Badge */}
              <div className="mt-3 flex justify-center">
                <span
                  className="rounded-full px-3 py-1 text-lg font-bold"
                  style={{
                    color: '#d4af37',
                    background: 'rgba(212,175,55,0.1)',
                  }}
                >
                  {person.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Item                                                          */
/* ------------------------------------------------------------------ */

function StatItem({
  icon,
  number,
  label,
}: {
  icon: React.ReactNode;
  number: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      {icon}
      <span className="mt-1 text-lg font-bold" style={{ color: '#d4af37' }}>
        {number}
      </span>
      <span className="text-base text-white">{label}</span>
    </div>
  );
}
