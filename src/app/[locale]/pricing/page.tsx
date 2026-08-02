import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import PricingContent from './pricing-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    absolute: true,
    title: locale === 'ar' ? 'الأسعار — مقابلة | Muqabaleh' : 'Pricing — Muqabaleh',
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <PricingContent />;
}
