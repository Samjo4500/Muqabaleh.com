'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import {
  MENA_JOBS_SKYLINES,
  prefetchNextImage,
} from '@/components/landing/crystal/mena-hero-frames';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';

type Props = {
  roleCount: number;
};

/**
 * Full-bleed jobs hero — brand-first, one composition for social-ad landings.
 * MENA skyline carousel (Dubai → Riyadh → Amman → Doha) starts after idle
 * so LCP stays on the first optimized frame.
 */
export function JobsHero({ roleCount }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [frame, setFrame] = useState(0);
  const [carouselReady, setCarouselReady] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const warm = window.setTimeout(() => setCarouselReady(true), 2800);
    return () => window.clearTimeout(warm);
  }, [reduceMotion]);

  useEffect(() => {
    if (!carouselReady || reduceMotion) return;
    const id = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % MENA_JOBS_SKYLINES.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, [carouselReady, reduceMotion]);

  useEffect(() => {
    if (!carouselReady || reduceMotion) return;
    prefetchNextImage(
      MENA_JOBS_SKYLINES[(frame + 1) % MENA_JOBS_SKYLINES.length].src,
    );
  }, [carouselReady, reduceMotion, frame]);

  const current = MENA_JOBS_SKYLINES[frame];

  const subAr =
    roleCount > 0
      ? `أكثر من ${roleCount} وظيفة حقيقية في الخليج وشمال أفريقيا والشام. يظهر الراتب إن أعلنه صاحب العمل، وتتدرّب مع جيني قبل أن تقدّم بنفسك لدى الشركة.`
      : 'وظائف حقيقية في الخليج وشمال أفريقيا والشام. يظهر الراتب إن أعلنه صاحب العمل، وتتدرّب مع جيني قبل أن تقدّم بنفسك لدى الشركة.';

  const subEn =
    roleCount > 0
      ? `${roleCount}+ live openings across MENA — we surface salary when employers publish it, you practice with Jeannie, then apply on their site.`
      : 'Live openings across MENA — we surface salary when employers publish it, you practice with Jeannie, then apply on their site.';

  return (
    <section className="relative min-h-[92svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1, opacity: 0.5 }}
        animate={{ scale: 1.03, opacity: 1 }}
        transition={{ duration: 1.5, ease: easeCrystal }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.05, 1], y: [0, -10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={current.src}
              className="absolute inset-0"
              initial={frame === 0 ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.35, ease: 'easeInOut' }}
            >
              <Image
                src={current.src}
                alt={isAr ? current.altAr : current.altEn}
                fill
                priority={frame === 0}
                fetchPriority={frame === 0 ? 'high' : 'auto'}
                sizes="100vw"
                quality={68}
                className="object-cover object-[center_35%]"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(105deg, rgba(5,8,15,0.92) 0%, rgba(5,8,15,0.62) 46%, rgba(5,8,15,0.35) 100%), linear-gradient(180deg, rgba(5,8,15,0.2) 0%, rgba(5,8,15,0.78) 100%)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.06) 0.6px, transparent 0.6px)',
            backgroundSize: '3px 3px',
          }}
          aria-hidden
        />
      </motion.div>

      <div className="mq-wrap relative flex min-h-[92svh] flex-col justify-end pb-14 pt-28 md:pb-20 md:pt-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={fadeUp} className="mb-8">
            <BrandLogo size="hero" priority />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-teal-300/90"
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
                {isAr
                  ? `${current.cityAr} · الخليج والشام`
                  : `${current.cityEn} · MENA`}
              </motion.span>
            </AnimatePresence>
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mq-display text-[clamp(2.4rem,7vw,4.6rem)] font-bold leading-[0.98] tracking-tight text-white"
          >
            {isAr ? (
              <>
                وظائف من المنطقة.
                <br />
                <span className="text-teal-300">استعد… ثم قدّم.</span>
              </>
            ) : (
              <>
                MENA roles.
                <br />
                <span className="text-teal-300">Practice. Then apply.</span>
              </>
            )}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-xl text-base leading-relaxed text-white/70 md:text-lg"
          >
            {isAr ? subAr : subEn}
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <a
              href="#roles"
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[52px] items-center justify-center px-7 text-sm font-bold"
            >
              {isAr ? 'استعرض الوظائف' : 'Browse roles'}
            </a>
            <Link
              href={localePath('/interview/prequal', locale)}
              className="mq-btn mq-btn-on-dark-ghost inline-flex min-h-[52px] items-center justify-center px-7 text-sm font-bold"
            >
              {isAr ? 'تدرّب مع جيني' : 'Practice with Jeannie'}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05080f] to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        aria-hidden
      />
    </section>
  );
}
