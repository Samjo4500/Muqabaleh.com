'use client';

import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BiText } from './BiText';
import { C } from './copy';
import { fadeUp } from './motion';

export function CrystalFAQ() {
  return (
    <section id="faq" className="section-pad scroll-mt-28">
      <div className="content-wrap mx-auto max-w-3xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10"
        >
          <BiText
            as="h2"
            bi={C.faq.title}
            primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
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
                className="glass-card rounded-2xl border-none px-5"
              >
                <AccordionTrigger className="py-5 text-start hover:no-underline">
                  <BiText
                    bi={item.q}
                    primaryClassName="text-sm font-semibold md:text-base"
                    secondaryClassName="text-xs"
                  />
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <BiText
                    bi={item.a}
                    primaryClassName="text-sm leading-relaxed text-[var(--text-secondary)]"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
