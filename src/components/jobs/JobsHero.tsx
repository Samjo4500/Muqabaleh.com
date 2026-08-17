'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { FEATURED_JOBS } from '@/components/jobs/featured-jobs';
import { JobFlipCard } from '@/components/jobs/JobFlipCard';
import {
  MENA_JOBS_SKYLINES,
  prefetchNextImage,
} from '@/components/landing/crystal/mena-hero-frames';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { localePath } from '@/i18n/navigation';
import { jeanniePracticePath } from '@/lib/jobs/jeannie-practice';

type Props = {
  roleCount: number;
};

/**
 * Jobs hero — brand-first skyline + animated EN↔AR flip book (6 jobs)
 * and a marquee strip of featured roles.
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
      ? `أكثر من ${roleCount} وظيفة حقيقية. اقلب البطاقة عربي ⇄ English، تدرّب مع جيني، ثم قدّم بنفسك.`
      : 'وظائف حقيقية في المنطقة. اقلب البطاقة عربي ⇄ English، تدرّب مع جيني، ثم قدّم بنفسك.';

  const subEn =
    roleCount > 0
      ? `${roleCount}+ live MENA roles. Flip Arabic ⇄ English, practice with Jeannie, then apply yourself.`
      : 'Live MENA roles. Flip Arabic ⇄ English, practice with Jeannie, then apply yourself.';

  return (
    <section className="relative min-h-[92svh] overflow-hidden bg-[#05080f]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1, opacity: 0.5 }}
        animate={{ scale: 1.03, opacity: 1 }}
        transition={{ duration: 1.5, ease: easeCrystal }}
      >
        <motion.div
          className="absolute inset-0"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1, 1.05, 1], y: [0, -10, 0] }
          }
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
              'linear-gradient(105deg, rgba(5,8,15,0.92) 0%, rgba(5,8,15,0.68) 46%, rgba(5,8,15,0.45) 100%), linear-gradient(180deg, rgba(5,8,15,0.2) 0%, rgba(5,8,15,0.88) 100%)',
          }}
          aria-hidden
        />
      </motion.div>

      <div className="mq-wrap relative z-10 flex min-h-[92svh] flex-col justify-center pb-8 pt-28 md:pb-10 md:pt-32">
        <div
          className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-xl"
          >
            <motion.div variants={fadeUp} className="mb-7">
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
                    ? `${current.cityAr} · وظيفة اليوم`
                    : `${current.cityEn} · Job of the Day`}
                </motion.span>
              </AnimatePresence>
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mq-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[0.98] tracking-tight text-white"
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
              className="mt-5 max-w-md text-base leading-relaxed text-white/70 md:text-lg"
            >
              {isAr ? subAr : subEn}
            </motion.p>
            <motion.p variants={fadeUp} className="mt-3 text-sm text-teal-100/85">
              {isAr
                ? 'جرّب أول سؤال مقابلة لهذا الدور.'
                : 'Try your first interview question for this role.'}
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                href={localePath(jeanniePracticePath(), locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[52px] items-center justify-center px-7 text-sm font-bold"
              >
                {isAr ? 'تدرّب على هذا الدور مع جيني' : 'Practice this role with Jeannie'}
              </Link>
              <a
                href="#roles"
                className="mq-btn mq-btn-on-dark-ghost inline-flex min-h-[52px] items-center justify-center px-7 text-sm font-bold"
              >
                {isAr ? 'استعرض الوظائف' : 'Browse roles'}
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: easeCrystal }}
            className="flex justify-center lg:justify-end"
          >
            <JobFlipCard locale={locale} roleCount={roleCount} />
          </motion.div>
        </div>
      </div>

      {/* Featured jobs marquee strip */}
      <div className="relative z-10 border-t border-white/8 bg-black/45 py-3 backdrop-blur-md">
        <div className="overflow-hidden" dir="ltr">
          <div
            className={`flex w-max gap-10 whitespace-nowrap text-xs text-white/55 ${
              reduceMotion ? '' : 'crystal-marquee'
            }`}
          >
            {[...FEATURED_JOBS, ...FEATURED_JOBS].map((item, i) => (
              <span
                key={`${item.id}-${i}`}
                className="inline-flex items-center gap-2"
              >
                <span className="text-cyan-300/70">●</span>
                {isAr
                  ? `${item.titleAr} — ${item.company} — ${item.locationAr}`
                  : `${item.titleEn} — ${item.company} — ${item.locationEn}`}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
