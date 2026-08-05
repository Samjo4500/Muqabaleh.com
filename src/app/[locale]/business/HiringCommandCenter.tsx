'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Clock3, Mic, Signal, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { easeCrystal } from '@/components/landing/crystal/motion';

type CandidateStatus = 'live' | 'waiting' | 'queued' | 'scored';

type Candidate = {
  id: string;
  initials: string;
  name: { en: string; ar: string };
  city: { en: string; ar: string };
  status: CandidateStatus;
  score?: number;
  eta?: { en: string; ar: string };
};

const CANDIDATES: Candidate[] = [
  {
    id: 'lk',
    initials: 'LK',
    name: { en: 'Layla Khaled', ar: 'ليلى خالد' },
    city: { en: 'Dubai', ar: 'دبي' },
    status: 'live',
  },
  {
    id: 'oh',
    initials: 'OH',
    name: { en: 'Omar Hassan', ar: 'عمر حسن' },
    city: { en: 'Riyadh', ar: 'الرياض' },
    status: 'waiting',
    eta: { en: '~2 min', ar: '~٢ د' },
  },
  {
    id: 'sa',
    initials: 'SA',
    name: { en: 'Sara Alami', ar: 'سارة عالمي' },
    city: { en: 'Cairo', ar: 'القاهرة' },
    status: 'queued',
    eta: { en: '~8 min', ar: '~٨ د' },
  },
  {
    id: 'yn',
    initials: 'YN',
    name: { en: 'Yousef Nasser', ar: 'يوسف ناصر' },
    city: { en: 'Doha', ar: 'الدوحة' },
    status: 'queued',
    eta: { en: '~12 min', ar: '~١٢ د' },
  },
  {
    id: 'mr',
    initials: 'MR',
    name: { en: 'Maya Rahman', ar: 'مايا رحمن' },
    city: { en: 'Remote', ar: 'عن بُعد' },
    status: 'scored',
    score: 91,
  },
  {
    id: 'ka',
    initials: 'KA',
    name: { en: 'Karim Abbas', ar: 'كريم عباس' },
    city: { en: 'Jeddah', ar: 'جدة' },
    status: 'scored',
    score: 84,
  },
];

const SCRIPT = {
  en: [
    { who: 'ai' as const, text: 'Tell me about a product decision you owned end-to-end.' },
    { who: 'candidate' as const, text: 'At Growth Labs I led discovery for our MENA launch…' },
    { who: 'ai' as const, text: 'How did you measure success after shipping?' },
    { who: 'candidate' as const, text: 'We tracked activation and time-to-first-value weekly.' },
  ],
  ar: [
    { who: 'ai' as const, text: 'حدّثني عن قرار منتج قُدته من البداية للنهاية.' },
    { who: 'candidate' as const, text: 'في Growth Labs قدت اكتشاف إطلاقنا في المنطقة…' },
    { who: 'ai' as const, text: 'كيف قست النجاح بعد الإطلاق؟' },
    { who: 'candidate' as const, text: 'تابعنا التفعيل ووقت أول قيمة كل أسبوع.' },
  ],
};

const SCORES = [
  { key: 'comm', en: 'Communication', ar: 'التواصل', value: 92 },
  { key: 'struct', en: 'Structure', ar: 'الهيكل', value: 88 },
  { key: 'conf', en: 'Confidence', ar: 'الثقة', value: 85 },
] as const;

function statusLabel(status: CandidateStatus, isAr: boolean) {
  if (status === 'live') return isAr ? 'مباشر' : 'Live';
  if (status === 'waiting') return isAr ? 'في الانتظار' : 'Waiting';
  if (status === 'queued') return isAr ? 'في الطابور' : 'Queued';
  return isAr ? 'مُقيَّم' : 'Scored';
}

function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-7 items-end gap-[3px]">
      {[10, 18, 12, 22, 14, 20, 11, 16].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-teal-300/85"
          animate={active ? { height: [h * 0.35, h, h * 0.5, h * 0.9, h * 0.35] } : { height: 4 }}
          transition={{ duration: 0.9 + i * 0.05, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }}
          style={{ height: active ? h : 4 }}
        />
      ))}
    </div>
  );
}

function LiveInterviewPane({ isAr }: { isAr: boolean }) {
  const lines = SCRIPT[isAr ? 'ar' : 'en'];
  const [lineIdx, setLineIdx] = useState(0);
  const [seconds, setSeconds] = useState(62);

  useEffect(() => {
    const id = window.setInterval(() => setLineIdx((i) => (i + 1) % lines.length), 3200);
    return () => window.clearInterval(id);
  }, [lines.length]);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const current = lines[lineIdx];
  const aiSpeaking = current.who === 'ai';
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#070b14]">
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5 md:px-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
          </span>
          <span className="text-[10px] font-bold tracking-[0.14em] text-rose-300">LIVE</span>
          <span className="hidden text-[10px] text-white/40 sm:inline">
            {isAr ? 'مقابلة ذكاء اصطناعي · مدير منتجات' : 'AI Interview · Product Manager'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/45">
          <span className="inline-flex items-center gap-1">
            <Signal size={11} className="text-teal-300/80" />
            HD
          </span>
          <span className="tabular-nums text-white/70">
            {mm}:{ss}
          </span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 p-2 sm:grid-cols-[1.15fr_0.85fr] md:gap-3 md:p-3">
        <div className="relative flex min-h-[160px] flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent sm:min-h-0">
          <div className="relative flex flex-1 items-center justify-center">
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/25 bg-teal-400/10 md:h-24 md:w-24"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(45,212,191,0)',
                  '0 0 0 14px rgba(45,212,191,0)',
                  '0 0 0 0 rgba(45,212,191,0)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <span className="text-lg font-bold text-teal-100 md:text-xl">LK</span>
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <p className="text-[10px] font-semibold text-white/85 md:text-xs">
                {isAr ? 'ليلى خالد · مرشّحة' : 'Layla Khaled · Candidate'}
              </p>
            </div>
          </div>
          <div className="border-t border-white/8 bg-black/35 px-3 py-2">
            <AnimatePresence mode="wait">
              <motion.p
                key={lineIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="line-clamp-2 text-[10px] leading-relaxed text-white/70 md:text-[11px]"
              >
                <span className={cn('me-1.5 font-bold', aiSpeaking ? 'text-teal-300' : 'text-amber-200')}>
                  {aiSpeaking ? (isAr ? 'مقابلة:' : 'AI:') : isAr ? 'مرشّحة:' : 'You:'}
                </span>
                {current.text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:gap-3">
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl border border-teal-300/20 bg-gradient-to-b from-teal-400/12 via-transparent to-cyan-400/5 p-2.5 md:p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/15">
                <Mic size={14} className="text-teal-200" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-white md:text-xs">
                  {isAr ? 'مقابل الذكاء' : 'Muqabaleh AI'}
                </p>
                <p className="text-[9px] text-white/40">
                  {aiSpeaking ? (isAr ? 'يتحدث الآن' : 'Speaking…') : isAr ? 'يستمع' : 'Listening'}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-center py-1">
              <WaveBars active={aiSpeaking} />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 md:p-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
              {isAr ? 'تقييم مباشر' : 'Live scorecard'}
            </p>
            <div className="space-y-2">
              {SCORES.map((s, i) => (
                <div key={s.key}>
                  <div className="mb-1 flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-white/55">{isAr ? s.ar : s.en}</span>
                    <span className="text-teal-300">{s.value}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 1.4, delay: 0.2 + i * 0.15, ease: easeCrystal }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CandidatesQueue({
  isAr,
  activeId,
  onSelect,
}: {
  isAr: boolean;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const pending = CANDIDATES.filter((c) => c.status !== 'scored').length;
  const scored = CANDIDATES.filter((c) => c.status === 'scored').length;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="border-b border-white/8 px-3 py-3 md:px-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold tracking-wide text-teal-300/90">
              {isAr ? 'مرشحون بانتظار المقابلة' : 'Pending interview candidates'}
            </p>
            <p className="mt-0.5 text-[10px] text-white/40">
              {isAr
                ? `${pending} في الطابور · ${scored} مُقيَّمون`
                : `${pending} in queue · ${scored} scored`}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-white/55">
            <Users size={11} />
            {CANDIDATES.length}
          </span>
        </div>
      </div>

      <ul className="flex-1 space-y-1.5 overflow-y-auto p-2 md:p-2.5">
        {CANDIDATES.map((c, i) => {
          const active = c.id === activeId;
          return (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, x: isAr ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4, ease: easeCrystal }}
            >
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-start transition',
                  active
                    ? 'border-teal-300/35 bg-teal-400/12 shadow-[0_0_24px_rgba(45,212,191,0.12)]'
                    : 'border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
                )}
              >
                <div
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                    c.status === 'live'
                      ? 'border-teal-300/40 bg-teal-400/15 text-teal-100'
                      : c.status === 'scored'
                        ? 'border-amber-200/30 bg-amber-200/10 text-amber-100'
                        : 'border-white/15 bg-white/[0.04] text-white/70',
                  )}
                >
                  {c.initials}
                  {c.status === 'live' ? (
                    <span className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0f18] bg-rose-400" />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] font-semibold text-white">
                      {isAr ? c.name.ar : c.name.en}
                    </p>
                    {c.status === 'scored' && c.score != null ? (
                      <span className="shrink-0 text-[11px] font-bold text-amber-100">{c.score}</span>
                    ) : c.eta ? (
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-[10px] text-white/40">
                        <Clock3 size={10} />
                        {isAr ? c.eta.ar : c.eta.en}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-[10px] text-white/40">
                      {isAr ? c.city.ar : c.city.en}
                    </p>
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide',
                        c.status === 'live' && 'bg-rose-400/15 text-rose-300',
                        c.status === 'waiting' && 'bg-amber-200/10 text-amber-100/90',
                        c.status === 'queued' && 'bg-white/5 text-white/45',
                        c.status === 'scored' && 'bg-teal-400/10 text-teal-300',
                      )}
                    >
                      {statusLabel(c.status, isAr)}
                    </span>
                  </div>
                </div>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}

/** Desktop hiring console: pending candidates + live AI interview. */
export function HiringCommandCenter({ className }: { className?: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [activeId, setActiveId] = useState('lk');
  const [pulseCount, setPulseCount] = useState(12);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPulseCount((n) => (n >= 14 ? 11 : n + 1));
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div
      className={cn('relative mx-auto w-full max-w-6xl', className)}
      aria-hidden
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="pointer-events-none absolute -inset-x-8 bottom-0 h-28 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.16),transparent_70%)] blur-2xl" />

      {/* Apple-style display chassis */}
      <div className="relative rounded-[1.25rem] border border-white/15 bg-gradient-to-b from-[#2a2f38] via-[#1a1e26] to-[#12151b] p-[10px] shadow-[0_40px_110px_rgba(0,0,0,0.55)] md:rounded-[1.5rem] md:p-[12px]">
        <div className="absolute start-1/2 top-[6px] z-20 h-2 w-2 -translate-x-1/2 rounded-full bg-[#0a0c10] ring-1 ring-white/10 md:top-[7px]" />

        <div className="relative overflow-hidden rounded-[0.85rem] border border-black/60 bg-[#05080f] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] md:rounded-[1rem]">
          {/* App chrome */}
          <div className="border-b border-white/8 bg-[#0a101c]/95 px-3 py-2.5 md:px-4 md:py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-white md:text-xs">
                  {isAr ? 'مقابلة · لوحة التوظيف' : 'Muqabaleh · Hiring desk'}
                </p>
                <p className="truncate text-[10px] text-white/40">
                  {isAr
                    ? 'دفعة مدير منتجات · فرز بالذكاء الاصطناعي'
                    : 'Product Manager batch · AI screening'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                {[
                  { en: `${pulseCount} pending`, ar: `${pulseCount} بانتظار`, tone: 'teal' },
                  { en: '1 live', ar: '١ مباشر', tone: 'rose' },
                  { en: '8 scored today', ar: '٨ مُقيَّمون اليوم', tone: 'gold' },
                ].map((chip) => (
                  <span
                    key={chip.en}
                    className={cn(
                      'rounded-lg border px-2 py-1 text-[9px] font-bold md:text-[10px]',
                      chip.tone === 'teal' && 'border-teal-300/25 bg-teal-400/10 text-teal-200',
                      chip.tone === 'rose' && 'border-rose-400/25 bg-rose-400/10 text-rose-200',
                      chip.tone === 'gold' && 'border-amber-200/25 bg-amber-200/10 text-amber-100',
                    )}
                  >
                    {isAr ? chip.ar : chip.en}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="grid gap-2 p-2 md:grid-cols-[minmax(240px,0.9fr)_1.55fr] md:gap-3 md:p-3">
            <div className="min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
              <CandidatesQueue isAr={isAr} activeId={activeId} onSelect={setActiveId} />
            </div>
            <div className="min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
              <LiveInterviewPane isAr={isAr} />
            </div>
          </div>
        </div>
      </div>

      {/* stand */}
      <div className="relative mx-auto mt-0 h-3 w-[18%] rounded-b-md bg-gradient-to-b from-[#3a404c] to-[#1a1e26]" />
      <div className="relative mx-auto h-1.5 w-[34%] rounded-full bg-gradient-to-b from-[#2c313a] to-[#15181e] shadow-[0_10px_24px_rgba(0,0,0,0.4)]" />
    </div>
  );
}
