'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { fadeUp, stagger } from './motion';

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
        onMouseLeave={() => { mx.set(0); my.set(0); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="glass-strong relative overflow-hidden rounded-2xl border border-white/[0.12] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] md:p-5"
      >
        <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ms-2 truncate text-xs text-[var(--text-faint)]">{t('b2cSimUrl')}</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/5">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--accent-gradient)' }}
            initial={{ width: '0%' }}
            whileInView={{ width: '65%' }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="mb-3 text-sm text-[var(--text-secondary)]">{t('b2cSimPrompt')}</p>
        <div className="mb-4 flex h-16 items-end gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-sm bg-gradient-to-t from-[var(--aurora-1)] to-[var(--aurora-2)]"
              animate={{ height: [`20%`, `${35 + (i % 5) * 12}%`, `25%`] }}
              transition={{ duration: 1.2 + (i % 3) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {['B2', 'C1'].map((badge) => (
              <span
                key={badge}
                className="glass relative overflow-hidden rounded-lg px-3 py-1 text-sm font-semibold gradient-text"
              >
                {badge}
              </span>
            ))}
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-[var(--text-muted)]">
            {t('b2cSimListening')}
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
    <section id="learners" className="relative px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.p variants={fadeUp} className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
            {t('b2cEyebrow')}
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.015em]">
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
            <Link href="/demo" className="btn-crystal gradient-text inline-flex">
              {t('b2cCta')}
            </Link>
          </motion.div>
        </motion.div>
        <AssessmentSim />
      </div>
    </section>
  );
}
