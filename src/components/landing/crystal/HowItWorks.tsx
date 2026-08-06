'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp } from './motion';
import { localePath } from '@/i18n/navigation';
import { MuqabalehScoreBadge } from '@/components/brand';

type Scene = 'setup' | 'interview' | 'passport' | 'coach' | 'share' | 'jeannie' | 'apply' | 'track';
type Beat = {
  scene: Scene;
  title: { en: string; ar: string };
  desc: { en: string; ar: string };
};

function MiniScene({ kind, active }: { kind: Scene; active: boolean }) {
  if (kind === 'setup') {
    return (
      <div className="mq-seeker-scene">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 rounded-full bg-teal-200/50"
            style={{ width: `${40 + i * 18}%` }}
            animate={active ? { opacity: [0.25, 1, 0.25], x: [0, 4, 0] } : { opacity: 0.35 }}
            transition={{ duration: 1.6, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>
    );
  }
  if (kind === 'interview') {
    return (
      <div className="mq-seeker-scene mq-seeker-scene--bars">
        {[10, 18, 12, 22, 14, 20, 11].map((h, i) => (
          <motion.span
            key={i}
            className="w-1.5 rounded-full bg-teal-300/85"
            animate={
              active
                ? { height: [h * 0.4, h, h * 0.55, h * 0.85, h * 0.4] }
                : { height: h * 0.45 }
            }
            transition={{ duration: 1.1 + i * 0.05, repeat: Infinity, ease: 'easeInOut' }}
            style={{ height: h }}
          />
        ))}
      </div>
    );
  }
  if (kind === 'passport') {
    return (
      <div className="mq-seeker-scene items-center justify-center">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/40 bg-teal-400/15 text-xl font-black text-teal-100"
          animate={active ? { scale: [1, 1.08, 1], rotate: [0, -2, 0] } : { scale: 1 }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          86
        </motion.div>
      </div>
    );
  }
  if (kind === 'coach') {
    return (
      <div className="mq-seeker-scene flex-row items-center gap-3 px-4">
        <motion.span
          className="h-11 w-11 rounded-full border border-amber-200/35 bg-amber-200/15"
          animate={active ? { boxShadow: ['0 0 0 0 rgba(232,201,122,0)', '0 0 0 10px rgba(232,201,122,0)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="flex-1 space-y-2">
          <div className="h-2 w-3/4 rounded-full bg-white/25" />
          <div className="h-2 w-1/2 rounded-full bg-white/15" />
        </div>
      </div>
    );
  }
  if (kind === 'share') {
    return (
      <div className="mq-seeker-scene gap-2 px-3">
        {['Role', 'City', 'Level'].map((label, i) => (
          <motion.div
            key={label}
            className="flex h-7 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2"
            animate={active ? { opacity: [0.45, 1, 0.45], x: [0, 4, 0] } : { opacity: 0.5 }}
            transition={{ duration: 2, delay: i * 0.18, repeat: Infinity }}
          >
            <span className="h-1.5 w-10 rounded-full bg-amber-200/50" />
            <span className="h-1.5 flex-1 rounded-full bg-white/20" />
          </motion.div>
        ))}
      </div>
    );
  }
  if (kind === 'jeannie') {
    return (
      <div className="mq-seeker-scene flex-row items-center gap-3 px-4">
        <motion.span
          className="relative h-12 w-12 shrink-0 rounded-full border border-teal-300/40 bg-gradient-to-br from-teal-300/25 to-cyan-400/10"
          animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wide text-teal-100">
            J
          </span>
        </motion.span>
        <div className="flex-1 space-y-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="flex items-center gap-2"
              animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.45 }}
              transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity }}
            >
              <span className="h-1.5 flex-1 rounded-full bg-white/20" />
              <span className="h-1.5 w-8 rounded-full bg-teal-300/50" />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  if (kind === 'apply') {
    return (
      <div className="mq-seeker-scene items-center justify-center gap-2">
        <motion.div
          className="rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-100"
          animate={active ? { y: [8, 0], opacity: [0, 1] } : { opacity: 0.5 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8 }}
        >
          Approved
        </motion.div>
        <motion.div
          className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"
          aria-hidden
        >
          <motion.span
            className="block h-full w-1/2 rounded-full bg-emerald-300/80"
            animate={active ? { x: ['-40%', '120%'] } : { x: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    );
  }
  // track
  return (
    <div className="mq-seeker-scene gap-2 px-3">
      {['Sent', 'Viewed', 'Reply'].map((label, i) => (
        <motion.div
          key={label}
          className="flex h-7 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2"
          animate={active ? { x: [0, 6, 0], opacity: [0.5, 1, 0.5] } : { opacity: 0.45 }}
          transition={{ duration: 2.2, delay: i * 0.22, repeat: Infinity }}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              i === 2 ? 'bg-emerald-300/90' : i === 1 ? 'bg-cyan-300/80' : 'bg-white/35'
            }`}
          />
          <span className="h-1.5 flex-1 rounded-full bg-white/20" />
        </motion.div>
      ))}
    </div>
  );
}

export function CrystalHowItWorks() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const allBeats: Beat[] = C.how.acts.flatMap((act) =>
    act.beats.map((b) => ({
      scene: b.scene,
      title: { en: b.title.en, ar: b.title.ar },
      desc: { en: b.desc.en, ar: b.desc.ar },
    })),
  );
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!inView || paused) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % allBeats.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, [inView, paused, allBeats.length]);

  const current = allBeats[active] ?? allBeats[0]!;
  const progress = (active + 1) / allBeats.length;

  return (
    <section ref={sectionRef} id="how-it-works" className="mq-section mq-seeker scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 max-w-3xl md:mb-12"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.how.eyebrow} />
          </p>
          <T
            as="h2"
            bi={C.how.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.how.subtitle} className="text-base text-white/65 md:text-lg" />
        </motion.div>

        <div
          className="mq-seeker-stage relative overflow-hidden rounded-[2rem] border border-white/10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="pointer-events-none absolute inset-0 mq-seeker-mesh" aria-hidden />

          {/* Progress current */}
          <div className="absolute inset-x-0 top-0 z-20 h-1 bg-white/5">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-teal-300 via-cyan-300 to-emerald-300"
              style={{ scaleX: progress, transformOrigin: isAr ? 'right' : 'left' }}
              transition={{ duration: 0.45, ease: easeCrystal }}
            />
          </div>

          <div className="relative grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Story stage */}
            <div className="relative min-h-[340px] border-b border-white/10 p-6 md:min-h-[420px] md:p-10 lg:border-b-0 lg:border-e">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                {C.how.acts.map((act, actIdx) => {
                  const start = C.how.acts.slice(0, actIdx).reduce((n, a) => n + a.beats.length, 0);
                  const end = start + act.beats.length - 1;
                  const on = active >= start && active <= end;
                  return (
                    <span
                      key={act.label.en}
                      className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${
                        on
                          ? 'border-teal-300/50 bg-teal-400/15 text-teal-100'
                          : 'border-white/10 bg-white/[0.03] text-white/40'
                      }`}
                    >
                      {isAr ? act.label.ar : act.label.en}
                    </span>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.title.en}
                  initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: easeCrystal }}
                  className="relative"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-teal-300/80">
                    {String(active + 1).padStart(2, '0')} / {String(allBeats.length).padStart(2, '0')}
                  </p>
                  <T
                    as="h3"
                    bi={current.title}
                    className="mq-display mb-3 text-2xl font-bold text-white md:text-4xl"
                  />
                  <T
                    as="p"
                    bi={current.desc}
                    className="max-w-xl text-base leading-relaxed text-white/60 md:text-lg"
                  />

                  <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
                    <MiniScene kind={current.scene} active={inView} />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Passport bridge reveal in middle of journey */}
              <motion.div
                className="pointer-events-none absolute bottom-6 end-6 hidden md:block"
                animate={
                  active >= 2
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { opacity: 0, y: 16, scale: 0.92 }
                }
                transition={{ duration: 0.55, ease: easeCrystal }}
              >
                <MuqabalehScoreBadge
                  score={86}
                  status={active >= 6 ? 'hired' : 'scored'}
                  locale={locale}
                  size="md"
                />
              </motion.div>
            </div>

            {/* Path navigator */}
            <div className="relative p-5 md:p-8">
              <ol className="relative space-y-1">
                <div className="pointer-events-none absolute start-[22px] top-3 bottom-3 w-px bg-white/10" aria-hidden />
                <motion.div
                  className="pointer-events-none absolute start-[22px] top-3 w-px origin-top bg-gradient-to-b from-teal-300 via-cyan-300 to-emerald-300"
                  animate={{ height: `${Math.max(8, progress * 92)}%` }}
                  transition={{ duration: 0.45, ease: easeCrystal }}
                  aria-hidden
                />

                {C.how.acts.map((act, actIdx) => {
                  const offset = C.how.acts.slice(0, actIdx).reduce((n, a) => n + a.beats.length, 0);
                  return (
                    <li key={act.label.en} className="relative pb-4">
                      <p className="mb-2 ps-12 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                        {isAr ? act.label.ar : act.label.en}
                      </p>
                      <ul className="space-y-1">
                        {act.beats.map((beat, beatIdx) => {
                          const index = offset + beatIdx;
                          const on = index === active;
                          const done = index < active;
                          return (
                            <li key={beat.title.en}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActive(index);
                                  setPaused(true);
                                }}
                                className={`group relative flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-start transition ${
                                  on ? 'bg-teal-400/10' : 'hover:bg-white/[0.04]'
                                }`}
                              >
                                <span
                                  className={`relative z-10 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                                    on
                                      ? 'border-teal-300/70 bg-teal-400/25 text-teal-50 mq-seeker-node--lit'
                                      : done
                                        ? 'border-teal-300/30 bg-teal-400/10 text-teal-200/80'
                                        : 'border-white/15 bg-[#070b14] text-white/40'
                                  }`}
                                >
                                  {index + 1}
                                </span>
                                <span className="min-w-0 pt-1">
                                  <span
                                    className={`mq-display block text-sm font-bold ${
                                      on ? 'text-white' : 'text-white/70'
                                    }`}
                                  >
                                    {isAr ? beat.title.ar : beat.title.en}
                                  </span>
                                  <span className="mt-0.5 block text-xs leading-relaxed text-white/45">
                                    {isAr ? beat.desc.ar : beat.desc.en}
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
                <Link
                  href={localePath('/interview/prequal', locale)}
                  className="mq-btn mq-btn-primary inline-flex min-h-[48px] flex-1 items-center justify-center px-5 text-sm font-bold"
                >
                  {isAr ? C.how.ctaInterview.ar : C.how.ctaInterview.en}
                </Link>
                <Link
                  href={localePath('/#pricing', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] flex-1 items-center justify-center px-5 text-sm font-bold"
                >
                  {isAr ? C.how.ctaJeannie.ar : C.how.ctaJeannie.en}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
