'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Check } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp, stagger } from './motion';

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return value;
}

function MetricCard({
  label,
  value,
  suffix = '',
  delay = 0,
  active,
}: {
  label: { en: string; ar: string };
  value: number;
  suffix?: string;
  delay?: number;
  active: boolean;
}) {
  const n = useCountUp(value, active);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.55, ease: easeCrystal }}
      className="relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-xl"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-300/10 via-transparent to-transparent"
        animate={{ opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 3.2, repeat: Infinity, delay }}
      />
      <p className="mq-display relative text-3xl font-bold text-teal-300 md:text-4xl">
        {n}
        {suffix}
      </p>
      <T bi={label} className="relative mt-2 text-xs text-white/55" />
    </motion.div>
  );
}

function HiringDashboard({ locale }: { locale: string }) {
  const isAr = locale === 'ar';
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const candidates = isAr
    ? [
        { name: 'ليان', score: 92, stage: 'عرض' },
        { name: 'كريم', score: 81, stage: 'مقابلة' },
        { name: 'نورة', score: 74, stage: 'فرز' },
      ]
    : [
        { name: 'Layan', score: 92, stage: 'Offer' },
        { name: 'Karim', score: 81, stage: 'Interview' },
        { name: 'Noura', score: 74, stage: 'Screen' },
      ];

  const stages = isAr ? ['فرز', 'تقييم', 'عرض'] : ['Screen', 'Score', 'Offer'];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isAr ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.75, ease: easeCrystal }}
      className="relative min-h-[420px] overflow-hidden rounded-[1.75rem] border border-white/12 bg-[rgba(6,10,18,0.72)] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-6"
    >
      {/* scanning beam */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-teal-300/10 to-transparent"
        animate={{ x: ['-40%', '140%'] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* header */}
      <div className="relative mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-wide text-teal-300/90">
            {isAr ? 'لوحة فرز مباشرة' : 'Live screening board'}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {isAr ? 'مقابلة · هوية شركتك' : 'Muqabaleh · your brand'}
          </p>
        </div>
        <motion.span
          className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-teal-400/10 px-2.5 py-1 text-[10px] font-bold text-teal-200"
          animate={{ opacity: [1, 0.45, 1] }}
          transition={{ duration: 1.6, repeat: Infinity }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-teal-300" />
          {isAr ? 'نشط' : 'LIVE'}
        </motion.span>
      </div>

      {/* pipeline */}
      <div className="relative mb-5">
        <div className="mb-3 flex items-center justify-between">
          {stages.map((stage, i) => (
            <motion.div
              key={stage}
              className="relative z-[1] flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
            >
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-[10px] font-bold text-white/80"
                animate={{
                  borderColor: [
                    'rgba(255,255,255,0.12)',
                    'rgba(45,212,191,0.55)',
                    'rgba(255,255,255,0.12)',
                  ],
                  boxShadow: [
                    '0 0 0 rgba(45,212,191,0)',
                    '0 0 18px rgba(45,212,191,0.25)',
                    '0 0 0 rgba(45,212,191,0)',
                  ],
                }}
                transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.5 }}
              >
                {String(i + 1).padStart(2, '0')}
              </motion.div>
              <span className="text-[10px] text-white/45">{stage}</span>
            </motion.div>
          ))}
        </div>
        <div className="absolute start-8 end-8 top-5 h-px bg-white/10" />
        <motion.div
          className="absolute top-[18px] h-1.5 w-1.5 rounded-full bg-teal-300 shadow-[0_0_12px_rgba(45,212,191,0.9)]"
          animate={{ left: isAr ? ['78%', '12%'] : ['12%', '78%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* candidate stream */}
      <div className="relative mb-5 space-y-2.5">
        {candidates.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, x: isAr ? -18 : 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.5, ease: easeCrystal }}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-300/30 to-amber-200/20 text-xs font-bold text-white"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.4 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {c.name.slice(0, 1)}
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-white/90">{c.name}</p>
                <p className="text-[11px] text-white/40">{c.stage}</p>
              </div>
            </div>
            <div className="text-end">
              <p className="mq-display text-sm font-bold text-teal-300">{c.score}</p>
              <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.score}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: easeCrystal }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* metrics */}
      <div className="relative grid grid-cols-2 gap-3">
        <MetricCard
          active={inView}
          value={128}
          delay={0.05}
          label={{ en: 'Candidates screened', ar: 'مرشحون فُرزوا' }}
        />
        <MetricCard
          active={inView}
          value={34}
          suffix="%"
          delay={0.12}
          label={{ en: 'Pass rate', ar: 'نسبة النجاح' }}
        />
        <MetricCard
          active={inView}
          value={81}
          delay={0.18}
          label={{ en: 'Avg score', ar: 'متوسط الدرجة' }}
        />
        <MetricCard
          active={inView}
          value={70}
          suffix="%"
          delay={0.24}
          label={{ en: 'Time saved', ar: 'وقت موفّر' }}
        />
      </div>
    </motion.div>
  );
}

export function CrystalForCompanies() {
  const locale = useLocale();

  return (
    <section id="for-companies" className="mq-section scroll-mt-28">
      <div className="mq-wrap">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[rgba(7,12,22,0.78)] shadow-[0_40px_100px_rgba(0,0,0,0.35)]">
          {/* atmospheric layers */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <motion.div
              className="absolute -start-20 top-0 h-72 w-72 rounded-full bg-teal-400/15 blur-3xl"
              animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.95, 1.1, 0.95] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -end-16 bottom-0 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl"
              animate={{ opacity: [0.2, 0.45, 0.2], y: [0, -16, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)',
                backgroundSize: '42px 42px',
                maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
              }}
            />
          </div>

          <div className="relative grid items-center gap-10 p-8 md:grid-cols-2 md:p-12 lg:gap-14 lg:p-16">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-80px' }}
            >
              <motion.p
                variants={fadeUp}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-sm font-bold tracking-wide text-[var(--mq-sand)]"
              >
                <motion.span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--mq-sand)]"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <BiInline bi={C.nav.forCompanies} />
              </motion.p>

              <motion.div variants={fadeUp}>
                <T
                  as="h2"
                  bi={C.companies.headline}
                  className="mq-display mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <T as="p" bi={C.companies.body} className="mb-7 text-base leading-relaxed text-white/70" />
              </motion.div>

              <motion.ul variants={stagger} className="mb-8 space-y-3">
                {C.companies.bullets.map((b, i) => (
                  <motion.li
                    key={b.en}
                    variants={fadeUp}
                    className="group flex items-start gap-3 text-sm text-white/85"
                  >
                    <motion.span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/10 text-teal-300"
                      whileInView={{ scale: [0.7, 1.15, 1] }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.08 * i, duration: 0.45 }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </motion.span>
                    <BiInline bi={b} />
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3">
                <Link href={localePath('/business', locale)} className="mq-btn mq-btn-primary mq-btn-shimmer">
                  <BiInline bi={C.companies.cta} />
                </Link>
                <motion.p
                  className="text-xs text-white/40"
                  animate={{ opacity: [0.35, 0.7, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {locale === 'ar' ? 'تجربة بيضاء بالكامل · نطاقك' : 'Full white-label · your domain'}
                </motion.p>
              </motion.div>
            </motion.div>

            <HiringDashboard locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}
