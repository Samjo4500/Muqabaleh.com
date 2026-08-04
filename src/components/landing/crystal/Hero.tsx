'use client';

import { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import Link from 'next/link';
import { Mic } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { easeCrystal } from './motion';

function ScoreRing({ value }: { value: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 88 88" className="h-full w-full -rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          fill="none"
          stroke="url(#heroScoreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ delay: 1.1, duration: 1.4, ease: easeCrystal }}
        />
        <defs>
          <linearGradient id="heroScoreGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-2xl font-bold gradient-text"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.3, duration: 0.5, ease: easeCrystal }}
      >
        {value}
      </motion.span>
    </div>
  );
}

function HeroInterviewDeck() {
  const t = useTranslations('landing.hero');
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 160, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 160, damping: 18 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia('(max-width: 1023px)').matches) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const bars = [42, 68, 55, 80, 63, 74, 58, 86];

  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none" style={{ perspective: 1200 }}>
      {/* Floating glass chips */}
      <motion.div
        className="glass absolute -top-4 start-0 z-20 hidden rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)] md:block will-change-transform"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {t('chipAi')}
      </motion.div>
      <motion.div
        className="glass absolute top-16 -end-2 z-20 hidden rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)] md:block will-change-transform"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        {t('chipFeedback')}
      </motion.div>
      <motion.div
        className="glass absolute -bottom-3 start-10 z-20 hidden rounded-full px-3 py-1.5 text-xs text-[var(--text-secondary)] md:block will-change-transform"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      >
        {t('chipCoach')}
      </motion.div>

      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', willChange: 'transform' }}
        className="glass-strong relative overflow-hidden rounded-3xl border border-white/[0.14] p-5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.65)] md:p-6"
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.35, duration: 0.7, ease: easeCrystal }}
      >
        <div className="relative z-10 mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{t('simLive')}</span>
          </div>
          <span className="glass rounded-full px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
            {t('simListening')}
          </span>
        </div>

        <div className="relative z-10 mb-4 space-y-3">
          <motion.div
            className="glass max-w-[92%] rounded-2xl rounded-tl-md px-4 py-3 text-sm text-[var(--text-secondary)]"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5, ease: easeCrystal }}
          >
            {t('simQuestion')}
          </motion.div>
          <motion.div
            className="ms-auto max-w-[88%] rounded-2xl rounded-tr-md border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-cyan-500/10 px-4 py-3 text-sm text-[var(--text-primary)]"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: easeCrystal }}
          >
            {t('simAnswer')}
          </motion.div>
        </div>

        <div className="relative z-10 mb-5 flex h-14 items-end gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-[var(--aurora-1)] to-[var(--aurora-2)] will-change-transform"
              animate={{ height: ['16%', `${28 + (i % 7) * 9}%`, '20%'] }}
              transition={{ duration: 0.9 + (i % 4) * 0.12, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <ScoreRing value={91} />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-medium text-[var(--text-muted)]">{t('simScore')}</p>
            {[
              { label: t('simClarity'), value: 94 },
              { label: t('simStructure'), value: 88 },
              { label: t('simConfidence'), value: 90 },
            ].map((row, i) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-[11px] text-[var(--text-secondary)]">
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${row.value}%` }}
                    transition={{ delay: 1.2 + i * 0.12, duration: 0.8, ease: easeCrystal }}
                  />
                </div>
              </div>
            ))}
          </div>
          <motion.span
            className="glass flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            animate={{ boxShadow: ['0 0 0 rgba(6,182,212,0)', '0 0 24px rgba(6,182,212,0.45)', '0 0 0 rgba(6,182,212,0)'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Mic size={18} className="text-[var(--aurora-2)]" />
          </motion.span>
        </div>

        {/* Mini chart strip */}
        <div className="relative z-10 mt-5 flex h-10 items-end gap-1.5 border-t border-white/10 pt-4">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-sm will-change-transform"
              style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.9), rgba(6,182,212,0.5))' }}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 1.4 + i * 0.05, duration: 0.55, ease: easeCrystal }}
            />
          ))}
        </div>
      </motion.div>

      <div
        className="pointer-events-none mx-auto mt-4 h-10 w-[80%] rounded-[100%] bg-gradient-to-b from-white/15 to-transparent blur-md"
        aria-hidden
      />
    </div>
  );
}

export function CrystalHero() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const spotX = useTransform(mouseX, (v) => `${v * 100}%`);
  const spotY = useTransform(mouseY, (v) => `${v * 100}%`);
  const spotlight = useMotionTemplate`radial-gradient(680px circle at ${spotX} ${spotY}, rgba(99,102,241,0.28), rgba(6,182,212,0.12) 35%, transparent 65%)`;

  const words = t('hero.title').split(' ');

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMove}
      className="relative flex min-h-[100svh] items-center overflow-hidden px-4 pb-16 pt-28 md:px-8"
    >
      {/* Mesh / aurora layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        <motion.div
          className="absolute -left-24 top-0 h-[28rem] w-[28rem] rounded-full bg-[var(--aurora-1)]/35 blur-[110px] will-change-transform"
          animate={{ x: [0, 50, -30, 0], y: [0, 40, -20, 0], scale: [1, 1.2, 0.95, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-16 top-24 h-[30rem] w-[30rem] rounded-full bg-[var(--aurora-2)]/30 blur-[120px] will-change-transform"
          animate={{ x: [0, -60, 25, 0], y: [0, -30, 40, 0], scale: [1, 0.9, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[var(--aurora-3)]/25 blur-[100px] will-change-transform"
          animate={{ x: [0, 40, -50, 0], y: [0, -50, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-10 w-10 rotate-45 border border-white/[0.05] bg-white/[0.02] will-change-transform"
            style={{ left: `${6 + i * 9}%`, bottom: `${4 + (i % 4) * 10}%`, opacity: 0.04 }}
            animate={{ y: [0, -120 - i * 10], opacity: [0, 0.05, 0], rotate: [45, 70] }}
            transition={{ duration: 11 + i, repeat: Infinity, delay: i * 0.55, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="content-wrap relative z-10 grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        {/* Copy column */}
        <div className="relative text-center lg:text-start">
          <motion.div
            className="glass-strong absolute -inset-4 -z-10 hidden rounded-[2rem] lg:block"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.6, ease: easeCrystal }}
          />
          <div className="relative z-10 lg:p-8">
            <motion.p
              className="font-display mb-4 text-sm font-bold tracking-[-0.02em] text-[var(--text-primary)] md:text-base"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: easeCrystal }}
            >
              {t('brand')}
            </motion.p>
            <h1 className="font-display text-[40px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)] md:text-[52px] md:leading-[1.1] lg:text-[64px] lg:leading-[72px]">
              {words.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  className="me-[0.35em] inline-block last:me-0"
                  initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.35 + i * 0.08, duration: 0.45, ease: easeCrystal }}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--text-secondary)] md:text-lg md:leading-7 lg:mx-0"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.45, ease: easeCrystal }}
            >
              {t('hero.subtitle')}
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.4, ease: easeCrystal }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(99,102,241,0.2)',
                    '0 0 40px rgba(6,182,212,0.4)',
                    '0 0 20px rgba(99,102,241,0.2)',
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                className="rounded-[0.875rem]"
              >
                <Link href={localePath('/demo', locale)} className="glass-button inline-flex w-full justify-center sm:w-auto">
                  {t('hero.ctaPrimary')}
                </Link>
              </motion.div>
              <Link href="#companies" className="btn-ghost-crystal inline-flex w-full justify-center sm:w-auto">
                {t('hero.ctaSecondary')}
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Dynamic interview simulation */}
        <HeroInterviewDeck />
      </div>
    </section>
  );
}
