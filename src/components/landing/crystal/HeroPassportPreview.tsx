'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { easeCrystal } from './motion';

const COMPETENCIES = [
  { en: 'Communication', ar: 'التواصل', score: 90 },
  { en: 'Technical Depth', ar: 'العمق التقني', score: 84 },
  { en: 'Problem Solving', ar: 'حل المشكلات', score: 88 },
  { en: 'Cultural Fit', ar: 'الملاءمة الثقافية', score: 86 },
  { en: 'Confidence', ar: 'الثقة', score: 82 },
] as const;

type Props = {
  locale: string;
  cityEn: string;
  cityAr: string;
  score?: number;
  grade?: string;
  compact?: boolean;
};

/**
 * Animated Interview Passport preview for the landing hero.
 * Shows applicant placeholder name + QR + competency bars — mirrors the real result UI.
 */
export function HeroPassportPreview({
  locale,
  cityEn,
  cityAr,
  score = 86,
  grade = 'A',
  compact = false,
}: Props) {
  const isAr = locale === 'ar';
  const reduceMotion = useReducedMotion();
  const city = isAr ? cityAr : cityEn;

  return (
    <motion.div
      className="mq-hero-passport pointer-events-none select-none"
      dir={isAr ? 'rtl' : 'ltr'}
      initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: easeCrystal }}
      aria-label={
        isAr
          ? `معاينة جواز المقابلة — النتيجة ${score}`
          : `Interview passport preview — score ${score}`
      }
    >
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-teal-300/35 bg-[#070b14]/82 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -6, 0], boxShadow: [
                '0 24px 70px rgba(0,0,0,0.55)',
                '0 28px 80px rgba(20,184,166,0.18)',
                '0 24px 70px rgba(0,0,0,0.55)',
              ] }
        }
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(circle at 12% 0%, rgba(45,212,191,0.28), transparent 42%), linear-gradient(165deg, rgba(14,28,42,0.4), transparent 55%)',
          }}
          aria-hidden
        />
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl"
          style={{
            background:
              'linear-gradient(120deg, transparent 30%, rgba(45,212,191,0.35) 50%, transparent 70%)',
            backgroundSize: '200% 100%',
          }}
          animate={reduceMotion ? undefined : { backgroundPosition: ['100% 0%', '-100% 0%'] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', repeatDelay: 2.2 }}
          aria-hidden
        />

        <div className={`relative ${compact ? 'p-3.5' : 'p-4 md:p-5'}`}>
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300/85">
                {isAr ? 'جواز مقابلتك' : 'Your Interview Passport'}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {isAr ? 'المتقدم: اسمك' : 'Applicant: Your name'}
              </p>
              <p className="mt-0.5 text-[11px] text-white/50">
                {isAr ? `جاهز للتوظيف · ${city}` : `Hire-ready · ${city}`}
              </p>
            </div>
            <span className="shrink-0 rounded-md border border-teal-300/35 bg-teal-400/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-100">
              {isAr ? 'موثّق' : 'Verified'}
            </span>
          </div>

          <div className="mb-3 flex items-end gap-2">
            <motion.span
              className="mq-display text-4xl font-black leading-none text-teal-300 md:text-5xl"
              initial={reduceMotion ? false : { opacity: 0.2, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: easeCrystal }}
              key={`${score}-${city}`}
            >
              {score}
            </motion.span>
            <span className="pb-1 text-lg font-bold text-white/70">{grade}</span>
            <span className="pb-1.5 text-[11px] text-white/40">/100</span>
          </div>

          <ul className={`space-y-2 ${compact ? 'mb-3' : 'mb-3.5'}`}>
            {COMPETENCIES.slice(0, compact ? 3 : 5).map((c, i) => (
              <li key={c.en}>
                <div className="mb-0.5 flex items-center justify-between text-[11px] text-white/65">
                  <span>{isAr ? c.ar : c.en}</span>
                  <span className="font-semibold text-white/80">{c.score}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
                    initial={reduceMotion ? { width: `${c.score}%` } : { width: 0 }}
                    animate={{ width: `${c.score}%` }}
                    transition={{
                      duration: 1.1,
                      delay: reduceMotion ? 0 : 0.15 + i * 0.1,
                      ease: easeCrystal,
                    }}
                    key={`${city}-${c.en}`}
                  />
                </div>
              </li>
            ))}
          </ul>

          {!compact ? (
            <div className="mb-3.5 grid grid-cols-2 gap-2.5 text-[10px] leading-snug text-white/60">
              <div>
                <p className="mb-1 font-bold text-white/45">
                  {isAr ? 'نقاط القوة' : 'Strengths'}
                </p>
                <ul className="space-y-0.5">
                  <li>• {isAr ? 'إجابات منظمة' : 'Clear structure'}</li>
                  <li>• {isAr ? 'أمثلة قوية' : 'Strong examples'}</li>
                </ul>
              </div>
              <div>
                <p className="mb-1 font-bold text-white/45">
                  {isAr ? 'للتحسين' : 'Improvements'}
                </p>
                <ul className="space-y-0.5">
                  <li>• {isAr ? 'أضف أرقاماً' : 'Add metrics'}</li>
                  <li>• {isAr ? 'عمّق التفاصيل' : 'Deeper detail'}</li>
                </ul>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3 border-t border-white/10 pt-3">
            <motion.div
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-white p-1"
              animate={
                reduceMotion
                  ? undefined
                  : { boxShadow: [
                      '0 0 0 0 rgba(45,212,191,0)',
                      '0 0 0 6px rgba(45,212,191,0.18)',
                      '0 0 0 0 rgba(45,212,191,0)',
                    ] }
              }
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Image
                src="/images/passport-qr-demo.png"
                alt=""
                width={56}
                height={56}
                className="h-full w-full object-contain"
                draggable={false}
              />
            </motion.div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-white/80">
                {isAr ? 'امسح للتحقق' : 'Scan to verify'}
              </p>
              <p className="truncate font-mono text-[10px] text-teal-200/70">
                MQB-DEMO
              </p>
              <p className="mt-0.5 text-[10px] text-white/40">
                {isAr ? 'يظهر اسمك بعد المقابلة' : 'Your name appears after the interview'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
