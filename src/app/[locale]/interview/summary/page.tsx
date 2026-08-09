import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SummaryClient } from './summary-client';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { pageMetadata } = await import('@/lib/seo');
  return pageMetadata({
    locale,
    path: '/interview/summary',
    titleAr: 'ملخص الخطة — مقابلة',
    titleEn: 'Interview Plan Summary — Muqabaleh',
    descAr: 'ملخص خطة مقابلة خاصة.',
    descEn: 'Private interview plan summary.',
    noIndex: true,
  });
}

export default async function SummaryPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { sessionId } = await searchParams;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent('/en/interview/summary')}`
        : `/auth/register?callbackUrl=${encodeURIComponent('/interview/summary')}`;
    redirect(dest);
  }

  return <SummaryClient sessionId={sessionId || ''} email={session.user.email} />;
}
