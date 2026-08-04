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
      const p = Math.min((now - start) / 1200, 1);
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
  const t = useTranslations('landing.b2b');
  const bars = [40, 65, 55, 80, 70, 90];

  return (
    <div className="glass-strong aspect-video w-full overflow-hidden rounded-2xl border border-white/[0.12] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] md:p-6">
      <div className="relative z-10 mb-3 flex items-center gap-2 border-b border-white/10 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ms-2 truncate text-xs text-[var(--text-muted)]">{t('dashUrl')}</span>
      </div>

      <div className="relative z-10 mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] md:text-base">{t('dashTitle')}</h3>
        <span className="h-2 w-2 rounded-full bg-[var(--aurora-2)] shadow-[0_0_12px_var(--aurora-2)]" />
      </div>

      <div className="relative z-10 mb-4 grid grid-cols-3 gap-2 md:gap-3">
        <div className="glass rounded-xl p-2 md:p-3">
          <p className="text-[10px] text-[var(--text-muted)] md:text-xs">{t('statCandidates')}</p>
          <p className="mt-1 text-lg font-bold gradient-text md:text-xl">
            <CountUp value={247} />
          </p>
        </div>
        <div className="glass rounded-xl p-2 md:p-3">
          <p className="text-[10px] text-[var(--text-muted)] md:text-xs">{t('statAvg')}</p>
          <p className="mt-1 text-lg font-bold gradient-text md:text-xl">
            <CountUp value={82} />
          </p>
        </div>
        <div className="glass rounded-xl p-2 md:p-3">
          <p className="text-[10px] text-[var(--text-muted)] md:text-xs">{t('statPass')}</p>
          <p className="mt-1 text-lg font-bold gradient-text md:text-xl">
            <CountUp value={78} suffix="%" />
          </p>
        </div>
      </div>

      <div className="relative z-10 mb-2 flex h-20 items-end gap-2 md:h-24">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-md will-change-transform"
            style={{ background: 'linear-gradient(180deg, #6366f1, #06b6d4)' }}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.06, ease: easeCrystal }}
          />
        ))}
      </div>
      <div className="relative z-10 mb-4 flex justify-between text-[10px] text-[var(--text-muted)]">
        {bars.map((_, i) => (
          <span key={i}>{t('week', { n: i + 1 })}</span>
        ))}
      </div>

      <div className="relative z-10 mb-3 glass flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--aurora-1)] to-[var(--aurora-3)] text-xs font-bold">
            SA
          </span>
          <div>
            <p className="text-sm font-medium">{t('rowName')}</p>
            <span className="text-xs gradient-text">91</span>
          </div>
        </div>
        <span className="text-xs text-[var(--text-muted)]">{t('rowAction')}</span>
      </div>

      <div className="relative z-10 glass flex items-center justify-between gap-3 rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[10px] font-bold tracking-wide text-[var(--text-secondary)]">
            YC
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)] md:text-sm">{t('whiteLabelTitle')}</p>
            <p className="text-[10px] text-[var(--text-muted)] md:text-xs">{t('whiteLabelSub')}</p>
          </div>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] text-[var(--text-secondary)]">
          {t('whiteLabelCta')}
        </span>
      </div>
    </div>
  );
}

export function CrystalB2B() {
  const t = useTranslations('landing.b2b');
  const pills = [t('feature1'), t('feature2'), t('feature3')];

  return (
    <section id="companies" className="section-pad relative">
      <div className="content-wrap grid items-center gap-10 md:grid-cols-2 md:gap-14">
        <div className="order-2 md:order-1">
          <DashboardSim />
        </div>
        <motion.div
          className="order-1 md:order-2"
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.p
            variants={fadeUp}
            className="mb-3 text-[13px] font-medium uppercase tracking-[0.04em] text-[var(--text-muted)] md:text-sm"
          >
            {t('eyebrow')}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="font-display text-[32px] font-bold leading-10 tracking-[-0.02em] md:text-4xl md:leading-[44px] lg:text-[48px] lg:leading-[56px]"
          >
            {t('headline')}
          </motion.h2>
          <motion.div variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
            {pills.map((pill) => (
              <span key={pill} className="glass rounded-full px-4 py-2 text-sm text-[var(--text-secondary)]">
                {pill}
              </span>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="mt-8">
            <Link href="/business" className="glass-button inline-flex">
              {t('cta')}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
