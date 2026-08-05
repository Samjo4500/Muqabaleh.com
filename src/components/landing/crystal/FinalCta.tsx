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
          className="relative overflow-hidden rounded-[2rem] px-6 py-16 text-center md:px-12"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(15,110,86,0.18), transparent 55%), linear-gradient(135deg, #18314d 0%, #10233a 55%, #0c3d32 100%)',
          }}
        >
          <motion.div variants={fadeUp} className="mx-auto mb-8 max-w-2xl">
            <T
              as="h2"
              bi={C.finalCta.headline}
              className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl"
            />
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href={localePath('/register', locale)} className="mq-btn mq-btn-on-dark">
              <BiInline bi={C.finalCta.startFree} />
            </Link>
            <Link href={localePath('/business', locale)} className="mq-btn mq-btn-on-dark-ghost">
              <BiInline bi={C.finalCta.hiring} />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
