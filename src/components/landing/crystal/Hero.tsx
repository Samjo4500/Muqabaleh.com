'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

export function CrystalHero() {
  const locale = useLocale();

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.08, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: easeCrystal }}
      >
        <Image
          src="/images/hero-interview.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_20%]"
          sizes="100vw"
        />
        <div className="mq-hero-shade absolute inset-0" />
      </motion.div>

      <div className="mq-wrap relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="max-w-3xl text-white"
        >
          <motion.p
            variants={fadeUp}
            className="mq-display mb-5 text-2xl font-bold tracking-tight text-teal-200 md:text-3xl"
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
            <Link href={localePath('/demo', locale)} className="mq-btn mq-btn-on-dark">
              <BiInline bi={C.hero.ctaInterview} />
            </Link>
            <Link href={localePath('/jobs', locale)} className="mq-btn mq-btn-on-dark-ghost">
              <BiInline bi={C.hero.ctaJobs} />
            </Link>
            <Link href={localePath('/business', locale)} className="mq-btn mq-btn-on-dark-ghost">
              <BiInline bi={C.hero.ctaHr} />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="mq-shine-line pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-px w-40"
        initial={{ opacity: 0, scaleX: 0.4 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.8, duration: 0.9, ease: easeCrystal }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[var(--mq-paper)] to-transparent" />
    </section>
  );
}
