'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

type Phase = 'boot' | 'reveal' | 'speak' | 'ready';

export function ConsoleWelcome({ tenantSlug, orgName, tenantType }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const edition = getConsoleEdition(tenantType);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>(reduce ? 'ready' : 'boot');

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(welcomeStorageKey(tenantSlug));
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, [tenantSlug]);

  useEffect(() => {
    if (!open || reduce) {
      if (open) setPhase('ready');
      return;
    }
    setPhase('boot');
    const t1 = window.setTimeout(() => setPhase('reveal'), 900);
    const t2 = window.setTimeout(() => setPhase('speak'), 1900);
    const t3 = window.setTimeout(() => setPhase('ready'), 3000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [open, reduce]);

  const dismiss = () => {
    try {
      sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!ready) return null;

  const EnterIcon = isAr ? ArrowLeft : ArrowRight;
  const serviceLine = isAr ? CONSOLE_PRODUCT.serviceAr : CONSOLE_PRODUCT.serviceEn;
  const showPortrait = phase !== 'boot';
  const showSpeech = phase === 'speak' || phase === 'ready';
  const showChrome = phase === 'ready';

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="mq-suite-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
        >
          <div className="mq-suite-room" aria-hidden>
            <div className="mq-suite-room-wash" />
            <div className="mq-suite-room-vignette" />
            <div className="mq-suite-room-floor" />
          </div>

          <div className="mq-suite-composition">
            <motion.header
              className="mq-suite-masthead"
              initial={reduce ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mq-suite-product">
                {isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
              </p>
              <span className="mq-suite-sep" aria-hidden />
              <p className="mq-suite-edition">
                {isAr ? edition.ar : edition.en}
              </p>
            </motion.header>

            <motion.div
              className="mq-suite-desk"
              initial={reduce ? false : { opacity: 0, y: 48, rotateX: 8 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 1.05, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mq-suite-laptop">
                <div className="mq-suite-lid">
                  <div className="mq-suite-bezel">
                    <span className="mq-suite-camera" aria-hidden />
                    <div className="mq-suite-screen">
                      <motion.div
                        className="mq-suite-boot"
                        initial={false}
                        animate={{
                          opacity: showPortrait ? 0 : 1,
                          scale: showPortrait ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        aria-hidden
                      />

                      <motion.div
                        className="mq-suite-portrait"
                        initial={false}
                        animate={{
                          opacity: showPortrait ? 1 : 0,
                          scale: showPortrait ? 1 : 1.06,
                          filter: showPortrait
                            ? 'blur(0px) brightness(1)'
                            : 'blur(14px) brightness(0.7)',
                        }}
                        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <Image
                          src={edition.jeannieSrc}
                          alt={isAr ? 'جيني' : 'Jeannie'}
                          fill
                          priority
                          quality={92}
                          sizes="(max-width: 768px) 92vw, 920px"
                          className="object-cover object-[center_16%]"
                        />
                        <div className="mq-suite-portrait-shade" aria-hidden />
                        <div className="mq-suite-screen-gloss" aria-hidden />
                      </motion.div>

                      <AnimatePresence>
                        {showSpeech ? (
                          <motion.div
                            className="mq-suite-speech"
                            initial={
                              reduce
                                ? false
                                : { opacity: 0, y: 22, filter: 'blur(10px)' }
                            }
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                          >
                            <div className="mq-suite-speech-plate">
                              <p className="mq-suite-speech-label">
                                {isAr ? 'جيني' : 'Jeannie'}
                              </p>
                              <p
                                className="mq-suite-speech-line"
                                dir={isAr ? 'rtl' : 'ltr'}
                              >
                                {serviceLine}
                              </p>
                              <span className="mq-suite-speech-rule" aria-hidden />
                            </div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <div className="mq-suite-hinge" aria-hidden />
                <div className="mq-suite-base" aria-hidden>
                  <div className="mq-suite-deck" />
                  <div className="mq-suite-trackpad" />
                </div>
                <div className="mq-suite-shadow" aria-hidden />
              </div>
            </motion.div>

            <motion.div
              className="mq-suite-footer"
              initial={false}
              animate={{
                opacity: showChrome ? 1 : 0,
                y: showChrome ? 0 : 16,
              }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mq-suite-org">{orgName}</p>
              <p className="mq-suite-sub">
                {isAr ? edition.welcomeAr : edition.welcomeEn}
              </p>
              <p className="mq-suite-tagline">
                {isAr ? CONSOLE_PRODUCT.taglineAr : CONSOLE_PRODUCT.taglineEn}
              </p>

              <div className="mq-suite-actions">
                <button
                  type="button"
                  className="mq-suite-enter"
                  onClick={dismiss}
                >
                  <span>{isAr ? 'ادخل الجناح' : 'Enter the Suite'}</span>
                  <EnterIcon size={16} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  className="mq-suite-skip"
                  onClick={dismiss}
                >
                  {isAr ? 'متابعة مباشرة' : 'Continue'}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
