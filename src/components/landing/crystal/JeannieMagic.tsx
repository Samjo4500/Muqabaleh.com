'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Bot, Check, Search, Send, Sparkles, Trophy } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { MuqabalehScoreBadge } from '@/components/brand';
import { BiInline, T } from './BiText';
import { C } from './copy';
import { easeCrystal, fadeUp } from './motion';

type StepKey = 'scan' | 'select' | 'approve' | 'apply' | 'win';

const STEPS: StepKey[] = ['scan', 'select', 'approve', 'apply', 'win'];
const STEP_MS = 3200;

const JOBS_EN = [
  { company: 'Noon', role: 'Product Analyst', city: 'Dubai', fit: 88 },
  { company: 'STC', role: 'Ops Lead', city: 'Riyadh', fit: 91 },
  { company: 'Careem', role: 'Growth Strategist', city: 'Dubai', fit: 96 },
  { company: 'Aramco', role: 'Business Analyst', city: 'Dhahran', fit: 84 },
];

const JOBS_AR = [
  { company: 'نون', role: 'محلل منتجات', city: 'دبي', fit: 88 },
  { company: 'STC', role: 'مدير عمليات', city: 'الرياض', fit: 91 },
  { company: 'كريم', role: 'استراتيجي نمو', city: 'دبي', fit: 96 },
  { company: 'أرامكو', role: 'محلل أعمال', city: 'الظهران', fit: 84 },
];

const STEP_ICON: Record<StepKey, typeof Search> = {
  scan: Search,
  select: Sparkles,
  approve: Check,
  apply: Send,
  win: Trophy,
};

function LiveDot({ active }: { active: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2">
      <motion.span
        className="absolute inset-0 rounded-full bg-teal-300"
        animate={active ? { scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] } : { opacity: 0.35 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      />
      <span className="relative h-2 w-2 rounded-full bg-teal-300" />
    </span>
  );
}

function StageScan({ isAr, active }: { isAr: boolean; active: boolean }) {
  const jobs = isAr ? JOBS_AR : JOBS_EN;
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-200/80">
        {isAr ? 'جيني تراجع الفرص…' : 'Jeannie is reviewing roles…'}
      </p>
      {jobs.map((job, i) => (
        <motion.div
          key={job.company + job.role}
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5"
          initial={false}
          animate={
            active
              ? { opacity: 1, x: 0, borderColor: 'rgba(45,212,191,0.22)' }
              : { opacity: 0.4, x: isAr ? -8 : 8 }
          }
          transition={{ delay: active ? i * 0.1 : 0, duration: 0.45, ease: easeCrystal }}
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-teal-300"
            animate={active ? { opacity: [0.3, 1, 0.3] } : { opacity: 0.35 }}
            transition={{ duration: 1.1, delay: i * 0.12, repeat: Infinity }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white/90">
              {job.role}
              <span className="font-normal text-white/45"> · {job.company}</span>
            </p>
            <p className="text-[11px] text-white/40">{job.city}</p>
          </div>
          <span className="text-[11px] font-bold text-teal-200/85">
            {isAr ? 'تطابق' : 'Fit'} {job.fit}%
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function StageSelect({ isAr, active }: { isAr: boolean; active: boolean }) {
  const pick = isAr ? JOBS_AR[2] : JOBS_EN[2];
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <motion.div
        className="rounded-2xl border border-teal-300/35 bg-teal-400/10 px-4 py-4"
        animate={
          active
            ? {
                scale: [0.97, 1.02, 1],
                boxShadow: [
                  '0 0 0 rgba(45,212,191,0)',
                  '0 0 36px rgba(45,212,191,0.28)',
                  '0 0 0 rgba(45,212,191,0)',
                ],
              }
            : { scale: 1 }
        }
        transition={{ duration: 1.5, ease: easeCrystal }}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200/90">
          {isAr ? 'اختارت جيني' : 'Jeannie selected'}
        </p>
        <p className="mt-2 text-lg font-bold text-white">{pick.role}</p>
        <p className="mt-1 text-sm text-white/55">
          {pick.company} · {pick.city}
        </p>
        <p className="mt-3 text-sm font-semibold text-teal-100">
          {isAr ? 'تطابق ٩٦٪ — أفضل فرصة اليوم' : '96% fit — best match today'}
        </p>
      </motion.div>
      <p className="text-sm text-white/50">
        {isAr
          ? 'ترشيح واحد واضح — ليس قائمة عشوائية.'
          : 'One clear shortlist pick — not a spray list.'}
      </p>
    </div>
  );
}

function StageApprove({ isAr, active }: { isAr: boolean; active: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <motion.div
        className="w-full max-w-sm rounded-2xl border border-white/12 bg-white/[0.05] px-5 py-4 text-start"
        animate={active ? { y: [12, 0], opacity: [0.2, 1] } : { opacity: 0.55 }}
        transition={{ duration: 0.7, ease: easeCrystal }}
      >
        <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/45">
          <Bot size={14} className="text-teal-300" />
          {isAr ? 'إشعار من جيني' : 'Message from Jeannie'}
        </div>
        <p className="text-sm font-semibold text-white">
          {isAr
            ? 'وجدت فرصة نمو في كريم — دبي. هل توافقين على التقديم؟'
            : 'Found a Growth Strategist role at Careem — Dubai. Approve so I can apply?'}
        </p>
      </motion.div>
      <div className="flex items-center gap-2">
        <motion.span
          className="rounded-xl border border-emerald-300/40 bg-emerald-400/15 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-emerald-100"
          animate={
            active
              ? {
                  scale: [0.92, 1.06, 1],
                  boxShadow: [
                    '0 0 0 rgba(52,211,153,0)',
                    '0 0 28px rgba(52,211,153,0.35)',
                    '0 0 0 rgba(52,211,153,0)',
                  ],
                }
              : { scale: 1 }
          }
          transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 0.5 }}
        >
          {isAr ? 'موافقة' : 'Approve'}
        </motion.span>
        <span className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-white/35">
          {isAr ? 'رفض' : 'Skip'}
        </span>
      </div>
      <p className="text-xs text-white/40">
        {isAr ? 'لا تقديم بدون موافقتك. ليس عشوائياً.' : 'No apply without your approval. NOT SPAM.'}
      </p>
    </div>
  );
}

function StageApply({ isAr, active }: { isAr: boolean; active: boolean }) {
  const lines = isAr
    ? ['تجهيز حزمة التقديم', 'إرفاق جواز مقابلة', 'إرسال التقديم…']
    : ['Preparing apply packet', 'Attaching Muqabaleh passport', 'Sending application…'];
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-200/80">
            {isAr ? 'جيني تقدّم الآن' : 'Jeannie is applying'}
          </p>
          <p className="mt-1 text-base font-semibold text-white">
            {isAr ? 'استراتيجي نمو — كريم' : 'Growth Strategist — Careem'}
          </p>
        </div>
        <MuqabalehScoreBadge score={86} size="md" locale={isAr ? 'ar' : 'en'} />
      </div>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <motion.div
            key={line}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white/75"
            initial={false}
            animate={
              active
                ? { opacity: 1, x: 0 }
                : { opacity: 0.35, x: isAr ? -6 : 6 }
            }
            transition={{ delay: active ? i * 0.28 : 0, duration: 0.4, ease: easeCrystal }}
          >
            <motion.span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/20 text-teal-200"
              animate={active ? { scale: [0.8, 1.1, 1] } : { scale: 1 }}
              transition={{ delay: active ? i * 0.28 : 0, duration: 0.45 }}
            >
              <Check size={12} />
            </motion.span>
            {line}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StageWin({ isAr, active }: { isAr: boolean; active: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <motion.div
        className="rounded-full border border-amber-200/35 bg-amber-300/10 p-4 text-amber-100"
        animate={
          active
            ? {
                scale: [0.9, 1.08, 1],
                rotate: [0, -4, 4, 0],
                boxShadow: [
                  '0 0 0 rgba(232,201,122,0)',
                  '0 0 40px rgba(232,201,122,0.35)',
                  '0 0 0 rgba(232,201,122,0)',
                ],
              }
            : { scale: 1 }
        }
        transition={{ duration: 1.4, ease: easeCrystal }}
      >
        <Trophy size={28} />
      </motion.div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200/85">
          {isAr ? 'دعوة مقابلة' : 'Interview invite'}
        </p>
        <p className="mt-2 text-xl font-bold text-white">
          {isAr ? 'كريم تريد مقابلتك' : 'Careem wants to meet you'}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-white/55">
          {isAr
            ? 'الجواز الموثّق فتح الباب. جيني رشّحت — أنت وافقت — ثم فازت الدعوة.'
            : 'Verified passport opened the door. Jeannie shortlisted — you approved — then the invite landed.'}
        </p>
      </div>
      <motion.div
        className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100"
        animate={active ? { opacity: [0.55, 1, 0.55] } : { opacity: 0.6 }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        {isAr ? 'فوز · حالة: مقابلة مجدولة' : 'Win · Status: interview scheduled'}
      </motion.div>
    </div>
  );
}

function StageBody({
  step,
  isAr,
  active,
}: {
  step: StepKey;
  isAr: boolean;
  active: boolean;
}) {
  switch (step) {
    case 'scan':
      return <StageScan isAr={isAr} active={active} />;
    case 'select':
      return <StageSelect isAr={isAr} active={active} />;
    case 'approve':
      return <StageApprove isAr={isAr} active={active} />;
    case 'apply':
      return <StageApply isAr={isAr} active={active} />;
    case 'win':
      return <StageWin isAr={isAr} active={active} />;
  }
}

export function CrystalJeannieMagic() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const step = STEPS[stepIndex];
  const copySteps = C.jeannieMagic.steps;

  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = window.setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused]);

  const progress = useMemo(() => ((stepIndex + 1) / STEPS.length) * 100, [stepIndex]);

  return (
    <section id="jeannie-magic" className="mq-section relative overflow-hidden py-16 md:py-24">
      <div className="mq-wrap">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="mq-kicker mb-3">
            <BiInline bi={C.jeannieMagic.eyebrow} />
          </p>
          <h2 className="mq-display text-3xl font-bold text-white md:text-4xl">
            <T bi={C.jeannieMagic.title} />
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-white/55 md:text-base">
            <T bi={C.jeannieMagic.body} />
          </p>
        </motion.div>

        <motion.div
          className="mq-jeannie-magic mx-auto mt-10 max-w-5xl overflow-hidden rounded-[1.75rem] border border-white/10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: easeCrystal }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
              <LiveDot active={!paused && !reduceMotion} />
              <Bot size={16} className="text-teal-300" />
              <span>{isAr ? 'محاكاة حية — جيني' : 'Live sample — Jeannie'}</span>
            </div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">
              {paused
                ? isAr
                  ? 'متوقفة مؤقتاً'
                  : 'Paused'
                : isAr
                  ? 'تشغيل تلقائي'
                  : 'Auto-playing'}
            </p>
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.25fr]">
            <ol className="space-y-1 border-b border-white/10 p-3 md:p-4 lg:border-b-0 lg:border-e">
              {STEPS.map((key, i) => {
                const Icon = STEP_ICON[key];
                const item = copySteps[i];
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => {
                        setStepIndex(i);
                        setPaused(true);
                      }}
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-start transition ${
                        active
                          ? 'border border-teal-300/30 bg-teal-400/10'
                          : 'border border-transparent hover:bg-white/[0.04]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          active
                            ? 'bg-teal-300/20 text-teal-100'
                            : done
                              ? 'bg-emerald-400/15 text-emerald-200'
                              : 'bg-white/5 text-white/35'
                        }`}
                      >
                        {done && !active ? <Check size={14} /> : <Icon size={14} />}
                      </span>
                      <span>
                        <span
                          className={`block text-sm font-semibold ${
                            active ? 'text-white' : 'text-white/65'
                          }`}
                        >
                          <BiInline bi={item.title} />
                        </span>
                        <span className="mt-0.5 block text-xs text-white/40">
                          <BiInline bi={item.desc} />
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative min-h-[22rem] p-4 md:min-h-[24rem] md:p-6">
              <div className="pointer-events-none absolute inset-x-6 top-4 h-px overflow-hidden rounded-full bg-white/10">
                <motion.div
                  key={stepIndex}
                  className="h-full origin-left bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200"
                  initial={{ width: '0%' }}
                  animate={{ width: paused || reduceMotion ? `${progress}%` : '100%' }}
                  transition={{
                    duration: paused || reduceMotion ? 0.25 : STEP_MS / 1000,
                    ease: 'linear',
                  }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  className="h-full pt-4"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: easeCrystal }}
                >
                  <StageBody step={step} isAr={isAr} active />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localePath('/app/packages', locale)}
            className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex px-6 py-3 text-sm"
          >
            <BiInline bi={C.jeannieMagic.cta} />
          </Link>
          <Link
            href={localePath('/interview/prequal', locale)}
            className="mq-btn mq-btn-ghost inline-flex px-6 py-3 text-sm"
          >
            <BiInline bi={C.jeannieMagic.ctaSecondary} />
          </Link>
        </div>
      </div>
    </section>
  );
}
