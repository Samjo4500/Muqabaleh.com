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

      {/* Floating glass shards */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="mq-hero-shard absolute start-[8%] top-[22%] h-28 w-28 rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl md:h-36 md:w-36"
          animate={{ y: [0, -18, 0], rotate: [-6, 4, -6], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="mq-hero-shard absolute end-[10%] top-[34%] h-20 w-20 rounded-2xl border border-teal-300/20 bg-teal-400/10 backdrop-blur-xl md:h-28 md:w-28"
          animate={{ y: [0, 22, 0], rotate: [8, -5, 8], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />
        <motion.div
          className="mq-hero-shard absolute bottom-[18%] start-[42%] h-16 w-40 rounded-full border border-white/10 bg-white/5 backdrop-blur-lg"
          animate={{ x: [0, 30, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
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

          <motion.p
            variants={fadeUp}
            className="mq-display mb-4 text-xl font-bold tracking-tight text-teal-200 md:text-2xl"
          >
            <BiInline bi={C.brand} />
          </motion.p>

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
