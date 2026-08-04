'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Bot, Briefcase, Building2, UserRound } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

const ICONS = [Bot, UserRound, Briefcase, Building2];

export function CrystalServices() {
  const locale = useLocale();

  return (
    <section id="services" className="section-pad scroll-mt-28">
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
            bi={C.services.title}
            primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-6 md:grid-cols-2"
        >
          {C.services.cards.map((card, i) => {
            const Icon = ICONS[i] ?? Bot;
            return (
              <motion.article
                key={card.title.en}
                variants={fadeUp}
                className="glass-card flex flex-col rounded-2xl p-6 md:p-8"
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-300">
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <BiText
                  as="h3"
                  bi={card.title}
                  className="mb-3"
                  primaryClassName="font-display text-xl font-semibold"
                />
                <BiText
                  as="p"
                  bi={card.body}
                  className="mb-5"
                  primaryClassName="text-sm leading-relaxed text-[var(--text-secondary)]"
                />
                <ul className="mb-6 flex flex-1 flex-col gap-2">
                  {card.features.map((f) => (
                    <li key={f.en} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
                      <BiInline bi={f} />
                    </li>
                  ))}
                </ul>
                <Link
                  href={localePath(card.href, locale)}
                  className="glass-button mt-auto inline-flex min-h-[44px] items-center justify-center text-sm font-semibold"
                >
                  <BiInline bi={card.cta} />
                </Link>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
