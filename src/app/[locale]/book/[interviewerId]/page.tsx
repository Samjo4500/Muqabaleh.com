import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { localePath } from '@/i18n/navigation';

/** Human interviewer booking is parked. */
export default async function BookInterviewerPage({
  params,
}: {
  params: Promise<{ locale: string; interviewerId: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(localePath('/interviewers', locale));
}
