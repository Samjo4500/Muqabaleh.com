'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { MuqabalehScoreBadge, type ScoreBadgeStatus } from '@/components/brand/muqabaleh-score-badge';
import { BrandLogo } from './BrandLogo';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { JeannieNameLockup } from './JeannieNameLockup';
import { easeCrystal, fadeUp, stagger } from './motion';

const HERO_SCORE = 86;

const HERO_FRAMES: {
  src: string;
  altEn: string;
  altAr: string;
  objectPosition: string;
  badgeStatus: ScoreBadgeStatus;
}[] = [
  {
    src: '/images/hero-interview.webp',
    altEn: 'Jeannie — Muqabaleh career agent ready to interview you',
    altAr: 'جيني — وكيلة مقابلة المهنية مستعدة لإجراء مقابلتك',
    objectPosition: 'center 18%',
    badgeStatus: 'interview',
  },
  {
    src: '/images/hero-interview-meeting.webp',
    altEn: 'Jeannie conducting a live bilingual interview on Muqabaleh',
    altAr: 'جيني تُجري مقابلة ثنائية اللغة مباشرة عبر مقابلة',
    objectPosition: 'center 20%',
    badgeStatus: 'scored',
  },
  {
    src: '/images/hero-interview-hired.webp',
    altEn: 'Candidate hired after Jeannie helped land the interview',
    altAr: 'مرشّحة تُقبل بعد أن ساعدتها جيني في الوصول للمقابلة',
    objectPosition: 'center 22%',
    badgeStatus: 'hired',
  },
];

export function CrystalHero() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFrame((prev) => (prev + 1) % HERO_FRAMES.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  const current = HERO_FRAMES[frame];

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12, opacity: 0.55 }}
        animate={{ scale: 1.04, opacity: 1 }}
        transition={{ duration: 1.6, ease: easeCrystal }}
      >
        <motion.div
          className="absolute inset-0"
          animate={{ scale: [1, 1.06, 1], x: [0, 12, 0], y: [0, -8, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={current.src}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            >
              <Image
                src={current.src}
                alt={isAr ? current.altAr : current.altEn}
                fill
                priority={frame === 0}
                className="object-cover mq-hero-face"
                style={{ objectPosition: current.objectPosition }}
                sizes="100vw"
                quality={72}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        <div className="mq-hero-shade absolute inset-0" />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
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
      </div>

      {/* Desktop / tablet floating score — kept off the face */}
      <div className="mq-hero-score-anchor" aria-hidden={false}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current.badgeStatus}
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.45, ease: easeCrystal }}
          >
            <MuqabalehScoreBadge
              score={HERO_SCORE}
              status={current.badgeStatus}
              locale={locale}
              size="lg"
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
            <BiInline bi={C.hero.eyebrow} />
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

          {/* Mobile score — in content flow so it never covers Jeannie's face */}
          <motion.div variants={fadeUp} className="mq-hero-score-inline mb-7 md:hidden">
            <MuqabalehScoreBadge
              score={HERO_SCORE}
              status={current.badgeStatus}
              locale={locale}
              size="md"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localePath('/interview/prequal', locale)}
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
