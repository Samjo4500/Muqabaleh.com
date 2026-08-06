import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { ApplicationsClient } from './applications-client';
import { requireAuth } from '@/lib/session';
import { localePath } from '@/i18n/navigation';

export default async function ApplicationsPage() {
  const locale = await getLocale();
  const session = await requireAuth();
  if (!session?.user) {
    redirect(
      localePath(
        `/auth/signin?callbackUrl=${encodeURIComponent('/app/applications')}`,
        locale,
      ),
    );
  }

  const t = await getTranslations('app.applications');
  return (
    <div>
      <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">{t('title')}</h1>
      <p className="mt-2 text-sm text-white/55">{t('subtitle')}</p>
      <ApplicationsClient />
    </div>
  );
}
