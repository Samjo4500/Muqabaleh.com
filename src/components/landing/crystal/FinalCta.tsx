'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpLeft, ArrowUpRight, BriefcaseBusiness, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BrandLogo } from './BrandLogo';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

function OrbitRing({
  size,
  duration,
  delay = 0,
  reverse = false,
}: {
  size: number;
  duration: number;
  delay?: number;
  reverse?: boolean;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute start-1/2 top-1/2 rounded-full border border-teal-300/15"
      style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <span className="absolute start-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-teal-300/80 shadow-[0_0_12px_rgba(45,212,191,0.8)]" />
      <span className="absolute end-[18%] top-[12%] h-1.5 w-1.5 rounded-full bg-amber-200/70" />
    </motion.div>
  );
}

export function CrystalFinalCta() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;

  return (
    <section className="mq-section relative overflow-hidden">
      <div className="mq-wrap relative">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="mq-facet mq-facet-teal relative overflow-hidden rounded-[2.25rem] border border-teal-300/25 px-6 py-16 text-center shadow-[0_40px_120px_rgba(0,0,0,0.45)] md:px-12 md:py-24"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 20%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 15% 85%, rgba(232,201,122,0.12), transparent 50%), radial-gradient(ellipse 55% 45% at 90% 80%, rgba(56,189,248,0.1), transparent 50%), linear-gradient(180deg, rgba(8,14,26,0.95) 0%, rgba(5,8,15,0.98) 100%)',
          }}
        >
          {/* sweeping spotlight */}
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/8 to-transparent"
            animate={{ x: ['-60%', '220%'] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* floating orbs */}
          <motion.div
            className="pointer-events-none absolute -start-10 top-8 h-48 w-48 rounded-full bg-teal-400/20 blur-3xl"
            animate={{ y: [0, 24, 0], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute -end-8 bottom-6 h-56 w-56 rounded-full bg-amber-300/15 blur-3xl"
            animate={{ y: [0, -20, 0], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* center stage: logo + orbits */}
          <motion.div variants={fadeUp} className="relative mx-auto mb-10 flex h-52 w-52 items-center justify-center md:h-64 md:w-64">
            <OrbitRing size={150} duration={14} />
            <OrbitRing size={200} duration={20} reverse delay={0.4} />
            <OrbitRing size={250} duration={28} delay={0.8} />

            <motion.div
              className="absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(45,212,191,0.28)_0%,transparent_70%)]"
              animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.4, 0.85, 0.4] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
              className="relative z-10"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <BrandLogo size="lg" className="drop-shadow-[0_12px_40px_rgba(45,212,191,0.45)] md:!h-20" />
            </motion.div>

            {/* waveform under logo */}
            <div className="absolute bottom-2 flex items-end gap-1">
              {[8, 14, 10, 18, 12, 16, 9, 15, 11].map((h, i) => (
                <motion.span
                  key={i}
                  className="w-1 rounded-full bg-teal-300/70"
                  animate={{ height: [h * 0.35, h, h * 0.5, h * 0.85, h * 0.35] }}
                  transition={{ duration: 1.1 + i * 0.07, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ height: h }}
                />
              ))}
            </div>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="relative mb-4 text-xs font-bold tracking-[0.22em] text-teal-300/90 md:text-sm"
          >
            {isAr ? 'خطوتك التالية تبدأ هنا' : 'YOUR NEXT MOVE STARTS HERE'}
          </motion.p>

          <motion.div variants={fadeUp} className="relative mx-auto mb-4 max-w-3xl">
            <T
              as="h2"
              bi={C.finalCta.headline}
              className="mq-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-6xl"
            />
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="relative mx-auto mb-10 max-w-xl text-sm text-white/55 md:text-base"
          >
            {isAr
              ? 'مساران. منصة واحدة. اختر كيف تدخل غرفة المقابلة — كمرشح أو كصاحب عمل.'
              : 'Two paths. One platform. Choose how you enter the interview room — as a candidate or as a hiring team.'}
          </motion.p>

          {/* dual path CTAs */}
          <motion.div
            variants={fadeUp}
            className="relative mx-auto grid max-w-3xl gap-4 sm:grid-cols-2"
          >
            <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localePath('/register', locale)}
                className="mq-facet mq-facet-teal mq-facet-shape-soft group relative flex h-full flex-col items-start overflow-hidden border border-teal-300/35 bg-gradient-to-br from-teal-400/20 via-teal-400/5 to-transparent p-5 text-start shadow-[0_0_40px_rgba(45,212,191,0.12)] backdrop-blur-xl transition hover:border-teal-300/60"
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-teal-300/30 bg-teal-400/15 text-teal-200">
                  <Sparkles size={18} />
                </span>
                <span className="mq-display mb-1 text-lg font-bold text-white">
                  <BiInline bi={C.finalCta.startFree} />
                </span>
                <span className="mb-4 text-xs text-white/50">
                  {isAr ? 'مقابلة ذكاء اصطناعي مجانية خلال دقائق' : 'Free AI interview in minutes'}
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-teal-300">
                  {isAr ? 'ابدأ الآن' : 'Begin now'}
                  <motion.span
                    animate={{ x: isAr ? [0, -4, 0] : [0, 4, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity }}
                    className="inline-flex"
                  >
                    <Arrow size={16} />
                  </motion.span>
                </span>
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={localePath('/business', locale)}
                className="group relative flex h-full flex-col items-start overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-br from-amber-200/15 via-white/[0.03] to-transparent p-5 text-start backdrop-blur-xl transition hover:border-amber-200/45"
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-amber-100/10 to-transparent"
                  animate={{ x: ['-120%', '120%'] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                />
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/30 bg-amber-200/10 text-amber-100">
                  <BriefcaseBusiness size={18} />
                </span>
                <span className="mq-display mb-1 text-lg font-bold text-white">
                  <BiInline bi={C.finalCta.hiring} />
                </span>
                <span className="mb-4 text-xs text-white/50">
                  {isAr ? 'فرز ذكي وهوية بيضاء لفريقك' : 'AI screening + white-label for your team'}
                </span>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-amber-100">
                  {isAr ? 'تحدث إلى المبيعات' : 'Talk to sales'}
                  <motion.span
                    animate={{ x: isAr ? [0, -4, 0] : [0, 4, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity, delay: 0.2 }}
                    className="inline-flex"
                  >
                    <Arrow size={16} />
                  </motion.span>
                </span>
              </Link>
            </motion.div>
          </motion.div>

          {/* bottom pulse line */}
          <motion.div
            className="relative mx-auto mt-12 h-px w-40 bg-gradient-to-r from-transparent via-teal-300/70 to-transparent"
            animate={{ opacity: [0.25, 0.9, 0.25], scaleX: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity, ease: easeCrystal }}
          />
        </motion.div>
      </div>
    </section>
  );
}
