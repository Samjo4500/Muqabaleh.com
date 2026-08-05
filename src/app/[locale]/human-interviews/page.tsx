import { redirect } from 'next/navigation';
import { localePath } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

/** Legacy route — board lives at /interviewers (atelier). */
export default async function HumanInterviewsRedirect({ params }: Props) {
  const { locale } = await params;
  redirect(localePath('/interviewers', locale));
}
