'use client';

import { motion } from 'framer-motion';
import { T } from './BiText';
import { BoxOrnament, ORNAMENT_PRESETS } from './BoxOrnament';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

const ACCENTS = [
  'border-gold/30 border-amber-200/30',
  'border-teal-300/30',
  'border-cyan-300/30',
] as const;

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
          {C.testimonials.items.map((item, i) => {
            const ornament = ORNAMENT_PRESETS[i % ORNAMENT_PRESETS.length];
            return (
              <motion.blockquote
                key={item.name.en}
                variants={fadeUp}
                className={`mq-panel relative flex flex-col overflow-hidden p-6 md:p-7 ${ACCENTS[i]}`}
              >
                <BoxOrnament
                  shape={ornament.shape}
                  tone={ornament.tone}
                  corners={['tl', 'br']}
                  size="sm"
                />
                <div className="relative mb-4 text-[var(--mq-sand)]" aria-label="5 stars">
                  {'★★★★★'}
                </div>
                <T
                  as="p"
                  bi={item.quote}
                  className="relative mb-6 flex-1 text-sm leading-relaxed text-white/70 md:text-[0.95rem]"
                />
                <T bi={item.name} className="relative text-sm font-bold text-white" />
                <T bi={item.role} className="relative mt-1 text-xs text-white/45" />
              </motion.blockquote>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
