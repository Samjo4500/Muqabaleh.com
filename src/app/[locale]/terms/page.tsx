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
    path: '/terms',
    titleAr: 'الشروط — مقابلة',
    titleEn: 'Terms — Muqabaleh',
    descAr: 'شروط استخدام منصة مقابلة للتدرّب على المقابلات الوظيفية.',
    descEn: 'Terms of use for the Muqabaleh interview practice platform.',
  });
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const paragraphs: string[] = Array.from({ length: 15 }, (_, i) => t(`termsP${i + 1}`));

  return (
    <AtelierLegalPage title={t('termsTitle')} updated={t('lastUpdated')} paragraphs={paragraphs} />
  );
}
