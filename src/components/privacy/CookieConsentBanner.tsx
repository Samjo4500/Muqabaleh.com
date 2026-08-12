'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  readCookieConsent,
  writeCookieConsent,
  type CookieConsent,
} from '@/lib/cookie-consent';

/**
 * Fixed bottom cookie banner. Does not cover primary CTAs on most layouts
 * (safe padding + compact height). Settings modal is minimal.
 */
export function CookieConsentBanner() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [consent, setConsent] = useState<CookieConsent | null | undefined>(undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  useEffect(() => {
    const existing = readCookieConsent();
    setConsent(existing);
    setAnalyticsOn(existing?.analytics ?? false);
  }, []);

  if (consent === undefined || consent) return null;

  const accept = (analytics: boolean) => {
    const next = writeCookieConsent(analytics);
    setConsent(next);
    setSettingsOpen(false);
  };

  return (
    <>
      <div
        className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#0B1220]/95 px-4 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-6"
        role="dialog"
        aria-label={isAr ? 'موافقة ملفات تعريف الارتباط' : 'Cookie consent'}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-white/80 sm:pe-4">
            {isAr
              ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك. بالاستمرار، أنت توافق على ذلك.'
              : 'We use cookies to improve your experience. By continuing, you agree.'}
          </p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="min-h-11 min-w-[7.5rem] rounded-xl border border-white/20 px-4 py-2.5 text-sm font-medium text-white/90 hover:bg-white/5"
            >
              {isAr ? 'إعدادات' : 'Settings'}
            </button>
            <button
              type="button"
              onClick={() => accept(true)}
              className="min-h-11 min-w-[7.5rem] rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-[#041016] hover:bg-teal-400"
            >
              {isAr ? 'موافق' : 'Accept'}
            </button>
          </div>
        </div>
      </div>

      {settingsOpen ? (
        <div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/55 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onClick={() => setSettingsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F172A] p-5 shadow-xl"
            dir={isAr ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-white">
              {isAr ? 'إعدادات ملفات تعريف الارتباط' : 'Cookie settings'}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3">
                <div>
                  <p className="font-medium text-white">
                    {isAr ? 'أساسية' : 'Essential'}
                  </p>
                  <p className="text-xs text-white/50">
                    {isAr ? 'مطلوبة لتشغيل المنصة' : 'Required for the site to work'}
                  </p>
                </div>
                <input type="checkbox" checked disabled className="h-5 w-5" />
              </li>
              <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-3">
                <div>
                  <p className="font-medium text-white">
                    {isAr ? 'تحليلات' : 'Analytics'}
                  </p>
                  <p className="text-xs text-white/50">
                    {isAr
                      ? 'تساعدنا على فهم الاستخدام (GA4)'
                      : 'Helps us understand usage (GA4)'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  className="h-5 w-5 accent-teal-500"
                  checked={analyticsOn}
                  onChange={(e) => setAnalyticsOn(e.target.checked)}
                />
              </li>
            </ul>
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="min-h-11 rounded-xl px-4 py-2 text-sm text-white/70 hover:bg-white/5"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => accept(analyticsOn)}
                className="min-h-11 rounded-xl bg-teal-500 px-4 py-2.5 text-sm font-semibold text-[#041016]"
              >
                {isAr ? 'حفظ' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
