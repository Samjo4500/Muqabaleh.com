import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { requireAuth } from '@/lib/session';
import { localePath } from '@/i18n/navigation';
import { TrackerClient } from './tracker-client';

export default async function TrackerPage() {
  const locale = await getLocale();
  const session = await requireAuth();
  if (!session?.user) {
    redirect(
      localePath(
        `/auth/signin?callbackUrl=${encodeURIComponent('/app/tracker')}`,
        locale,
      ),
    );
  }

  const isAr = locale === 'ar';
  return (
    <div>
      <h1 className="mq-display text-2xl font-bold text-white md:text-3xl">
        {isAr ? 'متتبّع التقديم' : 'Application tracker'}
      </h1>
      <p className="mt-2 text-sm text-white/55">
        {isAr
          ? 'لوحة كانبان شخصية لما تقدّمه بنفسك — مقابلة لا تقدّم نيابةً عنك.'
          : 'Your personal Kanban for roles you apply to yourself — Muqabaleh never applies on your behalf.'}
      </p>
      <TrackerClient />
    </div>
  );
}
