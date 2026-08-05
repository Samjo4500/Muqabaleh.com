'use client';

import { motion } from 'framer-motion';
import { T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalTestimonials() {
  return (
    <section id="testimonials" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 max-w-2xl"
        >
          <T
            as="h2"
            bi={C.testimonials.title}
            className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-5 md:grid-cols-3"
        >
          {C.testimonials.items.map((item) => (
            <motion.blockquote key={item.name.en} variants={fadeUp} className="mq-panel flex flex-col p-6 md:p-7">
              <div className="mb-4 text-[var(--mq-sand)]" aria-label="5 stars">
                {'★★★★★'}
              </div>
              <T
                as="p"
                bi={item.quote}
                className="mb-6 flex-1 text-sm leading-relaxed text-white/70 md:text-[0.95rem]"
              />
              <T bi={item.name} className="text-sm font-bold text-white" />
              <T bi={item.role} className="mt-1 text-xs text-white/45" />
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
