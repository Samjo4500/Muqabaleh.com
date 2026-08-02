import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import BusinessContent from './business-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'ar' ? 'الشركات — مقابلة | Muqabaleh' : 'Business — Muqabaleh',
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <BusinessContent />;
}
