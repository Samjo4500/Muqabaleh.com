import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PageContent from './demo-content';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr
        ? 'تجربة مجانية — مقابلة | Muqabaleh'
        : 'Free Practice — Muqabaleh',
    },
    description: isAr
      ? 'سجّل وأجب عن أسئلة التأهيل قبل بدء مقابلتك المجانية.'
      : 'Register and answer pre-qualifying questions before your free interview.',
  };
}

export default async function DemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getServerSession(authOptions);
  return <PageContent isAuthenticated={Boolean(session?.user?.email)} />;
}
