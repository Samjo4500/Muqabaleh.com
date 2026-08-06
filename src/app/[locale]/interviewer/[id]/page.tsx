import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { localePath } from '@/i18n/navigation';

/** Public human interviewer profiles are parked. */
export default async function InterviewerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(localePath('/interviewers', locale));
}
