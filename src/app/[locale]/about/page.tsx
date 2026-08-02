import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import PageContent from './about-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      absolute: locale === 'ar' ? 'من نحن — مقابلة | Muqabaleh' : 'About — Muqabaleh',
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <PageContent />;
}
