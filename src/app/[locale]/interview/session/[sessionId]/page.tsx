import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { pageMetadata } from '@/lib/seo';
import { InterviewInterface } from './components/InterviewInterface';

interface Props {
  params: Promise<{ locale: string; sessionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/interview/session',
    titleAr: 'جلسة المقابلة — مقابلة',
    titleEn: 'Interview Session — Muqabaleh',
    descAr: 'جلسة مقابلة خاصة.',
    descEn: 'Private interview session.',
    noIndex: true,
  });
}

export default async function SessionPage({ params }: Props) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent(`/en/interview/session/${sessionId}`)}`
        : `/auth/register?callbackUrl=${encodeURIComponent(`/interview/session/${sessionId}`)}`;
    redirect(dest);
  }

  return <InterviewInterface sessionId={sessionId} />;
}
