'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

export function CrystalHero() {
  const locale = useLocale();
  const stats = [C.hero.statInterviews, C.hero.statPartners, C.hero.statSuccess];

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(6,182,212,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(16,185,129,0.12), transparent 50%), linear-gradient(180deg, var(--bg-deep) 0%, #07111f 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
        }}
      />

      <div className="content-wrap relative flex min-h-[100svh] flex-col justify-center pb-16 pt-28 md:pt-32">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-5xl"
        >
          <motion.div variants={fadeUp}>
            <p className="font-display mb-6 text-sm font-semibold tracking-wide text-cyan-300/90 md:text-base">
              <BiInline bi={C.brand} />
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <BiText
              as="h1"
              bi={C.hero.headline}
              className="mb-6"
              primaryClassName="font-display text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-[var(--text-primary)] sm:text-4xl md:text-5xl lg:text-6xl"
              secondaryClassName="mt-3 text-base font-medium text-[var(--text-muted)] md:text-lg"
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <BiText
              as="p"
              bi={C.hero.sub}
              className="mb-10 max-w-3xl"
              primaryClassName="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
              secondaryClassName="text-sm"
            />
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"
          >
            <Link
              href={localePath('/demo', locale)}
              className="glass-button inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-semibold"
            >
              <BiInline bi={C.hero.ctaInterview} />
            </Link>
            <Link
              href={localePath('/jobs', locale)}
              className="btn-ghost-crystal inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-semibold"
            >
              <BiInline bi={C.hero.ctaJobs} />
            </Link>
            <Link
              href={localePath('/business', locale)}
              className="btn-ghost-crystal inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-semibold"
            >
              <BiInline bi={C.hero.ctaHr} />
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-14 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3"
          >
            {stats.map((stat) => (
              <BiText
                key={stat.en}
                bi={stat}
                primaryClassName="font-display text-xl font-bold text-[var(--text-primary)] md:text-2xl"
                secondaryClassName="text-xs"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="pointer-events-none absolute bottom-8 start-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3], scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: easeCrystal }}
      />
    </section>
  );
}
