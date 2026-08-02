import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export const metadata = {
  title: '403 — Access Denied',
};

export default async function ForbiddenPage() {
  const t = await getTranslations('errors');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <ShieldX size={64} strokeWidth={1.25} className="text-red-400/80" />
      <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">403</h1>
      <p className="max-w-md text-lg text-[var(--text-muted)]">
        {t('forbiddenMessage') || 'ليس لديك صلاحية الوصول إلى هذه الصفحة.'}
      </p>
      <Link href="/" className="btn-gold text-sm">
        {t('goHome') || 'العودة للرئيسية'}
      </Link>
    </div>
  );
}
