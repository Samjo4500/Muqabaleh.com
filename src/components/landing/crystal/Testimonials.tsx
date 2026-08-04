'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { BiText } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalTestimonials() {
  return (
    <section id="testimonials" className="section-pad scroll-mt-28">
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
            bi={C.testimonials.title}
            primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 md:grid-cols-3"
        >
          {C.testimonials.items.map((item) => (
            <motion.blockquote
              key={item.name.en}
              variants={fadeUp}
              className="glass-card flex flex-col rounded-2xl p-6"
            >
              <div className="mb-4 flex gap-1 text-amber-300">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <BiText
                as="p"
                bi={item.quote}
                className="mb-6 flex-1"
                primaryClassName="text-sm leading-relaxed text-[var(--text-secondary)]"
              />
              <BiText
                bi={item.name}
                primaryClassName="text-sm font-semibold text-[var(--text-primary)]"
              />
              <BiText
                bi={item.role}
                primaryClassName="text-xs text-[var(--text-muted)]"
              />
            </motion.blockquote>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
