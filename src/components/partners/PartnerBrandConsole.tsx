'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Globe2, Palette, Radio, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { easeCrystal } from '@/components/landing/crystal/motion';

const THEMES = [
  {
    id: 'nile',
    name: { en: 'Nile Talent', ar: 'نهر المواهب' },
    domain: 'hire.niletalent.com',
    primary: '#F5C16C',
    secondary: '#0F766E',
    sender: { en: 'Nile Careers', ar: 'مسارات نهر' },
  },
  {
    id: 'atlas',
    name: { en: 'Atlas Hire', ar: 'أطلس توظيف' },
    domain: 'interview.atlashire.io',
    primary: '#38BDF8',
    secondary: '#1E3A5F',
    sender: { en: 'Atlas Recruiting', ar: 'أطلس للتوظيف' },
  },
  {
    id: 'oasis',
    name: { en: 'Oasis Academy', ar: 'أكاديمية واحة' },
    domain: 'careers.oasis.academy',
    primary: '#F472B6',
    secondary: '#4C1D95',
    sender: { en: 'Oasis Careers', ar: 'وظائف واحة' },
  },
] as const;

const PREVIEW_LINES = {
  en: [
    { who: 'ai' as const, text: 'Welcome — I am interviewing on behalf of your brand today.' },
    { who: 'candidate' as const, text: 'Excited to be here. Ready when you are.' },
  ],
  ar: [
    { who: 'ai' as const, text: 'مرحباً — أُجري المقابلة اليوم باسم علامتك.' },
    { who: 'candidate' as const, text: 'سعيد بوجودي هنا. جاهز متى ما بدأت.' },
  ],
};

export function PartnerBrandConsole() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [themeIdx, setThemeIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);
  const theme = THEMES[themeIdx];
  const lines = isAr ? PREVIEW_LINES.ar : PREVIEW_LINES.en;

  useEffect(() => {
    const themeTimer = window.setInterval(() => setThemeIdx((i) => (i + 1) % THEMES.length), 4200);
    return () => window.clearInterval(themeTimer);
  }, []);

  useEffect(() => {
    setLineIdx(0);
    const lineTimer = window.setInterval(() => setLineIdx((i) => (i + 1) % lines.length), 2100);
    return () => window.clearInterval(lineTimer);
  }, [themeIdx, lines.length]);

  return (
    <div className="mq-partner-stage overflow-hidden rounded-[2rem] border border-amber-200/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="flex h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ms-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            {isAr ? 'استوديو الهوية' : 'Brand studio'}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/25 bg-amber-200/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-100">
          <Radio size={11} />
          {isAr ? 'معاينة حية' : 'Live preview'}
        </span>
      </div>

      <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4 border-b border-white/10 p-4 md:p-6 lg:border-b-0 lg:border-e">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/35">
            {isAr ? 'محافظ الهوية' : 'Brand kits'}
          </p>
          <div className="space-y-2">
            {THEMES.map((item, i) => {
              const on = themeIdx === i;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setThemeIdx(i)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start transition',
                    on
                      ? 'border border-amber-200/35 bg-amber-200/10'
                      : 'border border-transparent hover:bg-white/[0.04]',
                  )}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white"
                    style={{
                      background: `linear-gradient(135deg, ${item.primary}, ${item.secondary})`,
                    }}
                  >
                    {item.name.en.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm font-bold', on ? 'text-white' : 'text-white/65')}>
                      {isAr ? item.name.ar : item.name.en}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-white/40">{item.domain}</span>
                  </span>
                  {on ? <Palette size={14} className="shrink-0 text-amber-200" /> : null}
                </button>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-2 flex items-center gap-2 text-xs text-white/45">
              <Globe2 size={13} />
              {isAr ? 'النطاق المخصص' : 'Custom domain'}
            </div>
            <p className="font-mono text-sm text-amber-100/90">{theme.domain}</p>
          </div>
        </div>

        <div className="relative min-h-[300px] p-4 md:min-h-[360px] md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
              transition={{ duration: 0.45, ease: easeCrystal }}
              className="flex h-full flex-col"
            >
              <div
                className="mb-4 overflow-hidden rounded-2xl border border-white/10 p-5"
                style={{
                  background: `linear-gradient(145deg, ${theme.secondary}cc 0%, rgba(7,11,20,0.92) 55%, rgba(7,11,20,0.98) 100%)`,
                }}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-black text-[#0a0f18]"
                      style={{ background: theme.primary }}
                    >
                      {theme.name.en.slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">
                        {isAr ? theme.name.ar : theme.name.en}
                      </p>
                      <p className="text-xs text-white/50">
                        {isAr ? theme.sender.ar : theme.sender.en}
                      </p>
                    </div>
                  </div>
                  <Sparkles size={16} style={{ color: theme.primary }} />
                </div>

                <div className="space-y-2.5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${theme.id}-${lineIdx}`}
                      initial={{ opacity: 0, x: isAr ? 12 : -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isAr ? -8 : 8 }}
                      transition={{ duration: 0.35 }}
                      className={cn(
                        'max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        lines[lineIdx].who === 'ai'
                          ? 'border border-white/15 bg-black/25 text-white/90'
                          : 'ms-auto border border-white/10 bg-white/10 text-white/85',
                      )}
                    >
                      {lines[lineIdx].text}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2">
                {[
                  { label: isAr ? 'الأساسي' : 'Primary', color: theme.primary },
                  { label: isAr ? 'الثانوي' : 'Secondary', color: theme.secondary },
                  { label: isAr ? 'المرشّح' : 'Candidate UI', color: '#E8EEF7' },
                ].map((swatch) => (
                  <div
                    key={swatch.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center"
                  >
                    <span
                      className="mx-auto mb-2 block h-8 w-8 rounded-lg border border-white/15"
                      style={{ background: swatch.color }}
                    />
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
                      {swatch.label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
