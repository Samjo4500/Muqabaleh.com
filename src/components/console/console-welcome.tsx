'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import {
  Fingerprint,
  Home,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { welcomeStorageKey } from '@/lib/console/identity';
import { getWelcomeThemeVisual } from '@/lib/console/welcome-copy';
import type { TenantType } from '@/lib/console/types';
import { cn } from '@/lib/utils';

type Props = {
  tenantSlug: string;
  orgName: string;
  tenantType: TenantType;
};

type ScanState = 'idle' | 'scanning' | 'granted';

/**
 * Muqabaleh OS — glass workspace welcome.
 * Copy is sourced from i18n (`console.welcomeOs`).
 */
export function ConsoleWelcome({ tenantSlug, orgName }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations('console');
  const tw = useTranslations('console.welcomeOs');
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');

  const theme = useMemo(() => getWelcomeThemeVisual(tenantSlug), [tenantSlug]);
  const isFallback = theme.i18nKey === 'fallback';

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(welcomeStorageKey(tenantSlug));
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
    setMounted(true);
  }, [tenantSlug]);

  const markSeen = () => {
    try {
      sessionStorage.setItem(welcomeStorageKey(tenantSlug), '1');
    } catch {
      /* ignore */
    }
  };

  const close = () => {
    markSeen();
    setOpen(false);
  };

  const triggerEnter = () => {
    if (scanState !== 'idle') return;
    if (reduce) {
      close();
      return;
    }
    setScanState('scanning');
    window.setTimeout(() => {
      setScanState('granted');
      window.setTimeout(() => close(), 900);
    }, 1600);
  };

  useEffect(() => {
    if (!open || scanState !== 'idle') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerEnter();
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scanState, tenantSlug]);

  if (!mounted) return null;

  const title =
    scanState === 'scanning'
      ? tw('scanningTitle')
      : scanState === 'granted'
        ? tw('grantedTitle')
        : isFallback
          ? tw('fallback.title', { orgName })
          : tw(`${theme.i18nKey}.title`);

  const subtitle =
    scanState === 'scanning'
      ? tw('scanningDetail')
      : scanState === 'granted'
        ? tw('grantedDetail')
        : isFallback
          ? tw('fallback.subtitle')
          : tw(`${theme.i18nKey}.subtitle`);

  const nav = [
    { icon: LayoutDashboard, key: 'navDashboard' as const, active: true },
    { icon: Users, key: 'navTeam' as const, active: false },
    { icon: Home, key: 'navJobs' as const, active: false },
    { icon: Settings, key: 'navSettings' as const, active: false },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.section
          className="mq-os fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-[#030712] p-4 md:p-6"
          lang={isAr ? 'ar' : 'en'}
          dir={isAr ? 'rtl' : 'ltr'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.45 } }}
          role="dialog"
          aria-modal="true"
          aria-label={tw('dialogLabel')}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background: `
                radial-gradient(circle at 20% 30%, ${theme.glow} 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(11, 25, 44, 0.9) 0%, transparent 60%),
                radial-gradient(circle at 50% 50%, #030712 0%, #030712 100%)
              `,
            }}
          />

          <motion.div
            className={cn(
              'relative z-10 flex h-[min(650px,92dvh)] w-full max-w-[1050px] overflow-hidden rounded-[24px]',
              'border border-white/[0.09] bg-white/[0.03] shadow-[0_50px_100px_rgba(0,0,0,0.6)]',
              'backdrop-blur-[40px]',
            )}
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={cn(
                'absolute top-6 z-20 flex gap-2',
                isAr ? 'right-6' : 'left-6',
              )}
              aria-hidden
            >
              <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
              <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            </div>

            <aside
              className={cn(
                'hidden w-[250px] flex-col justify-between border-white/[0.09] bg-white/[0.01] px-6 pb-8 pt-16 md:flex',
                isAr ? 'border-l' : 'border-r',
              )}
            >
              <ul className="flex flex-col gap-2">
                {nav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.key}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-3 text-xs transition-colors',
                        item.active
                          ? 'bg-white/[0.06] font-semibold text-white'
                          : 'font-medium text-white/50',
                      )}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                      <span>{t(item.key)}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-center text-[10px] font-bold tracking-wider text-white/20">
                MUQABALEH OS v2.4
              </p>
            </aside>

            <div className="relative flex flex-1 flex-col items-center justify-center p-8 md:p-16">
              <div
                className="pointer-events-none absolute h-[200px] w-[200px] rounded-full blur-[30px]"
                style={{ background: theme.glow }}
                aria-hidden
              />

              <div className="mb-8 w-full max-w-[420px] transition-transform duration-500 hover:scale-[1.02] md:mb-10">
                <BrandLogo
                  size="hero"
                  priority
                  className="mx-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                />
              </div>

              <p
                className={cn(
                  'mb-4 text-center font-bold transition-colors duration-500 md:mb-5',
                  isAr
                    ? 'text-xl tracking-normal md:text-2xl'
                    : 'text-xl uppercase tracking-[0.14em] md:text-2xl',
                  scanState === 'granted' ? 'text-emerald-400' : theme.accent,
                )}
              >
                {title}
              </p>

              {!isFallback && scanState === 'idle' ? (
                <p
                  className={cn(
                    'mb-3 text-center text-xl font-semibold text-white md:text-2xl',
                    isAr && 'font-[family-name:var(--font-body-ar)]',
                  )}
                >
                  {orgName}
                </p>
              ) : null}

              <p
                className={cn(
                  'mb-10 max-w-[560px] text-center text-base font-medium leading-relaxed text-gray-300 md:mb-12 md:text-xl md:leading-8',
                  isAr && 'font-[family-name:var(--font-body-ar)] leading-8',
                )}
              >
                {subtitle}
              </p>

              <button
                type="button"
                onClick={triggerEnter}
                aria-label={tw('ctaAria')}
                className={cn(
                  'relative flex h-20 w-20 items-center justify-center rounded-full border bg-white/[0.02] transition-all duration-500',
                  scanState === 'granted' &&
                    'scale-105 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]',
                  scanState === 'scanning' &&
                    'animate-pulse border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
                  scanState === 'idle' &&
                    cn(
                      'border-white/[0.09] hover:scale-105',
                      theme.border,
                      'hover:shadow-[0_0_30px_rgba(211,172,101,0.35)]',
                    ),
                )}
              >
                {scanState !== 'granted' && !reduce ? (
                  <span
                    className={cn(
                      'pointer-events-none absolute -inset-1 rounded-full border-2 border-transparent opacity-60',
                      scanState === 'scanning'
                        ? 'mq-os-spin-fast border-t-amber-500 border-b-amber-500'
                        : 'mq-os-spin border-t-[#d3ac65] border-b-[#d3ac65]',
                    )}
                    style={
                      scanState === 'idle'
                        ? {
                            borderTopColor: theme.ring,
                            borderBottomColor: theme.ring,
                          }
                        : undefined
                    }
                    aria-hidden
                  />
                ) : null}

                <Fingerprint
                  size={32}
                  strokeWidth={1.5}
                  className={cn(
                    'transition-colors duration-400',
                    scanState === 'granted' && 'text-emerald-400',
                    scanState === 'scanning' && 'text-amber-400',
                    scanState === 'idle' && 'text-[#d3ac65]',
                  )}
                  style={scanState === 'idle' ? { color: theme.ring } : undefined}
                />
              </button>

              <p
                className={cn(
                  'mt-6 text-center text-xl font-semibold tracking-wide text-white/70 md:text-2xl',
                  isAr && 'font-[family-name:var(--font-body-ar)] tracking-normal',
                )}
              >
                {tw('cta')}
              </p>
            </div>
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
