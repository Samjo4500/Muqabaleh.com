'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocale } from 'next-intl';
import {
  Fingerprint,
  Home,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { welcomeStorageKey } from '@/lib/console/identity';
import type { TenantType } from '@/lib/console/types';
import { cn } from '@/lib/utils';

type Props = {
  tenantSlug: string;
  orgName: string;
  tenantType: TenantType;
};

type ScanState = 'idle' | 'scanning' | 'granted';

type ConsoleTheme = {
  eyebrowEn: string;
  eyebrowAr: string;
  descEn: string;
  descAr: string;
  accent: string;
  border: string;
  glow: string;
  ring: string;
};

const THEMES: Record<string, ConsoleTheme> = {
  'najm-tech': {
    eyebrowEn: 'NAJM TECH WORKSPACE · ACTIVE',
    eyebrowAr: 'مساحة نجم تك · نشطة',
    descEn:
      'Welcome back, Director. Access your AI evaluation boards, analyze candidate performance, and verify skills.',
    descAr:
      'مرحباً بعودتكم. ادخوا لوحات التقييم الذكية، حلّلوا أداء المرشحين، وتحققوا من المهارات.',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/25',
    glow: 'rgba(34, 211, 238, 0.14)',
    ring: '#22d3ee',
  },
  'atlas-agency': {
    eyebrowEn: 'ATLAS AGENCY · PARTNER OS',
    eyebrowAr: 'أطلس إيجنسي · نظام الشركاء',
    descEn:
      'Welcome back, Partner. Configure client workspaces, audit branded portals, and track placement commissions.',
    descAr:
      'مرحباً بعودتكم. هيّئوا مساحات العملاء، راجعوا البوابات ذات العلامة، وتتبعوا العمولات.',
    accent: 'text-sky-400',
    border: 'border-sky-500/25',
    glow: 'rgba(56, 189, 248, 0.14)',
    ring: '#38bdf8',
  },
  'bayan-university': {
    eyebrowEn: 'BAYAN UNIVERSITY · CAREER TERMINAL',
    eyebrowAr: 'جامعة بيان · محطة المسار المهني',
    descEn:
      'Welcome back, Dean. Audit cohort readiness, inspect communication analytics, and review scores.',
    descAr:
      'مرحباً بعودتكم. راجعوا جاهزية الدفعات، افحصوا تحليلات التواصل، واستعرضوا الدرجات.',
    accent: 'text-[#d3ac65]',
    border: 'border-[#d3ac65]/25',
    glow: 'rgba(211, 172, 101, 0.14)',
    ring: '#d3ac65',
  },
};

const FALLBACK: ConsoleTheme = {
  eyebrowEn: 'JEANNIE SUITE · SECURED',
  eyebrowAr: 'جناح جيني · مؤمّن',
  descEn:
    'Welcome back. Verify secure credentials and enter your active candidate screening workspace.',
  descAr:
    'مرحباً بعودتكم. أكّدوا بيانات الدخول الآمنة وادخلوا مساحة فحص المرشحين.',
  accent: 'text-[#d3ac65]',
  border: 'border-[#d3ac65]/25',
  glow: 'rgba(211, 172, 101, 0.14)',
  ring: '#d3ac65',
};

/**
 * Muqabaleh OS — glass workspace welcome with biometric enter.
 */
export function ConsoleWelcome({ tenantSlug, orgName }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scanState, setScanState] = useState<ScanState>('idle');

  const config = useMemo(
    () => THEMES[tenantSlug] || FALLBACK,
    [tenantSlug],
  );

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

  const triggerBiometricScan = () => {
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
        triggerBiometricScan();
      }
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scanState, tenantSlug]);

  if (!mounted) return null;

  const eyebrow =
    scanState === 'scanning'
      ? isAr
        ? 'جارٍ المسح البيومتري... التحقق من الصلاحيات'
        : 'SCANNING BIOMETRICS… VERIFYING CREDENTIALS'
      : scanState === 'granted'
        ? isAr
          ? 'تم منح الوصول · مصرّح'
          : 'ACCESS GRANTED · AUTHORIZED'
        : isAr
          ? config.eyebrowAr
          : config.eyebrowEn;

  const description =
    scanState === 'scanning'
      ? isAr
        ? 'تحليل المفتاح البيومتري... الوصول إلى العقدة الآمنة... تأكيد الصلاحيات.'
        : 'Analyzing biometric key… Accessing secure datastore… Confirming credentials.'
      : scanState === 'granted'
        ? isAr
          ? 'اكتمل فحص الأمان. جارٍ فتح مساحة العمل...'
          : 'Security check complete. Opening your workspace…'
        : isAr
          ? config.descAr
          : config.descEn;

  const nav = [
    { icon: LayoutDashboard, en: 'Dashboard', ar: 'لوحة التحكم', active: true },
    { icon: Users, en: 'Candidates', ar: 'المرشحون', active: false },
    { icon: Home, en: 'Templates', ar: 'القوالب', active: false },
    { icon: Settings, en: 'Settings', ar: 'الإعدادات', active: false },
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
          aria-label={isAr ? 'مرحباً بكم في جناح جيني' : 'Welcome to Jeannie Suite'}
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background: `
                radial-gradient(circle at 20% 30%, ${config.glow} 0%, transparent 50%),
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
                      key={item.en}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-3 text-xs transition-colors',
                        item.active
                          ? 'bg-white/[0.06] font-semibold text-white'
                          : 'font-medium text-white/50',
                      )}
                    >
                      <Icon size={16} strokeWidth={1.75} />
                      <span>{isAr ? item.ar : item.en}</span>
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
                style={{ background: config.glow }}
                aria-hidden
              />

              <div className="mb-8 w-full max-w-[420px] transition-transform duration-500 hover:scale-[1.02] md:mb-10">
                <BrandLogo size="hero" priority className="mx-auto drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]" />
              </div>

              <p
                className={cn(
                  'mb-3 text-center text-[11px] font-bold uppercase tracking-[0.22em] transition-colors duration-500 md:mb-4 md:text-xs',
                  scanState === 'granted' ? 'text-emerald-400' : config.accent,
                )}
              >
                {eyebrow}
              </p>

              <p className="mb-2 text-center text-sm font-medium text-white/80 md:text-base">
                {orgName}
              </p>

              <p
                className={cn(
                  'mb-10 max-w-[500px] text-center text-xs font-medium leading-relaxed text-gray-400 md:mb-12 md:text-sm',
                  isAr && 'font-[family-name:var(--font-body-ar)] leading-7',
                )}
              >
                {description}
              </p>

              <button
                type="button"
                onClick={triggerBiometricScan}
                aria-label={isAr ? 'مسح بيومتري للدخول' : 'Biometric scan to enter'}
                className={cn(
                  'relative flex h-20 w-20 items-center justify-center rounded-full border bg-white/[0.02] transition-all duration-500',
                  scanState === 'granted' &&
                    'scale-105 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)]',
                  scanState === 'scanning' &&
                    'animate-pulse border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
                  scanState === 'idle' &&
                    cn(
                      'border-white/[0.09] hover:scale-105',
                      config.border,
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
                        ? { borderTopColor: config.ring, borderBottomColor: config.ring }
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
                  style={scanState === 'idle' ? { color: config.ring } : undefined}
                />
              </button>

              <p className="mt-6 text-center text-[11px] tracking-wide text-white/35">
                {isAr
                  ? 'اضغط للمصادقة · Enter'
                  : 'Tap to authenticate · press Enter'}
              </p>
            </div>
          </motion.div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
