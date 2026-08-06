import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { HumansParked } from '@/components/portal/HumansParked';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/join-as-interviewer',
    titleAr: 'الانضمام كمحاور لاحقاً — مقابلة',
    titleEn: 'Join as interviewer later — Muqabaleh',
    descAr: 'التقديم كمحاور بشري متوقف مؤقتاً بينما نركّز على الجوازات وجيني.',
    descEn: 'Interviewer applications are paused while we focus on passports and Jeannie.',
  });
}

export default async function JoinAsInterviewerPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HumansParked />;
}
