'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { BoxOrnament, ORNAMENT_PRESETS } from './BoxOrnament';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

const SERVICE_ACCENTS = [
  'border-teal-300/30 hover:border-teal-300/50',
  'border-amber-200/30 hover:border-amber-200/50',
  'border-cyan-300/30 hover:border-cyan-300/50',
  'border-rose-300/25 hover:border-rose-300/45',
] as const;

function ServiceVisual({ index, locale }: { index: number; locale: string }) {
  const isAr = locale === 'ar';

  if (index === 0) {
    // AI — orbiting nodes + pulse core
    return (
      <div className="mq-service-visual relative mb-6 h-28 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-teal-400/10 via-transparent to-cyan-400/5">
        <motion.div
          className="absolute start-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-300 shadow-[0_0_24px_rgba(45,212,191,0.8)]"
          animate={{ scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {[0, 1, 2].map((ring) => (
          <motion.div
            key={ring}
            className="absolute start-1/2 top-1/2 rounded-full border border-teal-300/25"
            style={{
              width: 36 + ring * 28,
              height: 36 + ring * 28,
              marginLeft: -(18 + ring * 14),
              marginTop: -(18 + ring * 14),
            }}
            animate={{ rotate: ring % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 10 + ring * 4, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute start-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-teal-200/90" />
          </motion.div>
        ))}
        <motion.div
          className="absolute inset-x-6 bottom-3 h-px bg-gradient-to-r from-transparent via-teal-300/70 to-transparent"
          animate={{ scaleX: [0.4, 1, 0.4], opacity: [0.3, 0.9, 0.3] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    );
  }

  if (index === 1) {
    // Human expert — live call window with waveform
    return (
      <div className="mq-service-visual relative mb-6 h-28 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-300/10 via-transparent to-white/5 p-4">
        <div className="flex h-full items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <motion.div
              className="h-10 w-10 rounded-full border border-amber-200/30 bg-amber-200/15"
              animate={{ boxShadow: ['0 0 0 0 rgba(232,201,122,0.0)', '0 0 0 10px rgba(232,201,122,0.0)', '0 0 0 0 rgba(232,201,122,0.0)'] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <div className="space-y-1.5">
              <div className="h-2 w-16 rounded-full bg-white/25" />
              <div className="h-2 w-10 rounded-full bg-white/15" />
            </div>
          </div>
          <div className="flex h-12 items-end gap-1">
            {[8, 14, 10, 18, 12, 16, 9].map((h, i) => (
              <motion.span
                key={i}
                className="w-1.5 rounded-full bg-amber-200/80"
                animate={{ height: [h * 0.45, h, h * 0.55, h * 0.9, h * 0.45] }}
                transition={{ duration: 1.2 + i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
                style={{ height: h }}
              />
            ))}
          </div>
        </div>
        <motion.span
          className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full border border-red-400/30 bg-red-400/15 px-2 py-0.5 text-[10px] font-bold text-red-200"
          animate={{ opacity: [1, 0.35, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          ● {isAr ? 'مباشر' : 'LIVE'}
        </motion.span>
      </div>
    );
  }

  if (index === 2) {
    // Jobs — rising match bars + sliding card
    return (
      <div className="mq-service-visual relative mb-6 h-28 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-sky-400/10 via-transparent to-teal-400/5 p-4">
        <div className="flex h-full items-end gap-2">
          {[40, 58, 46, 72, 54, 68].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-sky-400/20 to-teal-300/70"
              initial={{ height: 8 }}
              whileInView={{ height: h * 0.85 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 * i, ease: easeCrystal }}
              animate={{ opacity: [0.65, 1, 0.65] }}
            />
          ))}
        </div>
        <motion.div
          className="absolute start-4 top-4 rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold text-teal-100 backdrop-blur-md"
          animate={{ y: [0, -4, 0], x: [0, 6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {isAr ? 'تطابق ٩٥٪' : '95% match'}
        </motion.div>
      </div>
    );
  }

  // HR — pipeline stages flowing
  const stages = isAr
    ? [
        { short: 'AI', full: 'فرز' },
        { short: 'HR', full: 'تقييم' },
        { short: 'OK', full: 'عرض' },
      ]
    : [
        { short: 'AI', full: 'Screen' },
        { short: 'HR', full: 'Score' },
        { short: 'OK', full: 'Offer' },
      ];

  return (
    <div className="mq-service-visual relative mb-6 h-28 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-teal-300/10 via-transparent to-amber-300/10 p-4">
      <div className="relative flex h-full items-center justify-between gap-2 pb-4">
        {stages.map((stage, i) => (
          <motion.div
            key={stage.full}
            className="relative z-[1] flex flex-1 flex-col items-center gap-2"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 * i, duration: 0.5, ease: easeCrystal }}
          >
            <motion.div
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/8 text-[10px] font-bold text-white/85 backdrop-blur-md"
              animate={{
                borderColor: [
                  'rgba(255,255,255,0.15)',
                  'rgba(45,212,191,0.55)',
                  'rgba(255,255,255,0.15)',
                ],
              }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45 }}
            >
              {stage.short}
            </motion.div>
            <span className="text-[10px] font-medium text-white/45">{stage.full}</span>
          </motion.div>
        ))}
        <div className="pointer-events-none absolute inset-x-10 top-[28%] h-px bg-gradient-to-r from-transparent via-teal-300/40 to-transparent" />
      </div>
      <motion.div className="absolute bottom-3 start-4 end-4 h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300"
          animate={{ x: ['-20%', '220%'] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

export function CrystalServices() {
  const locale = useLocale();
  const Arrow = locale === 'ar' ? ArrowUpLeft : ArrowUpRight;

  return (
    <section id="services" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 max-w-2xl"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.nav.services} />
          </p>
          <T
            as="h2"
            bi={C.services.title}
            className="mq-display mb-3 text-3xl font-bold tracking-tight text-white md:text-5xl"
          />
          <T as="p" bi={C.services.subtitle} className="text-base text-white/65 md:text-lg" />
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid gap-5 md:grid-cols-2"
        >
          {C.services.cards.map((card, i) => {
            const ornament = ORNAMENT_PRESETS[i % ORNAMENT_PRESETS.length];
            return (
            <motion.article
              key={card.title.en}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className={`mq-panel mq-service-card group relative flex flex-col overflow-hidden p-6 md:p-8 ${SERVICE_ACCENTS[i]}`}
            >
              <BoxOrnament
                shape={ornament.shape}
                tone={ornament.tone}
                corners={i % 2 === 0 ? ['tl', 'br'] : ['tr', 'bl']}
              />
              <motion.div
                className="pointer-events-none absolute -end-10 -top-10 h-36 w-36 rounded-full bg-teal-400/10 blur-2xl"
                animate={{ opacity: [0.2, 0.55, 0.2], scale: [0.9, 1.15, 0.9] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative mb-4 flex items-center">
                <motion.span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-teal-300/25 bg-teal-400/15 text-sm font-bold text-teal-300"
                  initial={{ scale: 0.6, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 16, delay: 0.05 * i }}
                >
                  {String(i + 1).padStart(2, '0')}
                </motion.span>
              </div>

              <ServiceVisual index={i} locale={locale} />

              <T as="h3" bi={card.title} className="mq-display relative mb-3 text-xl font-bold text-white md:text-2xl" />
              <T as="p" bi={card.body} className="relative mb-5 text-sm leading-relaxed text-white/65 md:text-[0.95rem]" />

              <motion.ul
                className="relative mb-7 flex flex-1 flex-wrap gap-2"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
                }}
              >
                {card.features.map((f) => (
                  <motion.li
                    key={f.en}
                    variants={{
                      hidden: { opacity: 0, y: 8, scale: 0.96 },
                      show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: easeCrystal } },
                    }}
                    className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-white/60 transition group-hover:border-teal-300/25 group-hover:text-white/80"
                  >
                    <BiInline bi={f} />
                  </motion.li>
                ))}
              </motion.ul>

              <Link
                href={localePath(card.href, locale)}
                className="relative inline-flex items-center gap-2 text-sm font-bold text-teal-300 transition group-hover:gap-3"
              >
                <BiInline bi={card.cta} />
                <motion.span
                  animate={{ x: locale === 'ar' ? [0, -4, 0] : [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex"
                >
                  <Arrow size={16} />
                </motion.span>
              </Link>
            </motion.article>
          );
          })}
        </motion.div>
      </div>
    </section>
  );
}
