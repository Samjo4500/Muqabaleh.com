import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { localePath } from '@/i18n/navigation';

/** Human interviewer profiles are parked — send traffic to the paused page. */
export default async function InterviewerSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(localePath('/interviewers', locale));
}
