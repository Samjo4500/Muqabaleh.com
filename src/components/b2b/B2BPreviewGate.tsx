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
                ? 'القراءة متاحة. الكتابة (نشر وظائف، دعوات، حفظ الإعدادات) مقفلة حتى تفعيل الوصول الكامل.'
                : 'Reads are live. Writes (jobs, invites, settings) stay locked until full access is enabled.'}
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

/**
 * Preview shell — keep reads interactive so live stats/jobs are usable.
 * Write APIs still return B2B_PREVIEW_LOCKED until flags are enabled.
 */
export function B2BPreviewContent({ children }: { children: React.ReactNode }) {
  return <div className="relative">{children}</div>;
}
