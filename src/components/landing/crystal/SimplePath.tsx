'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalSimplePath() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;

  return (
    <section id="how" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 max-w-2xl md:mb-12"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.path.eyebrow} />
          </p>
          <T
            as="h2"
            bi={C.path.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.path.sub} className="text-base text-white/60 md:text-lg" />
        </motion.div>

        <motion.ol
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
        >
          {C.path.steps.map((step, i) => (
            <motion.li
              key={step.title.en}
              variants={fadeUp}
              className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-6 md:px-6"
            >
              <span className="mq-display mb-4 block text-4xl font-black text-teal-300/35">
                {String(i + 1).padStart(2, '0')}
              </span>
              <T as="h3" bi={step.title} className="mq-display mb-2 text-xl font-bold text-white" />
              <T as="p" bi={step.body} className="text-sm leading-relaxed text-white/55" />
            </motion.li>
          ))}
        </motion.ol>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            href={localePath('/interview/prep', locale)}
            className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-bold"
          >
            <BiInline bi={C.hero.ctaInterview} />
            <Arrow size={16} />
          </Link>
          <Link
            href={localePath('/jobs', locale)}
            className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-bold"
          >
            <BiInline bi={C.path.ctaJobs} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
