import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReportClient } from './report-client';

interface Props {
  params: Promise<{ locale: string; sessionId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { pageMetadata } = await import('@/lib/seo');
  return pageMetadata({
    locale,
    path: '/interview/report',
    titleAr: 'تقرير المقابلة — مقابلة',
    titleEn: 'Interview Report — Muqabaleh',
    descAr: 'تقرير مقابلة خاص.',
    descEn: 'Private interview report.',
    noIndex: true,
  });
}

export default async function ReportPage({ params }: Props) {
  const { locale, sessionId } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent(`/en/interview/report/${sessionId}`)}`
        : `/auth/register?callbackUrl=${encodeURIComponent(`/interview/report/${sessionId}`)}`;
    redirect(dest);
  }

  return <ReportClient sessionId={sessionId} />;
}
