'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Mic, Signal } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function WaveBars({ active }: { active: boolean }) {
  return (
    <div className="flex h-8 items-end gap-[3px]">
      {[10, 18, 12, 22, 14, 20, 11, 16, 13].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-teal-300/85"
          animate={
            active
              ? { height: [h * 0.35, h, h * 0.5, h * 0.9, h * 0.35] }
              : { height: 4 }
          }
          transition={{
            duration: 0.9 + i * 0.05,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.04,
          }}
          style={{ height: active ? h : 4 }}
        />
      ))}
    </div>
  );
}

function ScoreMeter({
  label,
  value,
  delay,
}: {
  label: string;
  value: number;
  delay: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold tracking-wide">
        <span className="text-white/55">{label}</span>
        <motion.span
          className="text-teal-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
        >
          {value}
        </motion.span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

function InterviewScreen({ className }: { className?: string }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const lines = SCRIPT[isAr ? 'ar' : 'en'];
  const [lineIdx, setLineIdx] = useState(0);
  const [seconds, setSeconds] = useState(62);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLineIdx((i) => (i + 1) % lines.length);
    }, 3200);
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
    <div
      className={cn(
        'relative flex h-full w-full flex-col overflow-hidden bg-[#070b14] text-white',
        className,
      )}
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      {/* top chrome */}
      <div className="flex items-center justify-between border-b border-white/8 px-3 py-2 md:px-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
          </span>
          <span className="text-[10px] font-bold tracking-[0.14em] text-rose-300 md:text-[11px]">
            LIVE
          </span>
          <span className="hidden text-[10px] text-white/35 sm:inline">
            {isAr ? 'مقابلة ذكاء اصطناعي · مدير منتجات' : 'AI Interview · Product Manager'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-white/45 md:text-[11px]">
          <span className="inline-flex items-center gap-1">
            <Signal size={11} className="text-teal-300/80" />
            HD
          </span>
          <span className="tabular-nums text-white/70">
            {mm}:{ss}
          </span>
        </div>
      </div>

      {/* stage */}
      <div className="grid flex-1 grid-cols-[1.15fr_0.85fr] gap-2 p-2 md:gap-3 md:p-3">
        <div className="relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent">
          <div className="relative flex flex-1 items-center justify-center">
            {/* candidate presence */}
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-full border border-teal-300/25 bg-teal-400/10 md:h-28 md:w-28"
              animate={{ boxShadow: ['0 0 0 0 rgba(45,212,191,0)', '0 0 0 16px rgba(45,212,191,0)', '0 0 0 0 rgba(45,212,191,0)'] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              <span className="text-lg font-bold text-teal-100 md:text-2xl">LK</span>
            </motion.div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
              <p className="text-[10px] font-semibold text-white/85 md:text-xs">
                {isAr ? 'ليلى خالد · مرشّحة' : 'Layla Khaled · Candidate'}
              </p>
            </div>
          </div>

          {/* transcript */}
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
          {/* AI interviewer card */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl border border-teal-300/20 bg-gradient-to-b from-teal-400/12 via-transparent to-cyan-400/5 p-2.5 md:p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/15 md:h-10 md:w-10">
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

          {/* live scores */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 md:p-3">
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/35">
              {isAr ? 'تقييم مباشر' : 'Live scorecard'}
            </p>
            <div className="space-y-2">
              {SCORES.map((s, i) => (
                <ScoreMeter
                  key={s.key}
                  label={isAr ? s.ar : s.en}
                  value={s.value}
                  delay={0.2 + i * 0.15}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Apple-style laptop frame with a live AI interview simulation on screen. */
export function InterviewLaptop({ className }: { className?: string }) {
  return (
    <div className={cn('relative mx-auto w-full max-w-5xl', className)} aria-hidden>
      {/* soft desk glow */}
      <div className="pointer-events-none absolute -inset-x-10 bottom-0 h-24 bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.18),transparent_70%)] blur-2xl" />

      {/* lid / screen chassis */}
      <div className="relative rounded-[1.15rem] border border-white/15 bg-gradient-to-b from-[#2a2f38] via-[#1a1e26] to-[#12151b] p-[10px] shadow-[0_40px_100px_rgba(0,0,0,0.55)] md:rounded-[1.35rem] md:p-[12px]">
        {/* camera notch */}
        <div className="absolute start-1/2 top-[6px] z-20 h-2 w-2 -translate-x-1/2 rounded-full bg-[#0a0c10] ring-1 ring-white/10 md:top-[7px]" />

        {/* screen bezel */}
        <div className="relative overflow-hidden rounded-[0.75rem] border border-black/60 bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] md:rounded-[0.9rem]">
          <div className="aspect-[16/10] w-full">
            <InterviewScreen />
          </div>
        </div>
      </div>

      {/* hinge */}
      <div className="relative mx-auto h-[10px] w-[102%] -translate-x-[1%] rounded-b-[6px] bg-gradient-to-b from-[#3a404c] via-[#252a33] to-[#15181e] shadow-[0_8px_20px_rgba(0,0,0,0.35)]">
        <div className="absolute inset-x-[18%] top-0 h-px bg-white/10" />
      </div>

      {/* base / keyboard deck */}
      <div className="relative mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-b-[1.1rem] bg-gradient-to-b from-[#2c313a] to-[#171a20] shadow-[0_18px_40px_rgba(0,0,0,0.45)] md:h-3.5">
        <div className="absolute start-1/2 top-1 h-1 w-16 -translate-x-1/2 rounded-full bg-white/10 md:w-20" />
      </div>
    </div>
  );
}
