'use client';

import { motion } from 'framer-motion';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalHowItWorks() {
  return (
    <section id="how-it-works" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 max-w-2xl"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.how.title} />
          </p>
          <T
            as="h2"
            bi={C.how.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight md:text-5xl"
          />
          <T as="p" bi={C.how.subtitle} className="text-base text-[var(--mq-ink-soft)] md:text-lg" />
        </motion.div>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div className="pointer-events-none absolute start-[12%] end-[12%] top-7 hidden h-px bg-[var(--mq-line)] lg:block" />
          {C.how.steps.map((step, i) => (
            <motion.li key={step.title.en} variants={fadeUp} className="relative">
              <span className="mq-display relative z-10 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full border border-[var(--mq-line)] bg-white text-lg font-bold text-[var(--mq-accent)]">
                {i + 1}
              </span>
              <T as="h3" bi={step.title} className="mq-display mb-2 text-lg font-bold" />
              <T bi={step.desc} className="text-sm leading-relaxed text-[var(--mq-ink-soft)]" />
            </motion.li>
          ))}
        </motion.ol>
      </div>
    </section>
  );
}
