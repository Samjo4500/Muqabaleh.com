'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { BoxOrnament, ORNAMENT_PRESETS } from './BoxOrnament';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

const PLAN_ACCENTS = [
  'border-white/15',
  'border-teal-300/45',
  'border-amber-200/30',
  'border-cyan-300/30',
] as const;

function PlanVisual({ index, popular }: { index: number; popular: boolean }) {
  if (index === 0) {
    return (
      <div className="relative mb-5 h-16 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-white/50"
            style={{ left: `${18 + i * 28}%`, top: '40%' }}
            animate={{ y: [0, -10, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
          />
        ))}
        <motion.div
          className="absolute inset-x-4 bottom-3 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      </div>
    );
  }

  if (index === 1 || popular) {
    return (
      <div className="relative mb-5 h-16 overflow-hidden rounded-xl border border-teal-300/25 bg-teal-400/5">
        <motion.div
          className="absolute start-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300/25 blur-md"
          animate={{ scale: [0.85, 1.25, 0.85], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.2, repeat: Infinity }}
        />
        <motion.div
          className="absolute start-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300 shadow-[0_0_18px_rgba(45,212,191,0.9)]"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="absolute h-px w-8 origin-left bg-gradient-to-r from-teal-300/80 to-transparent"
            style={{ left: '50%', top: '50%', rotate: `${i * 45}deg` }}
            animate={{ opacity: [0.15, 0.8, 0.15], scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="relative mb-5 flex h-16 items-end justify-center gap-1.5 overflow-hidden rounded-xl border border-amber-200/20 bg-amber-200/5 px-4 pb-3">
        {[10, 16, 12, 20, 14, 18].map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full bg-amber-200/80"
            animate={{ height: [h * 0.4, h, h * 0.55, h] }}
            transition={{ duration: 1.3 + i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative mb-5 h-16 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex h-full items-center justify-between gap-2">
        {['API', 'SSO', 'WL'].map((label, i) => (
          <motion.div
            key={label}
            className="flex h-9 flex-1 items-center justify-center rounded-lg border border-white/12 bg-white/[0.05] text-[10px] font-bold text-white/70"
            animate={{
              borderColor: [
                'rgba(255,255,255,0.12)',
                'rgba(45,212,191,0.45)',
                'rgba(255,255,255,0.12)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.35 }}
          >
            {label}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function CrystalPricing() {
  const locale = useLocale();
  const isAr = locale === 'ar';

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
          {C.pricing.plans.map((plan, index) => {
            const ornament = ORNAMENT_PRESETS[index % ORNAMENT_PRESETS.length];
            return (
            <motion.article
              key={plan.name.en}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`mq-panel group relative flex flex-col overflow-hidden p-6 ${PLAN_ACCENTS[index]} ${
                plan.popular
                  ? 'ring-1 ring-teal-300/30 shadow-[0_0_40px_rgba(45,212,191,0.12)] xl:-translate-y-2'
                  : ''
              }`}
            >
              <BoxOrnament
                shape={ornament.shape}
                tone={plan.popular ? 'teal' : ornament.tone}
                corners={['tl', 'br']}
                size="sm"
              />
              {plan.popular ? (
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-300/10 via-transparent to-transparent"
                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 3.2, repeat: Infinity }}
                />
              ) : null}

              <motion.div
                className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full blur-3xl"
                style={{ background: plan.popular ? 'rgba(45,212,191,0.2)' : 'rgba(255,255,255,0.06)' }}
                animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 4 + index * 0.4, repeat: Infinity }}
              />

              <div className="relative mb-1 min-h-[28px]">
                {plan.popular ? (
                  <motion.span
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-teal-300/30 bg-teal-400/15 px-2.5 py-1 text-[11px] font-bold text-teal-300"
                    animate={{ boxShadow: ['0 0 0 rgba(45,212,191,0)', '0 0 18px rgba(45,212,191,0.35)', '0 0 0 rgba(45,212,191,0)'] }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                    {isAr ? 'الأكثر طلباً' : 'Most popular'}
                  </motion.span>
                ) : null}
              </div>

              <PlanVisual index={index} popular={plan.popular} />

              <T as="h3" bi={plan.name} className="mq-display relative mb-2 text-xl font-bold text-white" />

              <motion.p
                className="mq-display relative mb-5 text-4xl font-bold text-white"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 * index, duration: 0.45, ease: easeCrystal }}
              >
                {isAr ? plan.price.ar : plan.price.en}
                <span className="text-base font-medium text-white/45">
                  {isAr ? plan.period.ar : plan.period.en}
                </span>
              </motion.p>

              <motion.ul
                className="relative mb-6 flex flex-1 flex-col gap-2.5"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
                }}
              >
                {plan.features.map((f) => (
                  <motion.li
                    key={f.en}
                    variants={{
                      hidden: { opacity: 0, x: isAr ? 8 : -8 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: easeCrystal } },
                    }}
                    className="flex items-start gap-2.5 text-sm text-white/70"
                  >
                    <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400/15 text-teal-300">
                      <Check size={10} strokeWidth={3} />
                    </span>
                    <BiInline bi={f} />
                  </motion.li>
                ))}
              </motion.ul>

              <Link
                href={localePath(plan.href, locale)}
                className={`mq-btn relative w-full text-sm ${
                  plan.popular ? 'mq-btn-primary mq-btn-shimmer' : 'mq-btn-ghost'
                }`}
              >
                <BiInline bi={plan.cta} />
              </Link>
            </motion.article>
          );
          })}
        </motion.div>
      </div>
    </section>
  );
}
