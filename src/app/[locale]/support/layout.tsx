import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/support',
    titleAr: 'الدعم — مقابلة',
    titleEn: 'Support — Muqabaleh',
    descAr: 'تواصل مع دعم مقابلة للمساعدة في حسابك وجلسات المقابلة.',
    descEn: 'Contact Muqabaleh support for help with your account and interview sessions.',
  });
}

export default function Layout({ children }: Props) {
  return children;
}
