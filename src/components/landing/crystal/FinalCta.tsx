'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalFinalCta() {
  const locale = useLocale();

  return (
    <section className="mq-section">
      <div className="mq-wrap">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mq-panel relative overflow-hidden px-6 py-16 text-center md:px-12"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(45,212,191,0.22), transparent 55%), radial-gradient(ellipse 50% 50% at 80% 100%, rgba(232,201,122,0.12), transparent 50%)',
            }}
          />
          <motion.div variants={fadeUp} className="relative mx-auto mb-8 max-w-2xl">
            <T
              as="h2"
              bi={C.finalCta.headline}
              className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl"
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="relative flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href={localePath('/register', locale)} className="mq-btn mq-btn-primary">
              <BiInline bi={C.finalCta.startFree} />
            </Link>
            <Link href={localePath('/business', locale)} className="mq-btn mq-btn-ghost">
              <BiInline bi={C.finalCta.hiring} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
