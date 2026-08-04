'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalFinalCta() {
  const locale = useLocale();

  return (
    <section className="section-pad">
      <div className="content-wrap">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="glass-strong rounded-3xl px-6 py-14 text-center md:px-12"
        >
          <motion.div variants={fadeUp} className="mx-auto mb-8 max-w-3xl">
            <BiText
              as="h2"
              bi={C.finalCta.headline}
              align="center"
              primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href={localePath('/register', locale)}
              className="glass-button inline-flex min-h-[48px] items-center justify-center px-8 text-sm font-semibold"
            >
              <BiInline bi={C.finalCta.startFree} />
            </Link>
            <Link
              href={localePath('/business', locale)}
              className="btn-ghost-crystal inline-flex min-h-[48px] items-center justify-center px-8 text-sm font-semibold"
            >
              <BiInline bi={C.finalCta.hiring} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
