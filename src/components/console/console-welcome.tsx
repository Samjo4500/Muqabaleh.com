'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight, MousePointerClick } from 'lucide-react';
import {
  CONSOLE_PRODUCT,
  getConsoleEdition,
  welcomeStorageKey,
} from '@/lib/console/identity';
import type { TenantType } from '@/lib/console/types';

type Props = {
  tenantSlug: string;
  orgName: string;
  tenantType: TenantType;
};

/** Cinematic beat markers — deliberately paced for executive first impression. */
type Beat = 0 | 1 | 2 | 3 | 4 | 5;

export function ConsoleWelcome({ tenantSlug, orgName, tenantType }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const edition = getConsoleEdition(tenantType);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [beat, setBeat] = useState<Beat>(reduce ? 5 : 0);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(welcomeStorageKey(tenantSlug));
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
    setMounted(true);
  }, [tenantSlug]);

  useEffect(() => {
    if (!open) return;
    if (reduce) {
      setBeat(5);
      return;
    }
    setBeat(0);
    const timers = [
      window.setTimeout(() => setBeat(1), 280), // device rises
      window.setTimeout(() => setBeat(2), 1100), // curtains part / power
      window.setTimeout(() => setBeat(3), 2100), // Jeannie name locks
      window.setTimeout(() => setBeat(4), 3000), // service line
      window.setTimeout(() => setBeat(5), 3800), // CTA ready
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [open, reduce]);

  const dismiss = () => {
    if (beat < 5 && !reduce) return;
    try {
      sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  useEffect(() => {
    if (!open || beat < 5) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        try {
          sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
        } catch {
          /* ignore */
        }
        setOpen(false);
      }
      if (e.key === 'Escape') {
        try {
          sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
        } catch {
          /* ignore */
        }
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, beat, tenantSlug]);

  if (!mounted) return null;

  const EnterIcon = isAr ? ArrowLeft : ArrowRight;
  const serviceLine = isAr ? CONSOLE_PRODUCT.serviceAr : CONSOLE_PRODUCT.serviceEn;
  const canEnter = beat >= 5;
  const nameLetters = (isAr ? 'جيني' : 'Jeannie').split('');

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="mq-reveal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.02,
            filter: 'blur(8px)',
            transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
          }}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
          onClick={() => {
            if (canEnter) dismiss();
          }}
        >
          <div className="mq-reveal-atmosphere" aria-hidden>
            <div className="mq-reveal-wash" />
            <div className="mq-reveal-beams" />
            <div className="mq-reveal-grain" />
            <div className="mq-reveal-vignette" />
          </div>

          <div className="mq-reveal-stage" dir={isAr ? 'rtl' : 'ltr'}>
            <motion.p
              className="mq-reveal-kicker"
              initial={false}
              animate={{ opacity: beat >= 1 ? 1 : 0, y: beat >= 1 ? 0 : -10 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>{isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}</span>
              <span className="mq-reveal-kicker-dot" aria-hidden />
              <span>{isAr ? edition.ar : edition.en}</span>
              <span className="mq-reveal-kicker-dot" aria-hidden />
              <span>{orgName}</span>
            </motion.p>

            <motion.div
              className="mq-reveal-device"
              initial={false}
              animate={{
                opacity: beat >= 1 ? 1 : 0,
                y: beat >= 1 ? 0 : 64,
                scale: beat >= 1 ? 1 : 0.94,
              }}
              transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mq-reveal-chrome-top" aria-hidden>
                <span />
                <span />
                <span />
              </div>

              <div className="mq-reveal-display">
                {/* Power line → fills screen */}
                <motion.div
                  className="mq-reveal-power"
                  initial={false}
                  animate={{
                    opacity: beat >= 2 ? 0 : beat >= 1 ? 1 : 0,
                    scaleX: beat >= 1 ? 1 : 0.05,
                  }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden
                />

                {/* Curtains */}
                <motion.div
                  className="mq-reveal-curtain mq-reveal-curtain-a"
                  initial={false}
                  animate={{ x: beat >= 2 ? (isAr ? '105%' : '-105%') : '0%' }}
                  transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1] }}
                  aria-hidden
                />
                <motion.div
                  className="mq-reveal-curtain mq-reveal-curtain-b"
                  initial={false}
                  animate={{ x: beat >= 2 ? (isAr ? '-105%' : '105%') : '0%' }}
                  transition={{ duration: 1.15, ease: [0.65, 0, 0.35, 1] }}
                  aria-hidden
                />

                {/* Jeannie portrait */}
                <motion.div
                  className="mq-reveal-portrait"
                  initial={false}
                  animate={{
                    opacity: beat >= 2 ? 1 : 0,
                    scale: beat >= 2 ? 1 : 1.08,
                  }}
                  transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image
                    src={edition.jeannieSrc}
                    alt={isAr ? 'جيني' : 'Jeannie'}
                    fill
                    priority
                    quality={95}
                    sizes="(max-width: 900px) 100vw, 1400px"
                    className="object-cover object-[center_14%]"
                  />
                  <div className="mq-reveal-portrait-shade" aria-hidden />
                  <div className="mq-reveal-portrait-glow" aria-hidden />
                </motion.div>

                {/* Light sweep across face */}
                {beat >= 2 && !reduce ? (
                  <motion.div
                    className="mq-reveal-sweep"
                    initial={{ x: isAr ? '40%' : '-40%', opacity: 0 }}
                    animate={{ x: isAr ? '-120%' : '120%', opacity: [0, 0.7, 0] }}
                    transition={{ duration: 1.4, ease: 'easeInOut', delay: 0.15 }}
                    aria-hidden
                  />
                ) : null}

                {/* Giant name + service line ON the display */}
                <div className="mq-reveal-copy">
                  <motion.div
                    className="mq-reveal-name-wrap"
                    initial={false}
                    animate={{
                      opacity: beat >= 3 ? 1 : 0,
                      y: beat >= 3 ? 0 : 28,
                    }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <p className="mq-reveal-name-eyebrow">
                      {isAr ? 'مساعدتكم التنفيذية' : 'Your executive aide'}
                    </p>
                    <h1
                      className="mq-reveal-name"
                      dir={isAr ? 'rtl' : 'ltr'}
                      lang={isAr ? 'ar' : 'en'}
                      aria-label={isAr ? 'جيني' : 'Jeannie'}
                    >
                      {nameLetters.map((ch, i) => (
                        <motion.span
                          key={`${ch}-${i}`}
                          className="mq-reveal-name-char"
                          initial={false}
                          animate={
                            beat >= 3
                              ? { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
                              : { opacity: 0, y: 36, rotateX: -40, filter: 'blur(8px)' }
                          }
                          transition={{
                            duration: 0.55,
                            delay: reduce ? 0 : 0.04 * i,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        >
                          {ch}
                        </motion.span>
                      ))}
                    </h1>
                  </motion.div>

                  <motion.p
                    className="mq-reveal-service"
                    dir={isAr ? 'rtl' : 'ltr'}
                    initial={false}
                    animate={{
                      opacity: beat >= 4 ? 1 : 0,
                      y: beat >= 4 ? 0 : 18,
                      letterSpacing: beat >= 4 ? (isAr ? '0em' : '0.04em') : '0.18em',
                    }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {serviceLine}
                  </motion.p>
                </div>
              </div>

              <div className="mq-reveal-chrome-base" aria-hidden>
                <div className="mq-reveal-stand-neck" />
                <div className="mq-reveal-stand-foot" />
              </div>
            </motion.div>

            <motion.div
              className="mq-reveal-cta-block"
              initial={false}
              animate={{
                opacity: canEnter ? 1 : 0,
                y: canEnter ? 0 : 24,
                pointerEvents: canEnter ? 'auto' : 'none',
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="mq-reveal-cta"
                onClick={dismiss}
                autoFocus={canEnter}
              >
                <MousePointerClick size={20} strokeWidth={1.6} />
                <span>{isAr ? 'اضغط للدخول' : 'Click to enter'}</span>
                <EnterIcon size={20} strokeWidth={1.75} />
              </button>

              <div className="mq-reveal-cta-row">
                <button type="button" className="mq-reveal-proceed" onClick={dismiss}>
                  {isAr ? 'متابعة' : 'Proceed'}
                </button>
                <span className="mq-reveal-cta-sep" aria-hidden />
                <button type="button" className="mq-reveal-continue" onClick={dismiss}>
                  {isAr ? 'استمرار' : 'Continue'}
                </button>
              </div>

              <p className="mq-reveal-hint">
                {isAr
                  ? 'أو اضغط في أي مكان · Enter'
                  : 'Or click anywhere · press Enter'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
