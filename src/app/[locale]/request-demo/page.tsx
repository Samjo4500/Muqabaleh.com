import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { RequestDemoClient } from './request-demo-client';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/request-demo',
    titleAr: 'اطلب عرضاً توضيحياً — مقابلة للأعمال',
    titleEn: 'Request a Demo — Muqabaleh for Business',
    descAr: 'اطلب عرضاً توضيحياً للوحة التوظيف في مقابلة وسنتواصل معك لتفعيل الوصول.',
    descEn: 'Request a demo of the Muqabaleh hiring console and we will unlock access for your team.',
  });
}

export default async function RequestDemoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <RequestDemoClient />;
}
