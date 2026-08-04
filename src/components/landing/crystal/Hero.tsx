'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { easeCrystal } from './motion';

function AuroraBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-[var(--aurora-1)]/40 blur-[100px] will-change-transform"
        animate={{ x: [0, 40, -20, 0], y: [0, 30, -10, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[var(--aurora-2)]/35 blur-[110px] will-change-transform"
        animate={{ x: [0, -50, 20, 0], y: [0, -25, 35, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-[var(--aurora-3)]/30 blur-[100px] will-change-transform"
        animate={{ x: [0, 30, -40, 0], y: [0, -40, 10, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-8 w-8 rotate-45 border border-white/[0.04] bg-white/[0.02] will-change-transform"
          style={{ left: `${10 + i * 11}%`, bottom: `${8 + (i % 3) * 12}%`, opacity: 0.04 }}
          animate={{ y: [0, -80 - i * 8], opacity: [0, 0.04, 0] }}
          transition={{ duration: 10 + i, repeat: Infinity, delay: i * 0.6, ease: 'linear' }}
        />
      ))}
    </div>
  );
}

export function CrystalHero() {
  const t = useTranslations('crystal');
  const words = t('heroH1').split(' ');

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 pb-16 pt-28 md:px-8">
      <AuroraBlobs />
      <motion.div
        className="glass-strong relative z-10 w-full max-w-[920px] rounded-3xl px-6 py-10 text-center md:px-12 md:py-14"
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ delay: 0.2, duration: 0.6, ease: easeCrystal }}
      >
        <p className="font-display relative z-10 mb-4 text-sm font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-base">
          {t('brand')}
        </p>
        <h1 className="font-display relative z-10 text-[40px] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--text-primary)] md:text-[48px] md:leading-[56px] lg:text-[64px] lg:leading-[72px]">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="me-2 inline-block last:me-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: easeCrystal }}
            >
              {word}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="relative z-10 mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)] md:text-lg md:leading-7"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4, ease: easeCrystal }}
        >
          {t('heroSub')}
        </motion.p>
        <motion.div
          className="relative z-10 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.4, ease: easeCrystal }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(99,102,241,0.15)',
                '0 0 36px rgba(6,182,212,0.35)',
                '0 0 20px rgba(99,102,241,0.15)',
              ],
            }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="rounded-[0.875rem]"
          >
            <Link href="/assessment" className="glass-button gradient-text inline-flex w-full justify-center sm:w-auto">
              {t('heroCtaPrimary')}
            </Link>
          </motion.div>
          <Link href="#companies" className="btn-ghost-crystal inline-flex w-full justify-center sm:w-auto">
            {t('heroCtaSecondary')}
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
