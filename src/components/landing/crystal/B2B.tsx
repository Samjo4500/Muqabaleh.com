'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fadeUp, stagger, easeCrystal } from './motion';

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 2000, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

function DashboardSim() {
  const t = useTranslations('crystal');
  const bars = [42, 68, 55, 80, 63, 74];

  return (
    <div className="glass-strong aspect-video w-full overflow-hidden rounded-2xl border border-white/[0.12] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] md:text-base">{t('b2bDashTitle')}</h3>
        <span className="h-2 w-2 rounded-full bg-[var(--aurora-2)] shadow-[0_0_12px_var(--aurora-2)]" />
      </div>
      <div className="mb-5 grid grid-cols-3 gap-2 md:gap-3">
        {[
          { label: t('b2bStatCandidates'), num: 247 },
          { label: t('b2bStatAvg'), num: null },
          { label: t('b2bStatPass'), num: 78, suffix: '%' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-2 md:p-3">
            <p className="text-[10px] text-[var(--text-faint)] md:text-xs">{stat.label}</p>
            {stat.num !== null && (
              <p className="mt-1 text-lg font-bold gradient-text md:text-xl">
                <CountUp value={stat.num} suffix={stat.suffix} />
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="mb-4 flex h-24 items-end gap-2 md:h-28">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-md"
            style={{ background: 'var(--accent-gradient)' }}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.06, ease: easeCrystal }}
          />
        ))}
      </div>
      <div className="glass flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--aurora-1)] to-[var(--aurora-3)] text-xs font-bold">
            S
          </span>
          <div>
            <p className="text-sm font-medium">{t('b2bRowName')}</p>
            <span className="text-xs gradient-text">B2</span>
          </div>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{t('b2bRowAction')}</span>
      </div>
    </div>
  );
}

export function CrystalB2B() {
  const t = useTranslations('crystal');
  const pills = [t('b2bPill1'), t('b2bPill2'), t('b2bPill3')];

  return (
    <section id="business" className="relative px-4 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="order-2 md:order-1">
          <DashboardSim />
        </div>
        <motion.div
          className="order-1 md:order-2"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <motion.p variants={fadeUp} className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-faint)]">
            {t('b2bEyebrow')}
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.015em]">
            {t('b2bH2')}
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            {pills.map((pill) => (
              <span key={pill} className="glass rounded-full px-4 py-2 text-sm text-[var(--text-secondary)]">
                {pill}
              </span>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/business" className="btn-crystal gradient-text inline-flex">
              {t('b2bCta')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
