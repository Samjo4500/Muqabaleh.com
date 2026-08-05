import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import PageContent from './pricing-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/pricing',
    titleAr: 'الأسعار — مقابلة | Muqabaleh',
    titleEn: 'Pricing — Muqabaleh',
    descAr: 'خطط أسعار مقابلة للتدرّب على المقابلات بالذكاء الاصطناعي والمحاورين البشر.',
    descEn: 'Muqabaleh pricing for AI mock interviews and human interview coaching.',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <PageContent />;
}
