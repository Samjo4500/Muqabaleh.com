import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PricingContent from './pricing-content';
import { ProductOffersJsonLd } from '@/components/json-ld';
import { pageMetadata } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/pricing',
    titleAr: 'الأسعار — خطط مقابلة | Muqabaleh',
    titleEn: 'Pricing — Muqabaleh Plans',
    descAr:
      'خطط مقابلة للتدريب على مقابلات العمل بالذكاء الاصطناعي — ابدأ مجاناً ورقِّ متى شئت.',
    descEn:
      'Muqabaleh plans for AI mock interview practice — start free, upgrade when you are ready.',
    keywords:
      locale === 'ar'
        ? ['أسعار مقابلة', 'جيني', 'تدريب مقابلات', 'اشتراك']
        : ['Muqabaleh pricing', 'Jeannie', 'mock interview plans', 'subscription'],
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ProductOffersJsonLd />
      <PricingContent />
    </>
  );
}
