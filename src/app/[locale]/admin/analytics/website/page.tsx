import { redirect } from 'next/navigation';

/** Website analytics is the first-party visitors dashboard. */
export default async function WebsiteAnalyticsRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(locale === 'en' ? '/en/admin/visitors' : '/admin/visitors');
}
