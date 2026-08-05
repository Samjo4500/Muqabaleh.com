import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/join-as-interviewer',
    titleAr: 'انضم كمحاور — مقابلة',
    titleEn: 'Join as Interviewer — Muqabaleh',
    descAr: 'قدّم للانضمام كمحاور خبير على منصة مقابلة واكسب من جلسات التدريب.',
    descEn: 'Apply to join Muqabaleh as an expert interviewer and earn from coaching sessions.',
  });
}

export default function Layout({ children }: Props) {
  return children;
}
