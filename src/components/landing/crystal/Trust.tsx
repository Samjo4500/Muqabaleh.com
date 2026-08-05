'use client';

import { motion } from 'framer-motion';
import { T } from './BiText';
import { C } from './copy';
import { fadeUp } from './motion';

const LOGOS = ['NEOM', 'STC', 'Aramco', 'Careem', 'Tabby', 'Anghami'];

export function CrystalTrust() {
  const stats = [C.hero.statInterviews, C.hero.statPartners, C.hero.statSuccess];

  return (
    <section className="mq-section !py-12 md:!py-16">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-10 grid gap-6 border-b border-white/10 pb-10 sm:grid-cols-3"
        >
          {stats.map((stat) => (
            <T
              key={stat.en}
              bi={stat}
              className="mq-display text-xl font-bold text-white md:text-2xl"
            />
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-8"
        >
          <T
            bi={C.trust.text}
            className="text-center text-sm font-medium text-white/50 md:text-base"
          />
        </motion.div>

        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-[var(--mq-paper)] to-transparent rtl:bg-gradient-to-l" />
          <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-[var(--mq-paper)] to-transparent rtl:bg-gradient-to-r" />
          <div className="mq-marquee flex gap-8 md:gap-14">
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex h-12 min-w-[120px] shrink-0 items-center justify-center text-sm font-bold tracking-[0.14em] text-white/35"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
