import { redirect } from 'next/navigation';

/** Legacy entry → spec route */
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(locale === 'ar' ? '/admin/users/all' : `/${locale}/admin/users/all`);
}
