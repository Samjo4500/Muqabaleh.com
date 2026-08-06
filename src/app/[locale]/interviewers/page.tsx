import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { HumansParked } from '@/components/portal/HumansParked';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/interviewers',
    titleAr: 'المحاورون البشريون لاحقاً — مقابلة',
    titleEn: 'Human interviewers later — Muqabaleh',
    descAr: 'المقابلات البشرية متوقفة مؤقتاً. ابدأ بمقابلة ذكية وجواز موثّق مع جيني.',
    descEn: 'Human interviews are paused for now. Start with AI interview, a verified passport, and Jeannie.',
  });
}

export default async function InterviewersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HumansParked />;
}
