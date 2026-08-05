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
    path: '/refund',
    titleAr: 'الاسترداد — مقابلة',
    titleEn: 'Refunds — Muqabaleh',
    descAr: 'سياسة الاسترداد والإلغاء لخدمات مقابلة.',
    descEn: 'Refund and cancellation policy for Muqabaleh services.',
  });
}

export default async function RefundPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const paragraphs: string[] = Array.from({ length: 12 }, (_, i) => t(`refundP${i + 1}`));

  return (
    <AtelierLegalPage
      title={t('refundTitle')}
      updated={t('lastUpdated')}
      paragraphs={paragraphs}
    />
  );
}
