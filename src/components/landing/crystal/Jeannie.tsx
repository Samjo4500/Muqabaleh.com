'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { localePath } from '@/i18n/navigation';
import { MuqabalehScoreBadge } from '@/components/brand';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp } from './motion';

type OfferKey = 'shortlist' | 'approve' | 'apply' | 'passport';

const OFFER_META: {
  key: OfferKey;
  frame: string;
  objectPosition: string;
  accent: string;
}[] = [
  {
    key: 'shortlist',
    frame: '/images/hero-interview.webp',
    objectPosition: 'center 18%',
    accent: 'rgba(45,212,191,0.55)',
  },
  {
    key: 'approve',
    frame: '/images/hero-interview-meeting.webp',
    objectPosition: 'center 20%',
    accent: 'rgba(103,232,249,0.5)',
  },
  {
    key: 'apply',
    frame: '/images/hero-interview-hired.webp',
    objectPosition: 'center 22%',
    accent: 'rgba(52,211,153,0.55)',
  },
  {
    key: 'passport',
    frame: '/images/hero-interview-meeting.webp',
    objectPosition: 'center 16%',
    accent: 'rgba(232,201,122,0.55)',
  },
];

function SceneShortlist({ active, isAr }: { active: boolean; isAr: boolean }) {
  const roles = isAr
    ? ['محلل منتجات — دبي', 'مدير عمليات — الرياض', 'استراتيجي نمو — عمّان']
    : ['Product Analyst — Dubai', 'Ops Lead — Riyadh', 'Growth Strategist — Amman'];
  return (
    <div className="mq-jeannie-scene">
      {roles.map((role, i) => (
        <motion.div
          key={role}
          className="mq-jeannie-scene-row"
          initial={false}
          animate={
            active
              ? { opacity: 1, x: 0, borderColor: 'rgba(45,212,191,0.35)' }
              : { opacity: 0.35, x: isAr ? -6 : 6, borderColor: 'rgba(255,255,255,0.08)' }
          }
          transition={{ delay: active ? i * 0.12 : 0, duration: 0.45, ease: easeCrystal }}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-teal-300"
            animate={active ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 1.4, delay: i * 0.15, repeat: Infinity }}
          />
          <span className="truncate text-[11px] font-medium text-white/80 md:text-xs">{role}</span>
          <motion.span
            className="ms-auto text-[10px] font-bold text-teal-200/90"
            animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.35 }}
            transition={{ duration: 1.6, delay: i * 0.1, repeat: Infinity }}
          >
            {isAr ? 'تطابق' : 'Fit'} {92 - i * 4}%
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
}

function SceneApprove({ active, isAr }: { active: boolean; isAr: boolean }) {
  return (
    <div className="mq-jeannie-scene items-center justify-center gap-3">
      <motion.div
        className="rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-[11px] font-semibold text-white/70"
        animate={active ? { y: [8, 0], opacity: [0.3, 1] } : { opacity: 0.45 }}
        transition={{ duration: 0.7, ease: easeCrystal }}
      >
        {isAr ? 'فرصة مرشّحة' : 'Proposed role'}
      </motion.div>
      <div className="flex items-center gap-2">
        <motion.span
          className="rounded-lg border border-emerald-300/40 bg-emerald-400/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-emerald-100"
          animate={
            active
              ? { scale: [0.9, 1.08, 1], boxShadow: ['0 0 0 rgba(52,211,153,0)', '0 0 24px rgba(52,211,153,0.35)', '0 0 0 rgba(52,211,153,0)'] }
              : { scale: 1 }
          }
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6 }}
        >
          {isAr ? 'موافقة' : 'Approve'}
        </motion.span>
        <motion.span
          className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/40"
          animate={active ? { opacity: [0.25, 0.55, 0.25] } : { opacity: 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isAr ? 'رفض' : 'Skip'}
        </motion.span>
      </div>
    </div>
  );
}

function SceneApply({ active, isAr }: { active: boolean; isAr: boolean }) {
  return (
    <div className="mq-jeannie-scene items-center justify-center gap-3">
      <div className="relative flex w-full max-w-[220px] items-center gap-3">
        <motion.span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-teal-300/40 bg-teal-400/15 text-xs font-bold text-teal-100"
          animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          J
        </motion.span>
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.span
            className="absolute inset-y-0 start-0 w-1/2 rounded-full bg-gradient-to-r from-teal-300 to-emerald-300"
            animate={active ? { x: ['-60%', '160%'] } : { x: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <motion.span
          className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200"
          animate={active ? { opacity: [0.2, 1, 0.2] } : { opacity: 0.35 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {isAr ? 'أُرسل' : 'Sent'}
        </motion.span>
      </div>
      <motion.p
        className="text-center text-[11px] text-white/55"
        animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.4 }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isAr ? 'تقديم احترافي — بلا عشوائية' : 'Professional apply — not spam'}
      </motion.p>
    </div>
  );
}

function ScenePassport({ active, locale }: { active: boolean; locale: string }) {
  return (
    <div className="mq-jeannie-scene items-center justify-center">
      <motion.div
        animate={active ? { y: [10, 0], opacity: [0, 1], scale: [0.92, 1] } : { opacity: 0.55, scale: 0.96 }}
        transition={{ duration: 0.7, ease: easeCrystal }}
      >
        <MuqabalehScoreBadge score={86} status="scored" locale={locale} size="md" />
      </motion.div>
    </div>
  );
}

function OfferScene({
  offerKey,
  active,
  isAr,
  locale,
}: {
  offerKey: OfferKey;
  active: boolean;
  isAr: boolean;
  locale: string;
}) {
  if (offerKey === 'shortlist') return <SceneShortlist active={active} isAr={isAr} />;
  if (offerKey === 'approve') return <SceneApprove active={active} isAr={isAr} />;
  if (offerKey === 'apply') return <SceneApply active={active} isAr={isAr} />;
  return <ScenePassport active={active} locale={locale} />;
}

export function CrystalJeannie() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const offers = C.jeannie.offers;
  const meta = OFFER_META[active] ?? OFFER_META[0]!;
  const currentOffer = offers[active] ?? offers[0]!;

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % offers.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, offers.length]);

  return (
    <section id="jeannie" className="mq-section mq-jeannie scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-8 max-w-2xl md:mb-10"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.jeannie.eyebrow} />
          </p>
          <T
            as="h2"
            bi={C.jeannie.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.jeannie.body} className="text-base text-white/65 md:text-lg" />
        </motion.div>

        <div
          className="mq-jeannie-stage relative overflow-hidden rounded-[2rem] border border-white/10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="pointer-events-none absolute inset-0 mq-seeker-mesh" aria-hidden />
          <motion.div
            className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full blur-3xl"
            style={{ background: meta.accent }}
            animate={{ opacity: [0.12, 0.28, 0.12], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 4.5, repeat: Infinity }}
            aria-hidden
          />

          <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
            {/* Cinematic avatar plane */}
            <div className="relative min-h-[420px] border-b border-white/10 md:min-h-[520px] lg:min-h-[640px] lg:border-b-0 lg:border-e">
              <AnimatePresence mode="sync">
                <motion.div
                  key={meta.frame + meta.key}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                >
                  <motion.div
                    className="absolute inset-0"
                    animate={
                      reduceMotion
                        ? undefined
                        : { y: [0, -12, 0], scale: [1, 1.04, 1], x: [0, 6, 0] }
                    }
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Image
                      src={meta.frame}
                      alt={isAr ? 'جيني — وكيلة مهنية من مقابلة' : 'Jeannie — Muqabaleh career agent'}
                      fill
                      className="object-cover"
                      style={{ objectPosition: meta.objectPosition }}
                      sizes="(max-width: 1024px) 100vw, 58vw"
                      quality={78}
                      priority={active === 0}
                    />
                  </motion.div>
                  <div className="mq-jeannie-shade absolute inset-0" />
                </motion.div>
              </AnimatePresence>

              {/* Orbit rings around Jeannie */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
                {[0, 1, 2].map((ring) => (
                  <motion.span
                    key={ring}
                    className="absolute rounded-full border border-teal-300/20"
                    style={{
                      width: `${42 + ring * 18}%`,
                      height: `${34 + ring * 14}%`,
                    }}
                    animate={
                      reduceMotion
                        ? undefined
                        : {
                            rotate: ring % 2 === 0 ? 360 : -360,
                            opacity: [0.12, 0.35, 0.12],
                          }
                    }
                    transition={{
                      rotate: { duration: 18 + ring * 6, repeat: Infinity, ease: 'linear' },
                      opacity: { duration: 3.5, repeat: Infinity },
                    }}
                  />
                ))}
              </div>

              {/* Name lockup */}
              <motion.div
                className="absolute start-5 top-5 z-20 md:start-8 md:top-8"
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, ease: easeCrystal }}
              >
                <motion.p
                  className="mq-display text-4xl font-bold tracking-tight text-white md:text-6xl"
                  animate={{ opacity: [0.88, 1, 0.88] }}
                  transition={{ duration: 3.4, repeat: Infinity }}
                >
                  <BiInline bi={C.jeannie.name} />
                </motion.p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-teal-300/35 bg-teal-400/15 px-2.5 py-1 text-[10px] font-black tracking-[0.16em] text-teal-100">
                    {isAr ? 'ليس عشوائياً' : 'NOT SPAM'}
                  </span>
                  <span className="text-sm font-medium text-white/70">
                    {isAr ? 'وكيلتك المهنية الموثّقة بالمقابلة' : 'Interview-verified career agent'}
                  </span>
                </div>
              </motion.div>

              {/* Live capability stage anchored in the portrait */}
              <div className="absolute inset-x-4 bottom-4 z-20 md:inset-x-8 md:bottom-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentOffer.title.en}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35, ease: easeCrystal }}
                      className="mq-display text-lg font-bold text-white md:text-2xl"
                    >
                      {isAr ? currentOffer.title.ar : currentOffer.title.en}
                    </motion.p>
                  </AnimatePresence>
                  <span className="shrink-0 text-[11px] font-bold tracking-[0.18em] text-teal-200/80">
                    {String(active + 1).padStart(2, '0')} / {String(offers.length).padStart(2, '0')}
                  </span>
                </div>

                <div className="mq-jeannie-hud overflow-hidden rounded-2xl border border-white/15 bg-black/35 p-3 backdrop-blur-xl md:p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={meta.key}
                      initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                      transition={{ duration: 0.45, ease: easeCrystal }}
                    >
                      <OfferScene
                        offerKey={meta.key}
                        active
                        isAr={isAr}
                        locale={locale}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Step dots */}
                <div className="mt-3 flex items-center gap-2">
                  {offers.map((offer, i) => (
                    <button
                      key={offer.key}
                      type="button"
                      aria-label={isAr ? offer.title.ar : offer.title.en}
                      onClick={() => {
                        setActive(i);
                        setPaused(true);
                      }}
                      className="group relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/10"
                    >
                      {i < active ? (
                        <span className="absolute inset-0 rounded-full bg-teal-300/70" />
                      ) : null}
                      {i === active ? (
                        <motion.span
                          key={`fill-${active}-${paused ? 'p' : 'r'}`}
                          className="absolute inset-y-0 start-0 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300"
                          initial={{ width: '0%' }}
                          animate={{ width: paused ? '100%' : '100%' }}
                          transition={{
                            duration: paused || reduceMotion ? 0.35 : 3.1,
                            ease: 'linear',
                          }}
                        />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Offer navigator */}
            <div className="relative flex flex-col justify-center p-5 md:p-8 lg:p-10">
              {/* Connector beam from left edge to active offer */}
              <svg
                className="pointer-events-none absolute inset-y-0 start-0 hidden h-full w-16 lg:block"
                viewBox="0 0 40 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                <motion.path
                  d={`M 0 ${18 + active * 20} C 18 ${18 + active * 20}, 22 ${22 + active * 18}, 40 ${22 + active * 18}`}
                  fill="none"
                  stroke={meta.accent}
                  strokeWidth="0.8"
                  initial={false}
                  animate={{ pathLength: 1, opacity: [0.35, 0.9, 0.35] }}
                  transition={{
                    pathLength: { duration: 0.55, ease: easeCrystal },
                    opacity: { duration: 2.2, repeat: Infinity },
                  }}
                />
              </svg>

              <ol className="relative space-y-2.5">
                {offers.map((offer, i) => {
                  const on = i === active;
                  const done = i < active;
                  return (
                    <li key={offer.key}>
                      <button
                        type="button"
                        onClick={() => {
                          setActive(i);
                          setPaused(true);
                        }}
                        className={`group relative w-full overflow-hidden rounded-2xl border px-4 py-3.5 text-start transition ${
                          on
                            ? 'border-teal-300/40 bg-teal-400/10'
                            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        {on ? (
                          <motion.span
                            layoutId="jeannie-offer-glow"
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-300/10 via-transparent to-transparent"
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                          />
                        ) : null}

                        <div className="relative flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                              on
                                ? 'border-teal-300/70 bg-teal-400/25 text-teal-50 mq-seeker-node--lit'
                                : done
                                  ? 'border-teal-300/30 bg-teal-400/10 text-teal-200/80'
                                  : 'border-white/15 bg-[#070b14] text-white/40'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={`mq-display block text-base font-bold md:text-lg ${
                                on ? 'text-white' : 'text-white/70'
                              }`}
                            >
                              {isAr ? offer.title.ar : offer.title.en}
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-white/50">
                              {isAr ? offer.desc.ar : offer.desc.en}
                            </span>
                          </span>
                        </div>

                        {on ? (
                          <motion.span
                            className="pointer-events-none absolute inset-x-4 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-300/70 to-transparent"
                            layoutId="jeannie-offer-underline"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
                <Link
                  href={localePath('/register', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] flex-1 items-center justify-center text-sm font-bold"
                >
                  <BiInline bi={C.jeannie.cta} />
                </Link>
                <Link
                  href={localePath('/#pricing', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] flex-1 items-center justify-center text-sm font-bold"
                >
                  <BiInline bi={C.jeannie.ctaSecondary} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
