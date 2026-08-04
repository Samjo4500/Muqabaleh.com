'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { fadeUp, stagger, easeCrystal } from './motion';

export function CrystalHowItWorks() {
  const t = useTranslations('crystal');
  const steps = [
    { title: t('how1'), desc: t('how1Desc') },
    { title: t('how2'), desc: t('how2Desc') },
    { title: t('how3'), desc: t('how3Desc') },
    { title: t('how4'), desc: t('how4Desc') },
  ];

  return (
    <section id="how" className="relative px-4 py-16 md:px-8 md:py-24">
      <motion.div
        className="mx-auto mb-12 max-w-2xl text-center"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold">
          {t('howTitle')}
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-[var(--text-secondary)]">
          {t('howSub')}
        </motion.p>
      </motion.div>

      <div className="relative mx-auto max-w-6xl">
        <div className="pointer-events-none absolute start-8 end-8 top-[1.75rem] hidden h-px overflow-hidden md:block" aria-hidden>
          <motion.div
            className="h-full w-full origin-top-left rtl:origin-top-right"
            style={{
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              backgroundSize: '16px 2px',
            }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: easeCrystal }}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 * i, duration: 0.6, ease: easeCrystal }}
              className="relative"
            >
              <motion.div
                className="glass relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold gradient-text"
                initial={{ boxShadow: '0 0 0 rgba(99,102,241,0)' }}
                whileInView={{ boxShadow: '0 0 24px rgba(99,102,241,0.45)' }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
              >
                {i + 1}
              </motion.div>
              <div className="glass rounded-2xl p-4">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{step.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
