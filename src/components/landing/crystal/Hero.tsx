'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { HeroPassportPreview } from './HeroPassportPreview';
import { JeannieNameLockup } from './JeannieNameLockup';
import {
  MENA_JEANNIE_FRAMES,
  prefetchNextImage,
} from './mena-hero-frames';
import { easeCrystal, fadeUp, stagger } from './motion';

const HERO_SCORE = 86;
const HERO_GRADE = 'A';

export function CrystalHero() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [carouselReady, setCarouselReady] = useState(false);

  // Defer carousel so LCP stays on Dubai (frame 0); skip when reduced motion.
  useEffect(() => {
    if (reduceMotion) return;
    const warm = window.setTimeout(() => setCarouselReady(true), 2800);
    return () => window.clearTimeout(warm);
  }, [reduceMotion]);

  useEffect(() => {
    if (!carouselReady || reduceMotion) return;
    const id = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % MENA_JEANNIE_FRAMES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [carouselReady, reduceMotion]);

  // Prefetch only the upcoming city after idle — keeps LCP on Dubai.
  useEffect(() => {
    if (!carouselReady || reduceMotion) return;
    prefetchNextImage(
      MENA_JEANNIE_FRAMES[(frame + 1) % MENA_JEANNIE_FRAMES.length].src,
    );
  }, [carouselReady, reduceMotion, frame]);

  const current = MENA_JEANNIE_FRAMES[frame];
  const cityLabel = isAr ? current.cityAr : current.cityEn;

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduceMotion ? false : { scale: 1.12, opacity: 0.55 }}
        animate={{ scale: 1.04, opacity: 1 }}
        transition={{ duration: 1.6, ease: easeCrystal }}
      >
        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.06, 1], x: [0, 12, 0], y: [0, -8, 0] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={current.src}
              className="absolute inset-0"
              initial={frame === 0 ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            >
              <Image
                src={current.src}
                alt={isAr ? current.altAr : current.altEn}
                fill
                priority={frame === 0}
                fetchPriority={frame === 0 ? 'high' : 'auto'}
                className="object-cover mq-hero-face"
                style={{ objectPosition: current.objectPosition }}
                sizes="100vw"
                quality={70}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="mq-hero-shade absolute inset-0" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {!reduceMotion ? (
          <>
            <motion.div
              className="absolute -start-10 top-[18%] h-56 w-56 rounded-full bg-teal-400/15 blur-3xl"
              animate={{ y: [0, -24, 0], opacity: [0.25, 0.55, 0.25] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -end-8 top-[40%] h-64 w-64 rounded-full bg-amber-300/10 blur-3xl"
              animate={{ y: [0, 28, 0], opacity: [0.2, 0.45, 0.2] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent"
              animate={{ opacity: [0.15, 0.7, 0.15], scaleX: [0.6, 1, 0.6] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        ) : null}
      </div>

      {/* Desktop / tablet — animated passport preview (kept off Jeannie's face) */}
      <div className="mq-hero-score-anchor">
        <AnimatePresence mode="sync">
          <motion.div
            key={current.id}
            className="w-full"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: easeCrystal }}
          >
            <HeroPassportPreview
              locale={locale}
              cityEn={current.cityEn}
              cityAr={current.cityAr}
              score={HERO_SCORE}
              grade={HERO_GRADE}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mq-wrap relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-white"
        >
          <motion.div variants={fadeUp} className="mb-5">
            <motion.div
              className="mq-logo-glow relative inline-flex"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.35)_0%,transparent_68%)]"
                animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.92, 1.08, 0.92] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="relative inline-flex">
                <BrandLogo size="hero" priority className="drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mq-kicker mb-3 text-teal-200/90"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={current.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className="inline-block"
              >
                {isAr ? `جيني · ${cityLabel}` : `Jeannie · ${cityLabel}`}
              </motion.span>
            </AnimatePresence>
          </motion.p>

          <motion.div variants={fadeUp} className="mb-3">
            <JeannieNameLockup size="lg" />
          </motion.div>

          <motion.div variants={fadeUp}>
            <T
              as="h1"
              bi={C.hero.headline}
              className="mq-display mb-5 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <T
              as="p"
              bi={C.hero.sub}
              className="mb-6 max-w-xl text-base leading-relaxed text-white/80 md:mb-8 md:text-lg"
            />
          </motion.div>

          {/* Mobile passport — in content flow so it never covers Jeannie's face */}
          <motion.div variants={fadeUp} className="mq-hero-score-inline mb-7 md:hidden">
            <HeroPassportPreview
              locale={locale}
              cityEn={current.cityEn}
              cityAr={current.cityAr}
              score={HERO_SCORE}
              grade={HERO_GRADE}
              compact
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localePath('/interview/prep', locale)}
                className="mq-btn mq-btn-on-dark mq-btn-shimmer"
              >
                <BiInline bi={C.hero.ctaInterview} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href={localePath('/jobs', locale)} className="mq-btn mq-btn-on-dark-ghost">
                <BiInline bi={C.hero.ctaJeannie} />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="mq-shine-line pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-px w-40"
        initial={{ opacity: 0, scaleX: 0.4 }}
        animate={{ opacity: [0.3, 0.9, 0.3], scaleX: [0.7, 1, 0.7] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--mq-paper)] to-transparent" />
    </section>
  );
}
