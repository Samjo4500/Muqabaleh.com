'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalServices() {
  const locale = useLocale();
  const Arrow = locale === 'ar' ? ArrowUpLeft : ArrowUpRight;

  return (
    <section id="services" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 max-w-2xl"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.nav.services} />
          </p>
          <T
            as="h2"
            bi={C.services.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.services.subtitle} className="text-base text-white/65 md:text-lg" />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-5 md:grid-cols-2"
        >
          {C.services.cards.map((card, i) => (
            <motion.article
              key={card.title.en}
              variants={fadeUp}
              className="mq-panel group flex flex-col p-6 md:p-8"
            >
              <span className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-400/15 text-sm font-bold text-teal-300">
                {String(i + 1).padStart(2, '0')}
              </span>
              <T as="h3" bi={card.title} className="mq-display mb-3 text-xl font-bold text-white md:text-2xl" />
              <T as="p" bi={card.body} className="mb-5 text-sm leading-relaxed text-white/65 md:text-[0.95rem]" />
              <ul className="mb-7 flex flex-1 flex-wrap gap-2">
                {card.features.map((f) => (
                  <li
                    key={f.en}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/60"
                  >
                    <BiInline bi={f} />
                  </li>
                ))}
              </ul>
              <Link
                href={localePath(card.href, locale)}
                className="inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition group-hover:gap-3"
              >
                <BiInline bi={card.cta} />
                <Arrow size={16} />
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
