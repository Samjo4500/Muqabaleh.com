import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/partners',
    titleAr: 'شركاء مقابلة — منصة White-label',
    titleEn: 'Muqabaleh Partners — White-label Platform',
    descAr: 'قدّم منصة مقابلات بعلامتك عبر برنامج شركاء مقابلة.',
    descEn: 'Launch interview practice under your brand with the Muqabaleh partner program.',
  });
}

export default function Layout({ children }: Props) {
  return children;
}
