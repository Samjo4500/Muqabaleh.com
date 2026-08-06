'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';
import { localePath } from '@/i18n/navigation';
import { MuqabalehScoreBadge } from '@/components/brand';

const DEMO_SCORE = 86;

function AnimatedScore({ active }: { active: boolean }) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { stiffness: 60, damping: 18 });
  const rounded = useTransform(spring, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (active) motionVal.set(DEMO_SCORE);
    else motionVal.set(0);
  }, [active, motionVal]);

  useEffect(() => {
    const unsub = rounded.on('change', (v) => setDisplay(v));
    return unsub;
  }, [rounded]);

  return <span className="mq-display tabular-nums">{display}</span>;
}

export function CrystalHowItWorks() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-120px' });
  const [activeStep, setActiveStep] = useState(-1);

  useEffect(() => {
    if (!inView) return;
    let step = 0;
    setActiveStep(0);
    const id = window.setInterval(() => {
      step += 1;
      if (step >= C.how.steps.length) {
        window.clearInterval(id);
        return;
      }
      setActiveStep(step);
    }, 700);
    return () => window.clearInterval(id);
  }, [inView]);

  const progress = Math.max(0, activeStep) / Math.max(1, C.how.steps.length - 1);
  const badgeReady = activeStep >= C.how.steps.length - 1;

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="mq-section mq-journey scroll-mt-28"
    >
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 max-w-2xl md:mb-14"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.how.title} />
          </p>
          <T
            as="h2"
            bi={C.how.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.how.subtitle} className="text-base text-white/65 md:text-lg" />
        </motion.div>

        <div className="mq-journey-stage relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-teal-500/[0.08] via-white/[0.02] to-transparent px-4 py-10 md:px-10 md:py-14">
          <div className="pointer-events-none absolute inset-0 mq-journey-mesh" aria-hidden />
          <div className="pointer-events-none absolute -end-16 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-teal-400/15 blur-3xl" aria-hidden />

          {/* Desktop rail */}
          <div className="relative hidden lg:block">
            <svg
              className="mq-journey-rail absolute start-[6%] end-[6%] top-[34px] h-4 w-[88%]"
              viewBox="0 0 1000 16"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M0 8 H1000"
                className="mq-journey-rail-track"
                strokeWidth="2"
                fill="none"
              />
              <motion.path
                d="M0 8 H1000"
                className="mq-journey-rail-beam"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: inView ? progress : 0 }}
                transition={{ duration: 0.55, ease: easeCrystal }}
              />
            </svg>

            <motion.ol
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              className="relative grid grid-cols-5 gap-4"
            >
              {C.how.steps.map((step, i) => {
                const lit = i <= activeStep;
                return (
                  <motion.li
                    key={step.title.en}
                    variants={fadeUp}
                    className="relative flex flex-col items-center text-center"
                  >
                    <motion.span
                      className={`mq-journey-node relative z-10 mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-full border text-lg font-bold backdrop-blur-xl ${
                        lit
                          ? 'border-teal-300/70 bg-teal-400/20 text-teal-100 mq-journey-node--lit'
                          : 'border-white/15 bg-white/5 text-white/45'
                      }`}
                      animate={
                        lit
                          ? { scale: [1, 1.06, 1], boxShadow: ['0 0 0 rgba(45,212,191,0)', '0 0 28px rgba(45,212,191,0.35)', '0 0 12px rgba(45,212,191,0.2)'] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.7, ease: easeCrystal }}
                    >
                      <span className="mq-display">{i + 1}</span>
                      {lit ? <span className="mq-journey-ring" aria-hidden /> : null}
                    </motion.span>
                    <T as="h3" bi={step.title} className="mq-display mb-2 text-base font-bold text-white" />
                    <T bi={step.desc} className="max-w-[11.5rem] text-sm leading-relaxed text-white/55" />
                  </motion.li>
                );
              })}
            </motion.ol>
          </div>

          {/* Mobile vertical rail */}
          <ol className="relative space-y-6 lg:hidden">
            <div className="pointer-events-none absolute start-7 top-3 bottom-3 w-px bg-white/10" aria-hidden />
            <motion.div
              className="pointer-events-none absolute start-7 top-3 w-px origin-top bg-gradient-to-b from-teal-300 via-teal-400 to-teal-500/40"
              style={{ height: `calc(${progress * 100}% - 0.5rem)` }}
              aria-hidden
            />
            {C.how.steps.map((step, i) => {
              const lit = i <= activeStep;
              return (
                <li key={step.title.en} className="relative flex gap-4 ps-1">
                  <span
                    className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                      lit
                        ? 'border-teal-300/70 bg-teal-400/20 text-teal-100'
                        : 'border-white/15 bg-[#070b14] text-white/45'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 pt-2">
                    <T as="h3" bi={step.title} className="mq-display mb-1 text-base font-bold text-white" />
                    <T bi={step.desc} className="text-sm leading-relaxed text-white/55" />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Score reveal */}
          <motion.div
            className="mt-10 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:mt-14 md:flex-row md:items-end"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35, duration: 0.7, ease: easeCrystal }}
          >
            <div className="text-center md:text-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
                {isAr ? C.how.scoreLabel.ar : C.how.scoreLabel.en}
              </p>
              <p className="mq-display mt-2 text-5xl font-black text-white md:text-6xl">
                <AnimatedScore active={badgeReady} />
                <span className="ms-1 text-2xl font-semibold text-white/40">/100</span>
              </p>
              <p className="mt-2 max-w-md text-sm text-white/50">
                {isAr
                  ? 'تظهر نتيجتك على جواز الجاهزية ويمكن التحقق منها ومشاركتها.'
                  : 'Your score lands on a hire-ready passport — verifiable and shareable.'}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={badgeReady ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0.35, scale: 0.96 }}
              transition={{ duration: 0.65, ease: easeCrystal }}
              className={badgeReady ? 'mq-journey-badge-pop' : ''}
            >
              <MuqabalehScoreBadge
                score={DEMO_SCORE}
                status="hired"
                locale={locale}
                size="lg"
                className="pointer-events-auto"
              />
            </motion.div>
          </motion.div>

          <div className="mt-8 flex justify-center md:justify-start">
            <Link
              href={localePath('/interview/prequal', locale)}
              className="mq-btn mq-btn-primary inline-flex min-h-[48px] items-center px-6 text-sm font-bold"
            >
              {isAr ? C.how.cta.ar : C.how.cta.en}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
