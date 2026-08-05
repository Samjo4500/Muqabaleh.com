import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import PageContent from './business-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  return {
    title: {
      absolute: isAr ? 'للشركات — مقابلة | Muqabaleh' : 'Business — Muqabaleh',
    },
    description: isAr
      ? 'فرز مرشحين بالذكاء الاصطناعي مع تقارير موحّدة وبطاقات تقييم مباشرة — وفر حتى ٨٠٪ من وقت الفرز الأولي.'
      : 'AI candidate screening with live scorecards and unified reports — cut up to 80% of first-round time.',
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PageContent />;
}
