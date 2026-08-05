'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { T } from './BiText';
import { C } from './copy';
import { fadeUp } from './motion';

const FACETS = [
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-cap',
  'mq-facet mq-facet-amber mq-facet-shape-soft',
  'mq-facet mq-facet-rose mq-facet-shape-wave',
] as const;

export function CrystalFAQ() {
  return (
    <section id="faq" className="mq-section scroll-mt-28">
      <div className="mq-wrap mx-auto max-w-3xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10"
        >
          <T
            as="h2"
            bi={C.faq.title}
            className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {C.faq.items.map((item, i) => (
              <AccordionItem
                key={item.q.en}
                value={`faq-${i}`}
                className={`mq-panel relative overflow-hidden border-none px-5 ${FACETS[i % FACETS.length]}`}
              >
                <AccordionTrigger className="relative py-5 text-start text-white hover:no-underline">
                  <T bi={item.q} className="text-sm font-semibold md:text-base" />
                </AccordionTrigger>
                <AccordionContent className="relative pb-5">
                  <T bi={item.a} className="text-sm leading-relaxed text-white/65" />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
