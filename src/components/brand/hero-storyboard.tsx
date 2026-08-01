'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { VerifiedBadge } from '@/components/brand';

/* ------------------------------------------------------------------ */
/*  Image URLs — real human photos of Fahad's journey                  */
/* ------------------------------------------------------------------ */

const STORIES = [
  {
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/9937761fcd03.jpg',
    kenBurns: 'story-ken-burns-in',
    overlay: 'from-black/80 via-black/50 to-black/70',
    labelKey: 'storyBeforeLabel',
    quoteKey: 'storyBeforeQuote',
    accent: 'text-red-400/80',
    icon: '😰',
  },
  {
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/406f1795a077.jpg',
    kenBurns: 'story-ken-burns-pan',
    overlay: 'from-black/70 via-black/40 to-gold/10',
    labelKey: 'storyPracticeLabel',
    quoteKey: 'storyPracticeQuote',
    accent: 'text-gold',
    icon: '💻',
  },
  {
    image: 'https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/da1c6402e01d.jpg',
    kenBurns: 'story-ken-burns-in',
    overlay: 'from-black/60 via-emerald/10 to-transparent',
    labelKey: 'storyAfterLabel',
    quoteKey: 'storyAfterQuote',
    accent: 'text-emerald',
    icon: '🏆',
    showScore: true,
  },
] as const;

const SLIDE_DURATION = 5000; // ms per slide
const TOTAL_SLIDES = STORIES.length;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function HeroStoryboard() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isArabic = isRTL;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [scoreVisible, setScoreVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const touchStartX = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      const idx = ((next % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES;
      setActive(idx);
      setProgressKey((k) => k + 1);
      setScoreVisible(false);
    },
    [],
  );

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  /* Auto-advance */
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [active, paused, next]);

  /* Score reveal on last slide */
  useEffect(() => {
    if (active === 2) {
      const t2 = setTimeout(() => setScoreVisible(true), 600);
      return () => clearTimeout(t2);
    }
  }, [active]);

  /* Touch/swipe handling */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      // RTL: swipe directions are flipped
      if (isRTL ? dx < 0 : dx > 0) prev();
      else next();
    }
  };

  const story = STORIES[active];

  return (
    <div
      className="story-pulse-glow relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 sm:max-w-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label="Fahad's journey"
      aria-roledescription="carousel"
    >
      {/* ── Progress bar (Stories style) ── */}
      <div className="absolute inset-x-0 top-0 z-30 flex gap-1.5 px-3 pt-3">
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
              style={
                i === active && paused
                  ? { width: `${((Date.now() % SLIDE_DURATION) / SLIDE_DURATION) * 100}%` }
                  : undefined
              }
            />
          </div>
        ))}
      </div>

      {/* ── Shimmer border overlay ── */}
      <div className="story-shimmer-border pointer-events-none absolute inset-0 z-20 rounded-2xl" />

      {/* ── Image with Ken Burns ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          <img
            src={story.image}
            alt=""
            className={`${story.kenBurns} h-full w-full object-cover object-top`}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>

      {/* ── Dark overlay ── */}
      <div
        className={`absolute inset-0 z-10 bg-gradient-to-t ${story.overlay}`}
      />
      {/* Bottom extra gradient for text readability */}
      <div className="absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* ── Content ── */}
      <div className="relative z-20 flex h-full min-h-[320px] flex-col justify-between p-5 sm:min-h-[360px]">
        {/* Top: label + character badge */}
        <div className={`flex items-center gap-2.5 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-gold/50 bg-void/80 backdrop-blur-sm">
            <span className="text-base">{story.icon}</span>
          </div>
          <div className={`flex flex-col ${isRTL ? 'items-end' : 'items-start'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${story.accent}`}>
              {t(story.labelKey)}
            </span>
            <span className="text-xs text-white/50">
              {t('storyCharacterName')}
            </span>
          </div>
        </div>

        {/* Bottom: quote + score */}
        <div className={`flex flex-col gap-3 ${isRTL ? 'items-end text-right' : 'items-start text-left'}`}>
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="max-w-[85%] text-lg font-bold leading-snug text-white drop-shadow-lg sm:text-xl"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              &ldquo;{t(story.quoteKey)}&rdquo;
            </motion.p>
          </AnimatePresence>

          {/* Score reveal on After slide */}
          {story.showScore && (
            <motion.div
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={scoreVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <div className="story-score-pop flex flex-col">
                <span className={`text-3xl font-extrabold ${isArabic ? 'font-tajawal' : ''}`}>
                  {isArabic ? '٩١' : '91'}
                  <span className="text-sm font-semibold text-white/40">
                    /{isArabic ? '١٠٠' : '100'}
                  </span>
                </span>
              </div>
              <div className="scale-[0.6] origin-top">
                <VerifiedBadge size="sm" />
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom nav dots (mobile-friendly) */}
        <div className="flex justify-center gap-2 pt-2">
          {STORIES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === active
                  ? 'w-6 bg-gold'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
