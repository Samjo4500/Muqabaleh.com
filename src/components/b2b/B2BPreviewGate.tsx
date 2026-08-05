'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Lock, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

/** Sticky banner + optional content dimming for the locked business console. */
export function B2BPreviewBanner() {
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="sticky top-0 z-50 border-b border-teal-300/25 bg-[#071018]/95 backdrop-blur-xl">
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-400/15 text-teal-300">
            <Lock size={16} strokeWidth={1.75} />
          </div>
          <div>
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Sparkles size={14} className="text-teal-300" />
              {isAr ? 'معاينة لوحة الأعمال' : 'Business console preview'}
            </p>
            <p className="mt-0.5 text-xs text-white/55 sm:text-sm">
              {isAr
                ? 'تصفّح الواجهة ببيانات تجريبية. الوصول الكامل يتطلب طلب عرض توضيحي.'
                : 'Browse the interface with sample data. Full access requires a demo request.'}
            </p>
          </div>
        </div>
        <Link
          href={localePath('/request-demo', locale)}
          className="mq-btn mq-btn-primary inline-flex shrink-0 items-center justify-center px-4 py-2 text-sm"
        >
          {isAr ? 'اطلب عرضاً توضيحياً' : 'Request a demo'}
        </Link>
      </div>
    </div>
  );
}

/** Soft-blocks pointer interactions on write UI while keeping content readable. */
export function B2BPreviewContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-80">{children}</div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#070b14]/40" />
    </div>
  );
}
