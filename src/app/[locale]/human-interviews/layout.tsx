import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/human-interviews',
    titleAr: 'مقابلات بشرية — مقابلة',
    titleEn: 'Human Interviews — Muqabaleh',
    descAr: 'احجز مقابلة تجريبية مع محاور بشري خبير عبر مقابلة.',
    descEn: 'Book a live mock interview with an expert human interviewer on Muqabaleh.',
  });
}

export default function Layout({ children }: Props) {
  return children;
}
