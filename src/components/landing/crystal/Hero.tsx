'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

export function CrystalHero() {
  const locale = useLocale();

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background with continuous slow motion */}
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
          <Image
            src="/images/hero-interview.png"
            alt=""
            fill
            priority
            className="object-cover object-[center_20%]"
            sizes="100vw"
          />
        </motion.div>
        <div className="mq-hero-shade absolute inset-0" />
      </motion.div>

      {/* Atmospheric motion — soft orbs, not overlay cards */}
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

      <div className="mq-wrap relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-white"
        >
          {/* Brand logo — hero-level signal */}
          <motion.div variants={fadeUp} className="mb-6">
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
              <BrandLogo size="hero" priority className="relative drop-shadow-[0_12px_40px_rgba(45,212,191,0.35)]" />
            </motion.div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <T
              as="h1"
              bi={C.hero.headline}
              className="mq-display mb-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <T
              as="p"
              bi={C.hero.sub}
              className="mb-9 max-w-xl text-base leading-relaxed text-white/80 md:text-lg"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href={localePath('/demo', locale)} className="mq-btn mq-btn-on-dark mq-btn-shimmer">
                <BiInline bi={C.hero.ctaInterview} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href={localePath('/jobs', locale)} className="mq-btn mq-btn-on-dark-ghost">
                <BiInline bi={C.hero.ctaJobs} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link href={localePath('/business', locale)} className="mq-btn mq-btn-on-dark-ghost">
                <BiInline bi={C.hero.ctaHr} />
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
