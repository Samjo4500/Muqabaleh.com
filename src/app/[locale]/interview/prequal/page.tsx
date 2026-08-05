import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrequalClient } from './prequal-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'تأهيل المقابلة — مقابلة | Muqabaleh'
        : 'Interview Pre-Qual — Muqabaleh',
    },
    description: isAr
      ? 'خصّص جلسة مقابلة تجريبية حسب دورك ومستواك ولغتك على مقابلة.'
      : 'Tailor your Muqabaleh mock interview session to your role, level, and language.',
  };
}

export default async function PrequalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    const dest =
      locale === 'en'
        ? `/en/auth/register?callbackUrl=${encodeURIComponent('/en/interview/prequal')}`
        : `/auth/register?callbackUrl=${encodeURIComponent('/interview/prequal')}`;
    redirect(dest);
  }

  return <PrequalClient email={session.user.email} />;
}
