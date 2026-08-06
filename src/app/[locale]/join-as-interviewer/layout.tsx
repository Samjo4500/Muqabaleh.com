import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

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

export default function Layout({ children }: Props) {
  return children;
}
