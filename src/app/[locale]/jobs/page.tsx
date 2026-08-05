import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { JobsBoardClient } from './jobs-board-client';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr ? 'الوظائف — مقابلة | Muqabaleh' : 'Jobs — Muqabaleh',
    },
    description: isAr
      ? 'تصفح فرصاً موثّقة عبر المنطقة وقدّم بدرجة مقابلتك على مقابلة.'
      : 'Browse verified openings across MENA and apply with your Muqabaleh interview score.',
  };
}

export default async function JobsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JobsBoardClient />;
}
