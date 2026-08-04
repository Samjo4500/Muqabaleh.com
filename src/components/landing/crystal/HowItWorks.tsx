'use client';

import { motion } from 'framer-motion';
import { BiText } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalHowItWorks() {
  return (
    <section id="how-it-works" className="section-pad scroll-mt-28">
      <div className="content-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <BiText
            as="h2"
            bi={C.how.title}
            primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
          />
        </motion.div>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {C.how.steps.map((step, i) => (
            <motion.li key={step.title.en} variants={fadeUp} className="relative">
              <span className="font-display mb-4 block text-4xl font-bold text-cyan-400/30">
                {String(i + 1).padStart(2, '0')}
              </span>
              <BiText
                as="h3"
                bi={step.title}
                className="mb-2"
                primaryClassName="font-display text-lg font-semibold"
              />
              <BiText bi={step.desc} primaryClassName="text-sm text-[var(--text-secondary)]" />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
