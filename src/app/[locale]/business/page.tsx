import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import PageContent from './business-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/business',
    titleAr: 'للشركات — فرز مرشحين بالذكاء الاصطناعي | مقابلة',
    titleEn: 'Business — AI candidate screening | Muqabaleh',
    descAr:
      'فرز مرشحين بالذكاء الاصطناعي مع تقارير موحّدة وبطاقات تقييم مباشرة — وفّر حتى ٨٠٪ من وقت الفرز الأولي.',
    descEn:
      'AI candidate screening with live scorecards and unified reports — cut up to 80% of first-round time.',
    keywords:
      locale === 'ar'
        ? ['توظيف', 'فرز مرشحين', 'موارد بشرية', 'مقابلة']
        : ['AI screening', 'hiring', 'HR tech', 'Muqabaleh Business'],
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PageContent />;
}
