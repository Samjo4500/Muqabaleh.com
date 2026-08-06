import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { localePath } from '@/i18n/navigation';

/** Legacy demo settings route — real preferences live on Profile. */
export default async function SettingsRedirectPage() {
  const locale = await getLocale();
  redirect(localePath('/app/profile', locale));
}
