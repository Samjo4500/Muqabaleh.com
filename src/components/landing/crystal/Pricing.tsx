'use client';

import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import { useLocale } from 'next-intl';
import { Check, Minus } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

const PLAN_FACETS = [
  'mq-facet mq-facet-cyan mq-facet-shape-soft',
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-wave',
] as const;

function FreeVisual() {
  return (
    <div className="mq-price-visual relative mb-5 h-[88px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <motion.div
        className="absolute start-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/[0.06]"
        animate={{ rotate: [0, 4, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-black text-white/70"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        1
      </motion.span>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-200/70"
          style={{ left: `${22 + i * 24}%`, bottom: '18%' }}
          animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2 + i * 0.25, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function JeannieVisual() {
  return (
    <div className="mq-price-visual relative mb-5 h-[88px] overflow-hidden rounded-2xl border border-teal-300/25 bg-teal-400/5">
      <motion.div
        className="absolute start-1/2 top-[42%] h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal-300/40 bg-gradient-to-br from-teal-300/30 to-cyan-400/10"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.2, repeat: Infinity }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-teal-100">
          J
        </span>
      </motion.div>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="absolute bottom-3 h-1.5 w-1.5 rounded-full bg-teal-300/80"
          style={{ left: `${18 + i * 14}%` }}
          animate={{
            y: [0, -14 - (i % 3) * 4, 0],
            opacity: [0.25, 1, 0.25],
          }}
          transition={{ duration: 1.8 + i * 0.12, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
      <motion.div
        className="absolute inset-x-6 top-3 h-px bg-gradient-to-r from-transparent via-teal-300/60 to-transparent"
        animate={{ opacity: [0.2, 0.85, 0.2], scaleX: [0.7, 1, 0.7] }}
        transition={{ duration: 2.6, repeat: Infinity }}
      />
      <p className="absolute end-3 top-3 text-[10px] font-bold tracking-[0.14em] text-teal-200/80">
        10
      </p>
    </div>
  );
}

function ProVisual() {
  return (
    <div className="mq-price-visual relative mb-5 h-[88px] overflow-hidden rounded-2xl border border-amber-200/25 bg-amber-200/5 px-3">
      <div className="flex h-full items-center gap-3">
        <motion.div
          className="relative h-12 w-10 shrink-0 rounded-md border border-amber-200/30 bg-white/[0.06]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          <motion.span
            className="absolute inset-x-1.5 top-2 h-1 rounded-full bg-amber-200/50"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-x-1.5 top-5 h-1 rounded-full bg-white/25"
            animate={{ scaleX: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-x-1.5 top-8 h-1 rounded-full bg-white/15"
            animate={{ scaleX: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }}
          />
        </motion.div>
        <div className="flex flex-1 flex-col gap-1.5">
          {[72, 88, 64, 96].map((w, i) => (
            <motion.span
              key={i}
              className="h-1.5 rounded-full bg-gradient-to-r from-amber-200/70 to-teal-300/40"
              style={{ width: `${w}%` }}
              animate={{ opacity: [0.35, 1, 0.35], x: [0, 3, 0] }}
              transition={{ duration: 1.8, delay: i * 0.15, repeat: Infinity }}
            />
          ))}
        </div>
        <motion.div
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl border border-amber-200/30 bg-amber-200/10 text-[10px] font-black text-amber-100"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          20
        </motion.div>
      </div>
    </div>
  );
}

function PlanVisual({ index }: { index: number }) {
  if (index === 0) return <FreeVisual />;
  if (index === 1) return <JeannieVisual />;
  return <ProVisual />;
}

function CellValue({
  value,
  emphasize,
  isAr,
}: {
  value: { en: string; ar: string };
  emphasize?: boolean;
  isAr: boolean;
}) {
  const text = isAr ? value.ar : value.en;
  const isYes = value.en === 'Yes' || value.ar === 'نعم';
  const isEmpty = value.en === '—' || value.ar === '—';

  if (isEmpty) {
    return (
      <span className="inline-flex items-center justify-center text-white/25">
        <Minus size={14} strokeWidth={2} />
      </span>
    );
  }
  if (isYes) {
    return (
      <motion.span
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-400/15 text-teal-300"
        initial={{ scale: 0.6, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
      >
        <Check size={12} strokeWidth={3} />
      </motion.span>
    );
  }
  return (
    <span
      className={`text-sm font-semibold ${
        emphasize ? 'text-teal-200' : 'text-white/75'
      }`}
    >
      {text}
    </span>
  );
}

export function CrystalPricing() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const compareRef = useRef<HTMLDivElement>(null);
  const compareInView = useInView(compareRef, { once: true, margin: '-80px' });

  return (
    <section id="pricing" className="mq-section mq-pricing scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-8 max-w-3xl md:mb-10"
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

        {/* NOT SPAM banner */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mq-not-spam mb-10 flex flex-col gap-3 overflow-hidden rounded-2xl border border-teal-300/25 bg-teal-400/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:gap-5"
        >
          <motion.span
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-lg border border-teal-300/40 bg-teal-400/15 px-3 py-1.5 text-[11px] font-black tracking-[0.18em] text-teal-200"
            animate={{
              boxShadow: [
                '0 0 0 rgba(45,212,191,0)',
                '0 0 22px rgba(45,212,191,0.35)',
                '0 0 0 rgba(45,212,191,0)',
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-teal-300"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <BiInline bi={C.pricing.notSpam.badge} />
          </motion.span>
          <T as="p" bi={C.pricing.notSpam.line} className="text-sm leading-relaxed text-white/70 md:text-[0.95rem]" />
        </motion.div>

        {/* Honest apply pipeline */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-10 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 md:px-7 md:py-6"
        >
          <T
            as="h3"
            bi={C.pricing.applyHow.title}
            className="mq-display mb-2 text-lg font-bold text-white md:text-xl"
          />
          <T
            as="p"
            bi={C.pricing.applyHow.body}
            className="mb-4 max-w-3xl text-sm leading-relaxed text-white/60 md:text-[0.95rem]"
          />
          <ol className="grid gap-2 sm:grid-cols-3">
            {C.pricing.applyHow.steps.map((step, i) => (
              <li
                key={step.en}
                className="flex items-start gap-2 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-3 text-sm text-white/65"
              >
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-teal-300/30 bg-teal-400/10 text-[11px] font-bold text-teal-200">
                  {i + 1}
                </span>
                <BiInline bi={step} />
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Plan cards */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {C.pricing.plans.map((plan, index) => (
            <motion.article
              key={plan.id}
              variants={fadeUp}
              whileHover={{ y: -10 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`mq-panel group relative flex flex-col overflow-hidden p-6 md:p-7 ${PLAN_FACETS[index]} ${
                plan.popular
                  ? 'ring-1 ring-teal-300/35 shadow-[0_0_48px_rgba(45,212,191,0.14)] lg:-translate-y-3'
                  : ''
              }`}
            >
              {plan.popular ? (
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-300/12 via-transparent to-transparent"
                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 3.2, repeat: Infinity }}
                />
              ) : null}

              <motion.div
                className="pointer-events-none absolute -end-14 -top-14 h-36 w-36 rounded-full blur-3xl"
                style={{
                  background: plan.popular
                    ? 'rgba(45,212,191,0.22)'
                    : index === 2
                      ? 'rgba(232,201,122,0.18)'
                      : 'rgba(255,255,255,0.06)',
                }}
                animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 4 + index * 0.4, repeat: Infinity }}
              />

              <div className="relative mb-2 min-h-[28px]">
                {plan.popular ? (
                  <motion.span
                    className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-teal-300/30 bg-teal-400/15 px-2.5 py-1 text-[11px] font-bold text-teal-300"
                    animate={{
                      boxShadow: [
                        '0 0 0 rgba(45,212,191,0)',
                        '0 0 18px rgba(45,212,191,0.35)',
                        '0 0 0 rgba(45,212,191,0)',
                      ],
                    }}
                    transition={{ duration: 2.2, repeat: Infinity }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
                    {isAr ? 'الأكثر طلباً' : 'Most popular'}
                  </motion.span>
                ) : (
                  <span className="inline-flex text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
                    {isAr ? plan.applies.ar : plan.applies.en}
                  </span>
                )}
              </div>

              <PlanVisual index={index} />

              <T as="h3" bi={plan.name} className="mq-display relative mb-1 text-2xl font-bold text-white" />
              <T as="p" bi={plan.tagline} className="relative mb-4 text-sm text-white/50" />

              {plan.concealPrice ? (
                <div className="relative mb-5">
                  <p className="mq-display text-2xl font-bold text-white md:text-3xl">
                    <BiInline bi={C.pricing.priceHidden} />
                  </p>
                  <p className="mt-1 text-xs text-white/45">
                    <BiInline bi={C.pricing.priceHint} />
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-wide text-teal-200/80">
                    {isAr ? plan.applies.ar : plan.applies.en}
                  </p>
                </div>
              ) : (
                <div className="relative mb-5">
                  <p className="mq-display text-4xl font-bold text-white md:text-5xl">
                    {isAr ? plan.price.ar : plan.price.en}
                    {(isAr ? plan.period.ar : plan.period.en) ? (
                      <span className="ms-1 text-base font-semibold text-white/45 md:text-lg">
                        {isAr ? plan.period.ar : plan.period.en}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-wide text-white/45">
                    {isAr ? plan.applies.ar : plan.applies.en}
                  </p>
                </div>
              )}

              <motion.ul
                className="relative mb-7 flex flex-1 flex-col gap-2.5"
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
                  plan.popular
                    ? 'mq-btn-primary mq-btn-shimmer'
                    : index === 2
                      ? 'mq-btn-ghost ring-1 ring-amber-200/25'
                      : 'mq-btn-ghost'
                }`}
              >
                <BiInline bi={plan.cta} />
              </Link>
            </motion.article>
          ))}
        </motion.div>

        {/* Animated comparison matrix */}
        <div ref={compareRef} className="mt-14 md:mt-16">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-6"
          >
            <T
              as="h3"
              bi={C.pricing.compareTitle}
              className="mq-display text-2xl font-bold text-white md:text-3xl"
            />
          </motion.div>

          <div className="mq-compare overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20 backdrop-blur-sm">
            {/* Header */}
            <div className="mq-compare-head grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] gap-2 border-b border-white/10 px-3 py-4 md:gap-3 md:px-6">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
                {isAr ? 'الميزة' : 'Feature'}
              </span>
              {C.pricing.plans.map((plan) => (
                <span
                  key={plan.id}
                  className={`text-center text-xs font-bold uppercase tracking-[0.14em] md:text-sm ${
                    plan.popular ? 'text-teal-300' : plan.id === 'pro' ? 'text-amber-200/90' : 'text-white/55'
                  }`}
                >
                  {isAr ? plan.name.ar : plan.name.en}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/5">
              {C.pricing.compare.map((row, rowIdx) => (
                <motion.div
                  key={row.label.en}
                  className="mq-compare-row grid grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] items-center gap-2 px-3 py-3.5 md:gap-3 md:px-6"
                  initial={{ opacity: 0, y: 12 }}
                  animate={compareInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  transition={{ delay: 0.06 * rowIdx, duration: 0.45, ease: easeCrystal }}
                >
                  <span className="text-xs leading-snug text-white/60 md:text-sm">
                    {isAr ? row.label.ar : row.label.en}
                  </span>
                  {row.values.map((value, colIdx) => (
                    <div key={`${row.label.en}-${colIdx}`} className="flex justify-center text-center">
                      <CellValue
                        value={value}
                        emphasize={colIdx === 1 || (colIdx === 2 && value.en !== '—')}
                        isAr={isAr}
                      />
                    </div>
                  ))}
                </motion.div>
              ))}
            </div>

            {/* Animated progress rail */}
            <motion.div
              className="h-1 origin-left bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-200"
              initial={{ scaleX: 0 }}
              animate={compareInView ? { scaleX: 1 } : { scaleX: 0 }}
              style={{ transformOrigin: isAr ? 'right' : 'left' }}
              transition={{ duration: 1.1, ease: easeCrystal, delay: 0.2 }}
            />
          </div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mx-auto mt-10 max-w-3xl text-center"
        >
          <T as="p" bi={C.pricing.companyNote} className="mb-4 text-sm text-white/55 md:text-base" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href={localePath('/request-demo?from=landing-pricing', locale)}
              className="mq-btn mq-btn-primary inline-flex text-sm"
            >
              <BiInline bi={C.pricing.companyCta} />
            </Link>
            <Link
              href={localePath('/request-demo?from=landing-pricing&intent=quote', locale)}
              className="mq-btn mq-btn-ghost inline-flex text-sm"
            >
              <BiInline bi={C.pricing.ctaQuote} />
            </Link>
            <Link
              href={localePath('/partners', locale)}
              className="mq-btn mq-btn-ghost inline-flex text-sm"
            >
              <BiInline bi={C.pricing.partnerCta} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
