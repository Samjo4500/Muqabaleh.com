'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function GateShell({
  isAr,
  children,
  footer,
  label,
  onClose,
}: {
  isAr: boolean;
  children: ReactNode;
  footer?: ReactNode;
  label: string;
  onClose?: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = [
        ...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ].filter((el) => el.offsetParent !== null || el.tagName === 'A');
      if (!nodes.length) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0A0E17]/80 sm:items-center"
      role="presentation"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={titleId}
        className="flex h-[100svh] w-full flex-col overflow-y-auto border-white/10 bg-[#0D1117] sm:h-auto sm:max-h-[92vh] sm:max-w-[480px] sm:rounded-[20px] sm:border"
      >
        <div className="flex justify-center px-6 pt-6">
          <BrandLogo size="sm" />
        </div>
        <div id={titleId} className="sr-only">
          {label}
        </div>
        <div className="flex-1 px-6 pb-6 pt-4">{children}</div>
        {footer ? (
          <div className="px-6 pb-6 text-center text-[11px] uppercase tracking-[0.14em] text-white/35">
            {footer}
          </div>
        ) : (
          <div className="px-6 pb-6 text-center text-[11px] uppercase tracking-[0.14em] text-white/35">
            MUQABALEH.COM
          </div>
        )}
      </div>
    </div>
  );
}

export function GateField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/40">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-[#ff4757]">{error}</span> : null}
    </label>
  );
}

export const gateInputClass =
  'min-h-12 w-full rounded-xl border border-white/10 bg-[#1A1F2E] px-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C]';

export const gateCtaClass =
  'inline-flex h-12 w-full items-center justify-center rounded-3xl bg-[#C9A84C] text-sm font-extrabold text-black transition hover:bg-[#D4B86A] disabled:opacity-50';

export const gateSecondaryClass =
  'inline-flex min-h-11 w-full items-center justify-center rounded-3xl border border-[#C9A84C] bg-transparent text-sm font-bold text-[#C9A84C] hover:bg-[#C9A84C]/10';

export function scoreBarColor(score: number): string {
  if (score >= 80) return 'bg-[#00D4AA]';
  if (score >= 60) return 'bg-[#C9A84C]';
  return 'bg-white/25';
}
