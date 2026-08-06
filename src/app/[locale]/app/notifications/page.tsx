'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

export default function NotificationsPage() {
  const t = useTranslations('app.notifications');
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
        <p className="mt-2 text-sm text-white/55">{t('subtitle')}</p>
      </div>

      <div className="rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100/90">
        {t('previewNote')}
      </div>

      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-400/10 text-teal-300">
          <Bell size={28} strokeWidth={1.75} />
        </div>
        <p className="text-base font-semibold text-white">{t('emptyTitle')}</p>
        <p className="mt-2 max-w-md text-sm text-white/50">{t('emptySub')}</p>
        <Link
          href={localePath('/app/applications', locale)}
          className="mq-btn mq-btn-primary mt-6 inline-flex min-h-[44px] items-center px-5 text-sm font-bold"
        >
          {t('viewApplications')}
        </Link>
      </div>
    </div>
  );
}
