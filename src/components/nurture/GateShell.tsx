'use client';

import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';

export function GateShell({
  isAr,
  children,
  footer,
}: {
  isAr: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0A0E17]/80 sm:items-center"
      role="dialog"
      aria-modal="true"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="flex h-[100svh] w-full flex-col overflow-y-auto border-white/10 bg-[#0D1117] sm:h-auto sm:max-h-[92vh] sm:max-w-[480px] sm:rounded-[20px] sm:border">
        <div className="flex justify-center px-6 pt-6">
          <BrandLogo size="sm" />
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
