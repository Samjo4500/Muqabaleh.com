import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { localePath } from '@/i18n/navigation';

export const metadata = {
  title: '403 — Access Denied',
};

export default async function ForbiddenPage() {
  const t = await getTranslations('errors');
  const locale = await getLocale();

  return (
    <div className="mq-atelier relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-x-hidden px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <ShieldX size={64} strokeWidth={1.25} className="text-rose-300/90" />
      <h1 className="mq-display text-3xl font-extrabold text-white">403</h1>
      <p className="max-w-md text-lg text-white/55">
        {t('forbiddenMessage') || 'ليس لديك صلاحية الوصول إلى هذه الصفحة.'}
      </p>
      <Link href={localePath('/', locale)} className="mq-btn mq-btn-primary text-sm">
        {t('goHome') || 'العودة للرئيسية'}
      </Link>
    </div>
  );
}
