'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import { JeannieNameLockup } from '@/components/landing/crystal/JeannieNameLockup';
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

export function ConsoleWelcome({ tenantSlug, orgName, tenantType }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const edition = getConsoleEdition(tenantType);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(welcomeStorageKey(tenantSlug));
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
    setReady(true);
  }, [tenantSlug]);

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="mq-welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
        >
          <div className="mq-welcome-aurora" aria-hidden />
          <div className="mq-welcome-grid" aria-hidden />

          {!reduce
            ? Array.from({ length: 18 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="mq-welcome-particle"
                  style={{
                    left: `${6 + ((i * 17) % 88)}%`,
                    top: `${10 + ((i * 23) % 75)}%`,
                  }}
                  animate={{
                    y: [0, -14, 0],
                    opacity: [0.15, 0.55, 0.15],
                    scale: [0.8, 1.15, 0.8],
                  }}
                  transition={{
                    duration: 3.2 + (i % 5) * 0.35,
                    repeat: Infinity,
                    delay: i * 0.12,
                    ease: 'easeInOut',
                  }}
                />
              ))
            : null}

          <motion.div
            className="mq-welcome-stage"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.99 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.p
              className="mq-welcome-kicker"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <Sparkles size={13} strokeWidth={1.5} />
              {isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
              <span className="opacity-50">·</span>
              {isAr ? edition.ar : edition.en}
            </motion.p>

            <div className="mq-welcome-portrait-wrap">
              <motion.div
                className="mq-welcome-orbit mq-welcome-orbit-a"
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="mq-welcome-orbit mq-welcome-orbit-b"
                animate={reduce ? undefined : { rotate: -360 }}
                transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="mq-welcome-portrait"
                initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={edition.jeannieSrc}
                  alt={isAr ? 'جيني' : 'Jeannie'}
                  fill
                  priority
                  sizes="280px"
                  className="object-cover object-[center_18%]"
                />
                <span className="mq-welcome-portrait-glow" aria-hidden />
              </motion.div>
            </div>

            <motion.div
              className="mt-6"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.55 }}
            >
              <JeannieNameLockup
                size="lg"
                priority
                avatarSrc={edition.jeannieSrc}
                className="justify-center"
              />
            </motion.div>

            <motion.h2
              className="mq-welcome-title"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.55 }}
            >
              {isAr ? edition.welcomeAr : edition.welcomeEn}
            </motion.h2>

            <motion.p
              className="mq-welcome-org"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.5 }}
            >
              {orgName}
            </motion.p>

            <motion.p
              className="mq-welcome-line"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.55 }}
            >
              {isAr ? edition.lineAr : edition.lineEn}
            </motion.p>

            <motion.div
              className="mq-welcome-actions"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <button type="button" className="mq-welcome-enter" onClick={dismiss}>
                <span>{isAr ? 'ادخل الأتيليه' : 'Enter the atelier'}</span>
                <EnterIcon size={16} strokeWidth={1.5} />
              </button>
              <button type="button" className="mq-welcome-skip" onClick={dismiss}>
                {isAr ? 'تخطّي' : 'Skip'}
              </button>
            </motion.div>

            <motion.p
              className="mq-welcome-foot"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {isAr ? CONSOLE_PRODUCT.taglineAr : CONSOLE_PRODUCT.taglineEn}
            </motion.p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
