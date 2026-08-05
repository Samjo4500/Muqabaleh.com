import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/navigation';

export default async function JobDetailRedirect({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect(localePath(`/portal/jobs/${id}`, locale));
}
