'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { VerifiedBadge } from '@/components/brand';

/* ------------------------------------------------------------------ */
/*  Slides — local AI-generated images, dark cinematic theme            */
/* ------------------------------------------------------------------ */

const STORIES = [
  {
    image: '/images/story-before.webp',
    altKey: 'storyBeforeAlt',
    kenBurns: 'story-ken-burns-in',
    gradient: 'from-black/90 via-black/60 to-black/80',
    accentColor: 'rgba(248,113,113,0.8)',
    labelKey: 'storyBeforeLabel',
    quoteKey: 'storyBeforeQuote',
    showScore: false,
  },
  {
    image: '/images/story-practice.webp',
    altKey: 'storyPracticeAlt',
    kenBurns: 'story-ken-burns-pan',
    gradient: 'from-black/85 via-black/50 to-gold/5',
    accentColor: 'var(--gold)',
    labelKey: 'storyPracticeLabel',
    quoteKey: 'storyPracticeQuote',
    showScore: false,
  },
  {
    image: '/images/story-after.webp',
    altKey: 'storyAfterAlt',
    kenBurns: 'story-ken-burns-in',
    gradient: 'from-black/80 via-black/40 to-emerald/5',
    accentColor: 'var(--emerald)',
    labelKey: 'storyAfterLabel',
    quoteKey: 'storyAfterQuote',
    showScore: true,
  },
] as const;

const SLIDE_DURATION = 5000;
const TOTAL = STORIES.length;

/* ------------------------------------------------------------------ */
/*  Full-screen hero storyboard                                         */
/* ------------------------------------------------------------------ */

export function HeroStoryboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations('landing');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [scoreVisible, setScoreVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (n: number) => {
      const idx = ((n % TOTAL) + TOTAL) % TOTAL;
      setActive(idx);
      setProgressKey((k) => k + 1);
      setScoreVisible(false);
    },
    [],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, paused, next]);

  useEffect(() => {
    if (active === 2) {
      const id = setTimeout(() => setScoreVisible(true), 600);
      return () => clearTimeout(id);
    }
  }, [active]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (isRTL) { if (dx < 0) prev(); else next(); } else { if (dx > 0) prev(); else next(); }
    }
  };

  const story = STORIES[active];

  return (
    <div
      className="relative min-h-[85vh] w-full overflow-hidden md:min-h-screen"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      role="region"
      aria-label="Fahad's journey"
      aria-roledescription="carousel"
    >
      {/* ── Full-bleed background images ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
          className={`absolute inset-0 ${story.kenBurns}`}
        >
          <Image
            src={story.image}
            alt={t(story.altKey)}
            fill
            className="object-cover object-center"
            priority={active === 0}
            sizes="100vw"
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Dark gradient overlays for text readability ── */}
      <div className={`absolute inset-0 z-10 bg-gradient-to-t ${story.gradient}`} />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
      <div className="absolute inset-x-0 bottom-0 z-10 h-1/3 bg-gradient-to-t from-[var(--bg-void)] to-transparent" />

      {/* ── Stories progress bar (top) ── */}
      <div className="absolute inset-x-0 top-0 z-40 flex items-center gap-1.5 px-4 pt-20 md:px-8 md:pt-24">
        {STORIES.map((_, i) => (
          <div
            key={i}
            className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15"
          >
            <div
              key={progressKey + i}
              className={`h-full rounded-full ${
                i < active
                  ? 'bg-gold'
                  : i === active && !paused
                    ? 'bg-gold story-progress-fill'
                    : 'bg-transparent'
              }`}
            />
          </div>
        ))}
      </div>

      {/* ── All content: navbar space + hero text + CTA + story quote ── */}
      <div className="relative z-20 flex min-h-[85vh] flex-col md:min-h-screen">
        {children}

        {/* ── Story quote at bottom ── */}
        <div className="mt-auto px-4 pb-8 md:px-8 md:pb-12">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
                transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                className={`flex flex-col gap-3 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}
              >
                {/* Label pill */}
                <span
                  className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
                  style={{
                    borderColor: story.accentColor,
                    color: story.accentColor,
                    background: `${story.accentColor}10`,
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: story.accentColor }} />
                  {t(story.labelKey)}
                </span>

                {/* Quote */}
                <p
                  className="max-w-xl text-xl font-bold leading-relaxed text-white/90 drop-shadow-2xl md:text-2xl lg:text-3xl"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  &ldquo;{t(story.quoteKey)}&rdquo;
                </p>

                {/* Score reveal on After slide */}
                {story.showScore && (
                  <motion.div
                    initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                    animate={scoreVisible ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                    className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="story-score-pop text-4xl font-extrabold text-emerald md:text-5xl">
                      {isRTL ? '٩١' : '91'}
                      <span className="text-lg font-semibold text-white/30">
                        /{isRTL ? '١٠٠' : '100'}
                      </span>
                    </span>
                    <div className="scale-75 origin-left md:scale-100">
                      <VerifiedBadge size="sm" />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="mt-6 flex gap-2">
              {STORIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-8 bg-gold'
                      : 'w-2 bg-white/20 hover:bg-white/40'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
