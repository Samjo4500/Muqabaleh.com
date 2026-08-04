'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalForCompanies() {
  const locale = useLocale();

  return (
    <section id="for-companies" className="section-pad scroll-mt-28">
      <div className="content-wrap">
        <div className="glass-strong grid items-center gap-10 overflow-hidden rounded-3xl p-8 md:grid-cols-2 md:p-12">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp} className="mb-5">
              <BiText
                as="h2"
                bi={C.companies.headline}
                primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
              />
            </motion.div>
            <motion.div variants={fadeUp} className="mb-6">
              <BiText
                as="p"
                bi={C.companies.body}
                primaryClassName="text-base leading-relaxed text-[var(--text-secondary)]"
              />
            </motion.div>
            <motion.ul variants={stagger} className="mb-8 space-y-3">
              {C.companies.bullets.map((b) => (
                <motion.li key={b.en} variants={fadeUp} className="flex items-start gap-3">
                  <Check className="mt-0.5 shrink-0 text-emerald-400" size={18} />
                  <BiInline bi={b} />
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp}>
              <Link
                href={localePath('/business', locale)}
                className="glass-button inline-flex min-h-[48px] items-center justify-center px-6 text-sm font-semibold"
              >
                <BiInline bi={C.companies.cta} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative min-h-[280px] rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-emerald-500/10 p-6"
          >
            <div className="absolute inset-6 rounded-xl border border-dashed border-white/15" />
            <div className="relative flex h-full flex-col justify-between gap-4">
              <BiText
                bi={{ en: 'HR Screening Portal', ar: 'بوابة فرز الموارد البشرية' }}
                primaryClassName="font-display text-lg font-semibold"
              />
              <div className="grid grid-cols-2 gap-3">
                {[
                  { en: 'Candidates', ar: 'مرشحون', v: '128' },
                  { en: 'Pass rate', ar: 'نسبة النجاح', v: '34%' },
                  { en: 'Avg score', ar: 'متوسط الدرجة', v: '81' },
                  { en: 'Time saved', ar: 'وقت موفّر', v: '70%' },
                ].map((m) => (
                  <div key={m.en} className="glass rounded-xl p-3">
                    <p className="text-xl font-bold text-cyan-300">{m.v}</p>
                    <BiText bi={m} primaryClassName="text-xs text-[var(--text-muted)]" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
