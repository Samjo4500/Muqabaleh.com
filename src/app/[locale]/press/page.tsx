import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import { BreadcrumbJsonLd, OrganizationJsonLd } from '@/components/json-ld';
import PressContent from './press-content';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/press',
    titleAr: 'المركز الإعلامي | مقابلة',
    titleEn: 'Press | Muqabaleh',
    descAr:
      'أصول علامة مقابلة، نبذة الشركة، وسيرة المؤسس للصحافة والشركاء.',
    descEn:
      'Muqabaleh press kit: brand assets, company boilerplate, and founder bio.',
  });
}

export default async function PressPage({ params }: Props) {
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
          { name: isAr ? 'المركز الإعلامي' : 'Press', url: `${SITE_URL}${prefix}/press` },
        ]}
      />
      <PressContent />
    </>
  );
}
