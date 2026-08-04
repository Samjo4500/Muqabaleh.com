'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { easeCrystal } from './motion';

export function CrystalFinalCta() {
  const t = useTranslations('landing.finalCta');
  const locale = useLocale();

  return (
    <section className="section-pad relative overflow-hidden">
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 will-change-transform"
        style={{
          background:
            'radial-gradient(circle at center, rgba(99,102,241,0.28), rgba(6,182,212,0.12), transparent 60%)',
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        aria-hidden
      />
      <motion.div
        className="glass-strong relative z-10 mx-auto max-w-4xl px-6 py-12 text-center backdrop-blur-3xl md:px-12 md:py-16"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: easeCrystal }}
      >
        <h2 className="font-display relative z-10 text-[32px] font-bold tracking-[-0.02em] md:text-4xl lg:text-[48px] lg:leading-[56px]">
          {t('title')}
        </h2>
        <p className="relative z-10 mx-auto mt-4 max-w-xl text-lg leading-7 text-[var(--text-secondary)]">
          {t('subtitle')}
        </p>
        <div className="relative z-10 mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <motion.div
            animate={{
              boxShadow: [
                '0 0 18px rgba(99,102,241,0.2)',
                '0 0 32px rgba(6,182,212,0.35)',
                '0 0 18px rgba(99,102,241,0.2)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="rounded-[0.875rem]"
          >
            <Link href={localePath('/demo', locale)} className="glass-button inline-flex w-full justify-center sm:w-auto">
              {t('ctaPrimary')}
            </Link>
          </motion.div>
          <Link href={localePath('/business', locale)} className="btn-ghost-crystal inline-flex w-full justify-center sm:w-auto">
            {t('ctaSecondary')}
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
