import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import { BreadcrumbJsonLd, OrganizationJsonLd } from '@/components/json-ld';
import PageContent from './about-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/about',
    titleAr: 'عن مقابلة | Muqabaleh',
    titleEn: 'About Muqabaleh',
    descAr:
      'عن مقابلة: منصة التدرّب على المقابلات بالذكاء الاصطناعي لسوق الشرق الأوسط وشمال أفريقيا. ادخل واثق. اخرج ناجح.',
    descEn:
      'About Muqabaleh — the AI interview practice platform built for MENA. Walk in prepared. Walk out hired.',
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: isAr ? 'الرئيسية' : 'Home', url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { name: isAr ? 'عن مقابلة' : 'About Muqabaleh', url: `${SITE_URL}${prefix}/about` },
        ]}
      />
      <PageContent />
    </>
  );
}

