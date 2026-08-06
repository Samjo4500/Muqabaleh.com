'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

const OFFER_LINES = [
  { key: 'shortlist', y: 18 },
  { key: 'approve', y: 28 },
  { key: 'apply', y: 62 },
  { key: 'passport', y: 74 },
] as const;

export function CrystalJeannie() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <section id="jeannie" className="mq-section mq-jeannie scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-10 max-w-2xl md:mb-12"
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

        <div className="mq-jeannie-stage relative overflow-hidden rounded-[2rem] border border-white/10">
          <div className="pointer-events-none absolute inset-0 mq-seeker-mesh" aria-hidden />

          <div className="relative grid min-h-[520px] lg:grid-cols-[1.05fr_0.95fr]">
            {/* Avatar plane */}
            <div className="relative min-h-[360px] border-b border-white/10 lg:min-h-[560px] lg:border-b-0 lg:border-e">
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1.08, opacity: 0.5 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: easeCrystal }}
              >
                <motion.div
                  className="absolute inset-0"
                  animate={{ y: [0, -10, 0], scale: [1, 1.03, 1] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Image
                    src="/images/hero-interview-meeting.webp"
                    alt={isAr ? 'جيني — وكيلة مهنية من مقابلة' : 'Jeannie — Muqabaleh career agent'}
                    fill
                    className="object-cover object-[center_18%]"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    quality={75}
                  />
                </motion.div>
                <div className="mq-jeannie-shade absolute inset-0" />
              </motion.div>

              <motion.div
                className="absolute bottom-6 start-6 end-6 z-10 md:bottom-8 md:start-8"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.55, ease: easeCrystal }}
              >
                <motion.p
                  className="mq-display text-4xl font-bold tracking-tight text-white md:text-5xl"
                  animate={{ opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <BiInline bi={C.jeannie.name} />
                </motion.p>
                <p className="mt-1 text-sm font-medium text-teal-200/85 md:text-base">
                  {isAr ? 'وكيلتك المهنية الموثّقة بالمقابلة' : 'Your interview-verified career agent'}
                </p>
              </motion.div>

              {/* Pulse ring near face */}
              <motion.span
                className="pointer-events-none absolute start-1/2 top-[28%] h-28 w-28 -translate-x-1/2 rounded-full border border-teal-300/25"
                animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.15, 0.45, 0.15] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
            </div>

            {/* Offer callouts with motion pointers */}
            <div className="relative flex flex-col justify-center gap-4 p-5 md:p-8 lg:p-10">
              <svg
                className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden
              >
                {OFFER_LINES.map((item, i) => (
                  <motion.line
                    key={item.key}
                    x1={0}
                    y1={item.y}
                    x2={18}
                    y2={item.y}
                    stroke="rgba(45,212,191,0.45)"
                    strokeWidth="0.35"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.15, duration: 0.7, ease: easeCrystal }}
                  />
                ))}
              </svg>

              <motion.ol
                variants={stagger}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className="relative space-y-3"
              >
                {C.jeannie.offers.map((offer, i) => (
                  <motion.li
                    key={offer.key}
                    variants={fadeUp}
                    className="mq-jeannie-offer group relative"
                  >
                    <motion.span
                      className="mq-jeannie-offer-dot"
                      animate={{ scale: [1, 1.35, 1], opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2.2, delay: i * 0.25, repeat: Infinity }}
                      aria-hidden
                    />
                    <motion.div
                      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 backdrop-blur-sm transition group-hover:border-teal-300/30"
                      whileHover={{ x: isAr ? -4 : 4 }}
                      transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                    >
                      <motion.div
                        className="pointer-events-none absolute inset-y-0 start-0 w-0.5 bg-gradient-to-b from-teal-300/80 to-cyan-300/20"
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 2.4, delay: i * 0.2, repeat: Infinity }}
                      />
                      <p className="mq-display text-base font-bold text-white md:text-lg">
                        {isAr ? offer.title.ar : offer.title.en}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">
                        {isAr ? offer.desc.ar : offer.desc.en}
                      </p>
                    </motion.div>
                  </motion.li>
                ))}
              </motion.ol>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="mt-4 flex flex-col gap-3 sm:flex-row"
              >
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
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
