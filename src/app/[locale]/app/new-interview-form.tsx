'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

/** Primary AI practice entry — routes into the unified prequal interview engine. */
export function NewInterviewForm({ sessionsLeft }: { sessionsLeft: number }) {
  const t = useTranslations('app.dashboard');
  const locale = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
          <Sparkles size={22} strokeWidth={1.75} />
        </div>
        <p className="text-sm text-white/55">
          {isAr
            ? 'خصّص مقابلة تجريبية حسب دورك ومستواك، ثم احصل على تقرير فوري.'
            : 'Personalize a practice interview for your role and level, then get an instant report.'}
        </p>
      </div>
      <Link
        href={localePath('/interview/prequal', locale)}
        className="mq-btn mq-btn-primary inline-flex min-h-[48px] w-full items-center justify-center px-6 text-sm font-bold sm:w-auto"
      >
        {t('startInterview')}
      </Link>
      <p className="text-xs text-white/40">
        {t('remaining')}: {sessionsLeft} ·{' '}
        <Link href={localePath('/app/interviews', locale)} className="text-teal-300 hover:underline">
          {t('recentInterviews')}
        </Link>
      </p>
    </div>
  );
}
