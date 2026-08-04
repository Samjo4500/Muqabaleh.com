'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { easeCrystal, fadeUp, stagger } from './motion';

export function CrystalPricing() {
  const t = useTranslations('landing.pricing');
  const locale = useLocale();

  const tiers = [
    {
      name: t('free'),
      price: t('priceFree'),
      period: t('period'),
      features: [t('feat1'), t('feat2'), t('feat3')],
      cta: t('ctaFree'),
      href: localePath('/demo', locale),
      featured: false,
    },
    {
      name: t('pro'),
      price: t('pricePro'),
      period: t('period'),
      features: [t('feat4'), t('feat5'), t('feat6'), t('feat7')],
      cta: t('ctaPro'),
      href: localePath('/pricing', locale),
      featured: false,
    },
    {
      name: t('unlimited'),
      price: t('priceUnlimited'),
      period: t('period'),
      features: [t('feat8'), t('feat9'), t('feat10'), t('feat11')],
      cta: t('ctaUnlimited'),
      href: localePath('/pricing', locale),
      featured: true,
    },
    {
      name: t('enterprise'),
      price: t('priceEnterprise'),
      period: '',
      features: [t('feat12'), t('feat13'), t('feat14')],
      cta: t('ctaEnterprise'),
      href: localePath('/business', locale),
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="section-pad relative">
      <motion.div
        className="content-wrap mb-12 max-w-2xl text-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.25 }}
        variants={stagger}
      >
        <motion.h2
          variants={fadeUp}
          className="font-display text-[32px] font-bold tracking-[-0.02em] md:text-4xl lg:text-[48px] lg:leading-[56px]"
        >
          {t('title')}
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-lg leading-7 text-[var(--text-secondary)]">
          {t('subtitle')}
        </motion.p>
      </motion.div>

      <div className="content-wrap grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
        {tiers.map((tier, i) => (
          <motion.article
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: easeCrystal }}
            className={`relative flex flex-col rounded-2xl border border-[var(--border-bright)] bg-gradient-to-b from-white/10 to-white/5 p-8 backdrop-blur-xl transition duration-200 hover:-translate-y-2 hover:border-white/25 ${
              tier.featured ? 'z-10 scale-[1.02] shadow-[0_0_40px_rgba(99,102,241,0.2)] xl:scale-105' : ''
            }`}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
            />
            {tier.featured && (
              <>
                <motion.div
                  className="pointer-events-none absolute -inset-px -z-10 rounded-2xl"
                  style={{ boxShadow: '0 0 40px rgba(99,102,241,0.25)' }}
                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="mb-3 inline-flex w-fit rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-[var(--text-secondary)]">
                  {t('mostPopular')}
                </span>
              </>
            )}
            <h3 className="text-sm font-medium text-[var(--text-muted)]">{tier.name}</h3>
            <div className="glass mt-3 inline-flex w-fit rounded-xl px-3 py-1">
              <span className="text-2xl font-bold gradient-text">{tier.price}</span>
              {tier.period ? (
                <span className="ms-1 self-end text-xs text-[var(--text-muted)]">{tier.period}</span>
              ) : null}
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    <Check size={12} className="text-[var(--aurora-2)]" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={`mt-8 inline-flex justify-center text-center text-sm ${
                tier.featured ? 'glass-button' : 'btn-ghost-crystal'
              }`}
            >
              {tier.cta}
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
