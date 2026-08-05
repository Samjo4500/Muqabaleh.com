import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import PageContent from './about-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/about',
    titleAr: 'من نحن — مقابلة | Muqabaleh',
    titleEn: 'About — Muqabaleh',
    descAr: 'تعرّف على مقابلة، المنصة العربية للتدرّب على مقابلات العمل بالذكاء الاصطناعي.',
    descEn: 'About Muqabaleh — the Arabic-first AI job interview practice platform.',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PageContent />;
}
