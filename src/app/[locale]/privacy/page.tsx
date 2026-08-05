import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { AtelierLegalPage } from '@/components/landing/crystal/AtelierLegalPage';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/privacy',
    titleAr: 'الخصوصية — مقابلة',
    titleEn: 'Privacy — Muqabaleh',
    descAr: 'سياسة خصوصية مقابلة وكيفية حماية بيانات المرشّحين والشركات.',
    descEn: 'Muqabaleh privacy policy and how we protect candidate and company data.',
  });
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const paragraphs: string[] = Array.from({ length: 15 }, (_, i) => t(`privacyP${i + 1}`));

  return (
    <AtelierLegalPage
      title={t('privacyTitle')}
      updated={t('lastUpdated')}
      paragraphs={paragraphs}
    />
  );
}
