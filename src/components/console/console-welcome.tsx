'use client';

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

/**
 * Quiet executive portal gate.
 * No photo reveal. No device frame. Whole Arabic strings only.
 */
export function ConsoleWelcome({ tenantSlug, orgName, tenantType }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const edition = getConsoleEdition(tenantType);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(!!reduce);

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
      setReady(true);
      return;
    }
    setReady(false);
    const t = window.setTimeout(() => setReady(true), 480);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

  const close = () => {
    try {
      sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  const dismiss = () => {
    if (!ready && !reduce) return;
    close();
  };

  useEffect(() => {
    if (!open || !ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ready, tenantSlug]);

  if (!mounted) return null;

  const EnterIcon = isAr ? ArrowLeft : ArrowRight;
  const portalLine = isAr ? CONSOLE_PRODUCT.portalAr : CONSOLE_PRODUCT.portalEn;
  const serviceLine = isAr ? CONSOLE_PRODUCT.serviceAr : CONSOLE_PRODUCT.serviceEn;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="mq-gate"
          lang={isAr ? 'ar' : 'en'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          role="dialog"
          aria-modal="true"
          aria-label={isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
        >
          <div className="mq-gate-bg" aria-hidden />

          <motion.div
            className="mq-gate-panel"
            dir={isAr ? 'rtl' : 'ltr'}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mq-gate-kicker">
              {isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en}
              <span aria-hidden> · </span>
              {isAr ? edition.ar : edition.en}
            </p>

            <p className="mq-gate-org">{orgName}</p>

            <h1 className="mq-gate-title">{portalLine}</h1>

            <p className="mq-gate-service">{serviceLine}</p>

            <motion.div
              className="mq-gate-actions"
              initial={false}
              animate={{ opacity: ready ? 1 : 0.35, y: ready ? 0 : 8 }}
              transition={{ duration: 0.35 }}
            >
              <button
                type="button"
                className="mq-gate-enter"
                onClick={dismiss}
                disabled={!ready && !reduce}
                autoFocus={ready}
              >
                <span>{isAr ? 'دخول' : 'Enter'}</span>
                <EnterIcon size={22} strokeWidth={2} />
              </button>

              <div className="mq-gate-row">
                <button
                  type="button"
                  className="mq-gate-secondary"
                  onClick={dismiss}
                  disabled={!ready && !reduce}
                >
                  {isAr ? 'متابعة' : 'Proceed'}
                </button>
                <button
                  type="button"
                  className="mq-gate-secondary"
                  onClick={dismiss}
                  disabled={!ready && !reduce}
                >
                  {isAr ? 'استمرار' : 'Continue'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
