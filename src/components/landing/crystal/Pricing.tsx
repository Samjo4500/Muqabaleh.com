'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { easeCrystal, fadeUp, stagger } from './motion';

export function CrystalPricing() {
  const t = useTranslations('crystal');

  const tiers = [
    {
      name: t('tierFree'),
      price: t('priceFree'),
      period: t('pricePeriod'),
      features: [t('featFree1'), t('featFree2'), t('featFree3')],
      cta: t('ctaFree'),
      href: '/auth/register',
      featured: false,
    },
    {
      name: t('tierPro'),
      price: t('pricePro'),
      period: t('pricePeriod'),
      features: [t('featPro1'), t('featPro2'), t('featPro3')],
      cta: t('ctaPaid'),
      href: '/pricing',
      featured: true,
    },
    {
      name: t('tierUnlimited'),
      price: t('priceUnlimited'),
      period: t('pricePeriod'),
      features: [t('featUnlimited1'), t('featUnlimited2'), t('featUnlimited3')],
      cta: t('ctaPaid'),
      href: '/pricing',
      featured: false,
    },
    {
      name: t('tierB2b'),
      price: t('priceB2b'),
      period: '',
      features: [t('featB2b1'), t('featB2b2'), t('featB2b3')],
      cta: t('ctaB2b'),
      href: '/business',
      featured: false,
    },
  ];

  return (
    <section id="pricing" className="relative px-4 py-16 md:px-8 md:py-24">
      <motion.div
        className="mx-auto mb-12 max-w-2xl text-center"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
      >
        <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-bold">
          {t('pricingTitle')}
        </motion.h2>
        <motion.p variants={fadeUp} className="mt-3 text-[var(--text-secondary)]">
          {t('pricingSub')}
        </motion.p>
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier, i) => (
          <motion.article
            key={tier.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6, ease: easeCrystal }}
            className={`relative flex flex-col rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-white/25 ${
              tier.featured ? 'z-10 scale-[1.02] xl:scale-105' : ''
            }`}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: 'var(--accent-gradient)' }}
            />
            {tier.featured && (
              <motion.div
                className="pointer-events-none absolute -inset-px -z-10 rounded-2xl"
                style={{ boxShadow: '0 0 40px rgba(99,102,241,0.25)' }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            <h3 className="text-sm font-medium text-[var(--text-muted)]">{tier.name}</h3>
            <div className="glass mt-3 inline-flex w-fit rounded-xl px-3 py-1">
              <span className="text-2xl font-bold gradient-text">{tier.price}</span>
              {tier.period ? <span className="ms-1 self-end text-xs text-[var(--text-faint)]">{tier.period}</span> : null}
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
                tier.featured ? 'btn-crystal gradient-text' : 'btn-ghost-crystal'
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
