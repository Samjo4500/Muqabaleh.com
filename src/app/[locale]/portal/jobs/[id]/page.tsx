import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { localePath } from '@/i18n/navigation';

export default async function PortalJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(localePath('/portal/jobs', locale));
}
