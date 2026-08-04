'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, BiText } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalPricing() {
  const locale = useLocale();

  return (
    <section id="pricing" className="section-pad scroll-mt-28">
      <div className="content-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12"
        >
          <BiText
            as="h2"
            bi={C.pricing.title}
            primaryClassName="font-display text-3xl font-bold tracking-[-0.02em] md:text-4xl"
          />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {C.pricing.plans.map((plan) => (
            <motion.article
              key={plan.name.en}
              variants={fadeUp}
              className={`glass-card flex flex-col rounded-2xl p-6 ${
                plan.popular ? 'ring-1 ring-cyan-400/40' : ''
              }`}
            >
              {plan.popular ? (
                <span className="mb-3 inline-flex w-fit rounded-full bg-cyan-500/15 px-2.5 py-1 text-[11px] font-semibold text-cyan-300">
                  <BiInline
                    bi={{ en: 'Most popular', ar: 'الأكثر طلباً' }}
                  />
                </span>
              ) : null}
              <BiText
                as="h3"
                bi={plan.name}
                className="mb-3"
                primaryClassName="font-display text-xl font-semibold"
              />
              <p className="mb-1 font-display text-3xl font-bold">
                {plan.price.en}
                <span className="text-base font-medium text-[var(--text-muted)]">
                  {plan.period.en}
                </span>
              </p>
              {plan.period.ar ? (
                <p className="mb-5 text-xs text-[var(--text-muted)]" dir="rtl">
                  {plan.price.ar}
                  {plan.period.ar}
                </p>
              ) : (
                <div className="mb-5" />
              )}
              <ul className="mb-6 flex flex-1 flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f.en} className="text-sm text-[var(--text-secondary)]">
                    <BiInline bi={f} />
                  </li>
                ))}
              </ul>
              <Link
                href={localePath(plan.href, locale)}
                className={`inline-flex min-h-[44px] items-center justify-center rounded-xl text-sm font-semibold ${
                  plan.popular ? 'glass-button' : 'btn-ghost-crystal'
                }`}
              >
                <BiInline bi={plan.cta} />
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
