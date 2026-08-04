'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Mic } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { fadeUp, stagger, easeCrystal } from './motion';

function AssessmentSim() {
  const t = useTranslations('crystal');
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-5, 5]), { stiffness: 200, damping: 20 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia('(max-width: 767px)').matches) return;
    const rect = el.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <div className="relative" style={{ perspective: 1000 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d', willChange: 'transform' }}
        className="glass-strong relative overflow-hidden rounded-2xl border border-white/[0.12] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] md:p-5"
      >
        <div className="relative z-10 mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ms-2 truncate text-xs text-[var(--text-muted)]">{t('b2cSimUrl')}</span>
        </div>

        <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{t('b2cSimTitle')}</p>
          <span className="text-xs text-[var(--text-muted)]">{t('b2cSimProgress')}</span>
        </div>

        <div className="relative z-10 mb-4 h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
            initial={{ width: '0%' }}
            whileInView={{ width: '38%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: easeCrystal }}
          />
        </div>

        <p className="relative z-10 mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">
          {t('b2cSimPrompt')}
        </p>

        <div className="relative z-10 mb-4 flex h-16 items-end gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-[var(--aurora-1)] to-[var(--aurora-2)] will-change-transform"
              animate={{ height: ['18%', `${30 + (i % 6) * 10}%`, '22%'] }}
              transition={{ duration: 1.1 + (i % 4) * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="relative z-10 mb-4 flex items-center gap-3">
          <span className="glass flex h-10 w-10 items-center justify-center rounded-full">
            <Mic size={16} className="text-[var(--aurora-2)]" />
          </span>
          <div className="flex gap-2">
            {['B2', 'C1'].map((badge, idx) => (
              <span
                key={badge}
                className={`glass relative overflow-hidden rounded-lg px-3 py-1 text-sm font-semibold ${
                  idx === 0 ? 'gradient-text shadow-[0_0_16px_rgba(99,102,241,0.35)]' : 'text-[var(--text-muted)]'
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <span className="text-xs text-[var(--text-muted)]">{t('b2cSimListening')}</span>
          <span className="glass rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)]">
            {t('b2cSimContinue')}
          </span>
        </div>
      </motion.div>
      <div
        className="pointer-events-none mx-auto mt-3 h-8 w-[85%] rounded-[100%] bg-gradient-to-b from-white/10 to-transparent blur-md"
        aria-hidden
      />
    </div>
  );
}

export function CrystalB2C() {
  const t = useTranslations('crystal');
  const pills = [t('b2cPill1'), t('b2cPill2'), t('b2cPill3')];

  return (
    <section id="learners" className="section-pad relative">
      <div className="content-wrap grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <motion.p
            variants={fadeUp}
            className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-[var(--text-muted)] md:text-sm"
          >
            {t('b2cEyebrow')}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-[32px] font-bold leading-10 tracking-[-0.02em] md:text-4xl md:leading-[44px] lg:text-[48px] lg:leading-[56px]"
          >
            {t('b2cH2')}
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            {pills.map((pill) => (
              <span key={pill} className="glass rounded-full px-4 py-2 text-sm text-[var(--text-secondary)]">
                {pill}
              </span>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/demo" className="glass-button gradient-text inline-flex">
              {t('b2cCta')}
            </Link>
          </motion.div>
        </motion.div>
        <AssessmentSim />
      </div>
    </section>
  );
}
