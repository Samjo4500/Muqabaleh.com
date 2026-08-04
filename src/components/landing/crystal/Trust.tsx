'use client';

import { motion } from 'framer-motion';
import { BiText } from './BiText';
import { C } from './copy';
import { fadeUp } from './motion';

const LOGOS = ['NEOM', 'STC', 'Aramco', 'Careem', 'Tabby', 'Anghami'];

export function CrystalTrust() {
  return (
    <section className="section-pad border-y border-white/5">
      <div className="content-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10"
        >
          <BiText
            bi={C.trust.text}
            align="center"
            primaryClassName="text-sm font-medium text-[var(--text-secondary)] md:text-base"
          />
        </motion.div>
        <div className="relative overflow-hidden">
          <div className="crystal-marquee flex gap-10 md:gap-16">
            {[...LOGOS, ...LOGOS].map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="glass flex h-14 min-w-[140px] shrink-0 items-center justify-center rounded-xl px-6 text-sm font-semibold tracking-wide text-[var(--text-muted)]"
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
