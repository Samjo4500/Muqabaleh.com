'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalForCompanies() {
  const locale = useLocale();

  return (
    <section id="for-companies" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <div className="mq-panel overflow-hidden !bg-[rgba(8,14,26,0.72)]">
          <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:p-12 lg:p-16">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.p variants={fadeUp} className="mb-4 text-sm font-bold tracking-wide text-[var(--mq-sand)]">
                <BiInline bi={C.nav.forCompanies} />
              </motion.p>
              <motion.div variants={fadeUp}>
                <T
                  as="h2"
                  bi={C.companies.headline}
                  className="mq-display mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <T as="p" bi={C.companies.body} className="mb-7 text-base leading-relaxed text-white/70" />
              </motion.div>
              <motion.ul variants={stagger} className="mb-8 space-y-3">
                {C.companies.bullets.map((b) => (
                  <motion.li key={b.en} variants={fadeUp} className="flex items-start gap-3 text-sm text-white/85">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-300" />
                    <BiInline bi={b} />
                  </motion.li>
                ))}
              </motion.ul>
              <motion.div variants={fadeUp}>
                <Link href={localePath('/business', locale)} className="mq-btn mq-btn-primary">
                  <BiInline bi={C.companies.cta} />
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative min-h-[280px] rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-teal-400/10 via-transparent to-[rgba(232,201,122,0.12)] p-6"
            >
              <div className="grid h-full grid-cols-2 gap-3">
                {[
                  { en: 'Candidates screened', ar: 'مرشحون فُرزوا', v: '128' },
                  { en: 'Pass rate', ar: 'نسبة النجاح', v: '34%' },
                  { en: 'Avg score', ar: 'متوسط الدرجة', v: '81' },
                  { en: 'Time saved', ar: 'وقت موفّر', v: '70%' },
                ].map((m) => (
                  <div key={m.en} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <p className="mq-display text-3xl font-bold text-teal-300">{m.v}</p>
                    <T bi={m} className="mt-3 text-xs text-white/55" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
