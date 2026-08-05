import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/interviewers',
    titleAr: 'المحاورون — مقابلة',
    titleEn: 'Interviewers — Muqabaleh',
    descAr: 'احجز جلسة مع محاور بشري معتمد من مجال تخصصك.',
    descEn: 'Book a live session with a certified human interviewer from your field.',
  });
}

export default function Layout({ children }: Props) {
  return children;
}
