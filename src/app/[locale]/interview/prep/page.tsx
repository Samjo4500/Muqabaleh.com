import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrepClient } from './prep-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'إعداد المقابلة — جيني | مقابلة'
        : 'Interview prep — Jeannie | Muqabaleh',
    },
    description: isAr
      ? 'جهّز جلسة التدريب مع جيني: الدور، القطاع، المستوى، واللغة.'
      : 'Set up your Jeannie practice session: role, industry, seniority, and language.',
    robots: { index: false, follow: false },
  };
}

export default async function InterviewPrepPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent('/en/interview/prep')}`
        : `/auth/register?callbackUrl=${encodeURIComponent('/interview/prep')}`;
    redirect(dest);
  }

  return <PrepClient />;
}
