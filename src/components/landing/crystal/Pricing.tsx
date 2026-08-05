'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { fadeUp, stagger } from './motion';

export function CrystalPricing() {
  const locale = useLocale();

  return (
    <section id="pricing" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 max-w-2xl"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.nav.pricing} />
          </p>
          <T
            as="h2"
            bi={C.pricing.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.pricing.subtitle} className="text-base text-white/65 md:text-lg" />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {C.pricing.plans.map((plan) => (
            <motion.article
              key={plan.name.en}
              variants={fadeUp}
              className={`mq-panel flex flex-col p-6 ${
                plan.popular ? '!border-teal-300/40 ring-1 ring-teal-300/25' : ''
              }`}
            >
              {plan.popular ? (
                <span className="mb-3 inline-flex w-fit rounded-lg bg-teal-400/15 px-2.5 py-1 text-[11px] font-bold text-teal-300">
                  {locale === 'ar' ? 'الأكثر طلباً' : 'Most popular'}
                </span>
              ) : (
                <span className="mb-3 inline-block h-6" />
              )}
              <T as="h3" bi={plan.name} className="mq-display mb-3 text-xl font-bold text-white" />
              <p className="mq-display mb-5 text-4xl font-bold text-white">
                {locale === 'ar' ? plan.price.ar : plan.price.en}
                <span className="text-base font-medium text-white/45">
                  {locale === 'ar' ? plan.period.ar : plan.period.en}
                </span>
              </p>
              <ul className="mb-6 flex flex-1 flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f.en} className="text-sm text-white/65">
                    <BiInline bi={f} />
                  </li>
                ))}
              </ul>
              <Link
                href={localePath(plan.href, locale)}
                className={`mq-btn w-full text-sm ${plan.popular ? 'mq-btn-primary' : 'mq-btn-ghost'}`}
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
