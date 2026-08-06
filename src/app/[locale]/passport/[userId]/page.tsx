import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AtelierShell } from '@/components/landing/crystal/AtelierShell';
import { PassportView } from '@/components/passport/passport-view';
import { buildPassport, type PassportPayload } from '@/lib/passport';
import { localePath } from '@/i18n/navigation';

export default async function PublicPassportPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  const t = await getTranslations({ locale, namespace: 'app.passport' });

  let passport: PassportPayload | null = null;
  try {
    passport = await buildPassport(userId, { forPublic: true });
  } catch (err) {
    console.error('[public passport page]', err);
    passport = null;
  }

  if (!passport) {
    return (
      <AtelierShell>
        <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
          <h1 className="mq-display text-2xl font-bold text-white">{t('notFoundTitle')}</h1>
          <p className="mt-3 text-sm text-white/55">{t('notFoundSub')}</p>
          <Link
            href={localePath('/', locale)}
            className="mq-btn mq-btn-primary mt-6 inline-flex min-h-[44px] items-center px-5 text-sm font-bold"
          >
            {t('backHome')}
          </Link>
        </div>
      </AtelierShell>
    );
  }

  return (
    <AtelierShell>
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <PassportView passport={passport} mode="public" />
      </div>
    </AtelierShell>
  );
}
