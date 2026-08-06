import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/navigation';

/** Legacy slug URLs → public interviewer profile (resolved by id or slug in the API). */
export default async function InterviewerSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale, slug } = await params;
  redirect(localePath(`/interviewer/${slug}`, locale));
}
