import type { Metadata } from 'next';
import PageContent from './demo-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      absolute: locale === 'ar' ? 'جرب المقابلة — مقابلة | Muqabaleh' : 'Try Muqabaleh',
    },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <PageContent />;
}
