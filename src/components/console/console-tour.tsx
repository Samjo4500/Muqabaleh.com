'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { markTourDone, readTourDone } from '@/lib/console/onboarding';
import { cn } from '@/lib/utils';

type Step = {
  id: string;
  target: string;
};

const STEPS: Step[] = [
  { id: 'dashboard', target: '[data-tour="kpi-cards"]' },
  { id: 'passports', target: '[data-tour="passport-feed"]' },
  { id: 'pipeline', target: '[data-tour="nav-pipeline"]' },
  { id: 'createJob', target: '[data-tour="cta-create-job"]' },
  { id: 'invite', target: '[data-tour="nav-team"]' },
];

type Props = {
  tenantSlug: string;
  /** Start after welcome overlay is gone */
  enabled: boolean;
};

export function ConsoleTour({ tenantSlug, enabled }: Props) {
  const t = useTranslations('console.onboarding');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [box, setBox] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (readTourDone(tenantSlug)) return;
    // Wait for welcome exit animation + dashboard paint before overlaying.
    const tmr = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(tmr);
  }, [enabled, tenantSlug]);

  useEffect(() => {
    if (!open) return;
    const measure = () => {
      const el = document.querySelector(STEPS[step]?.target || '');
      if (el) {
        setBox(el.getBoundingClientRect());
        el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      } else {
        setBox(null);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, step, reduce]);

  const finish = () => {
    markTourDone(tenantSlug);
    setOpen(false);
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  if (!open) return null;

  const pad = 8;
  const highlight = box
    ? {
        top: Math.max(8, box.top - pad),
        left: Math.max(8, box.left - pad),
        width: box.width + pad * 2,
        height: box.height + pad * 2,
      }
    : null;

  const tipStyle = (() => {
    if (!highlight) {
      return { top: '30%', left: '50%', transform: 'translateX(-50%)' as const };
    }
    const below = highlight.top + highlight.height + 12;
    const spaceBelow = window.innerHeight - below;
    const top = spaceBelow > 180 ? below : Math.max(12, highlight.top - 170);
    const left = Math.min(
      Math.max(16, highlight.left),
      window.innerWidth - 340,
    );
    return { top, left };
  })();

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[96]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={t('tourTitle')}
      >
        <div className="absolute inset-0 bg-black/55" onClick={finish} />
        {highlight ? (
          <div
            className="pointer-events-none absolute rounded-xl ring-2 ring-[var(--c-primary)] ring-offset-2 ring-offset-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]"
            style={highlight}
          />
        ) : null}

        <motion.div
          className={cn(
            'absolute z-10 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#0b1220] p-4 text-white shadow-2xl',
          )}
          style={tipStyle}
          dir={isAr ? 'rtl' : 'ltr'}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          key={step}
        >
          <p className="text-[11px] font-medium tracking-wide text-teal-300/90">
            {t('tourProgress', { current: step + 1, total: STEPS.length })}
          </p>
          <h3 className="mt-2 text-base font-semibold leading-snug">
            {t(`tour_${STEPS[step].id}_title`)}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-white/70">
            {t(`tour_${STEPS[step].id}_body`)}
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={finish}
              className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white"
            >
              {t('skip')}
            </button>
            <div className="flex items-center gap-1.5" aria-hidden>
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    i === step ? 'bg-teal-300' : 'bg-white/25',
                  )}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-teal-400 px-3 py-2 text-sm font-semibold text-teal-950"
            >
              {step >= STEPS.length - 1 ? t('done') : t('next')}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
