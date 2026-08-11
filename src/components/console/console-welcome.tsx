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

type Beat = 0 | 1 | 2 | 3;

/**
 * Frameless cinematic portal welcome.
 * Never split Arabic into per-letter spans — that breaks connected script.
 */
export function ConsoleWelcome({ tenantSlug, orgName, tenantType }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const edition = getConsoleEdition(tenantType);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [beat, setBeat] = useState<Beat>(reduce ? 3 : 0);

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
      setBeat(3);
      return;
    }
    setBeat(0);
    const timers = [
      window.setTimeout(() => setBeat(1), 120), // Jeannie swipes in
      window.setTimeout(() => setBeat(2), 1400), // copy
      window.setTimeout(() => setBeat(3), 2200), // CTAs
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [open, reduce]);

  const markSeenAndClose = () => {
    try {
      sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const dismiss = () => {
    if (beat < 3 && !reduce) return;
    markSeenAndClose();
  };

  useEffect(() => {
    if (!open || beat < 3) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        markSeenAndClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- markSeenAndClose closes over tenantSlug
  }, [open, beat, tenantSlug]);

  if (!mounted) return null;

  const EnterIcon = isAr ? ArrowLeft : ArrowRight;
  const canEnter = beat >= 3;
  const portalLine = isAr ? CONSOLE_PRODUCT.portalAr : CONSOLE_PRODUCT.portalEn;
  const serviceLine = isAr ? CONSOLE_PRODUCT.serviceAr : CONSOLE_PRODUCT.serviceEn;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="mq-portal"
          lang={isAr ? 'ar' : 'en'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
          }}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
          onClick={() => {
            if (canEnter) dismiss();
          }}
        >
          {/* Full-bleed Jeannie — no device frame */}
          <div className="mq-portal-media" aria-hidden={!open}>
            <motion.div
              className="mq-portal-swipe"
              initial={false}
              animate={
                reduce
                  ? { y: '0%', clipPath: 'inset(0% 0% 0% 0%)' }
                  : beat >= 1
                    ? { y: '0%', clipPath: 'inset(0% 0% 0% 0%)' }
                    : { y: '18%', clipPath: 'inset(100% 0% 0% 0%)' }
              }
              transition={{ duration: 1.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={edition.jeannieSrc}
                alt=""
                fill
                priority
                quality={95}
                sizes="100vw"
                className="mq-portal-img"
              />
            </motion.div>

            <div className="mq-portal-shade" aria-hidden />
            <div className="mq-portal-grain" aria-hidden />
          </div>

          <div
            className="mq-portal-content"
            dir={isAr ? 'rtl' : 'ltr'}
            lang={isAr ? 'ar' : 'en'}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.p
              className="mq-portal-org"
              initial={false}
              animate={{ opacity: beat >= 2 ? 1 : 0, y: beat >= 2 ? 0 : 16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              {orgName}
              <span aria-hidden> · </span>
              {isAr ? edition.ar : edition.en}
            </motion.p>

            <motion.h1
              className="mq-portal-title"
              initial={false}
              animate={{
                opacity: beat >= 2 ? 1 : 0,
                y: beat >= 2 ? 0 : 36,
                filter: beat >= 2 ? 'blur(0px)' : 'blur(12px)',
              }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              {portalLine}
            </motion.h1>

            <motion.p
              className="mq-portal-service"
              initial={false}
              animate={{
                opacity: beat >= 2 ? 1 : 0,
                y: beat >= 2 ? 0 : 24,
              }}
              transition={{ duration: 0.7, delay: reduce ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {serviceLine}
            </motion.p>

            <motion.div
              className="mq-portal-actions"
              initial={false}
              animate={{
                opacity: canEnter ? 1 : 0,
                y: canEnter ? 0 : 28,
                pointerEvents: canEnter ? 'auto' : 'none',
              }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                className="mq-portal-enter"
                onClick={dismiss}
                autoFocus={canEnter}
              >
                <span>{isAr ? 'دخول' : 'Enter'}</span>
                <EnterIcon size={22} strokeWidth={2} />
              </button>

              <div className="mq-portal-secondary">
                <button type="button" className="mq-portal-btn-ghost" onClick={dismiss}>
                  {isAr ? 'متابعة' : 'Proceed'}
                </button>
                <button type="button" className="mq-portal-btn-ghost" onClick={dismiss}>
                  {isAr ? 'استمرار' : 'Continue'}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
