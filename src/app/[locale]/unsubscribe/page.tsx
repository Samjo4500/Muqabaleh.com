import { Suspense } from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { PreferenceCenter } from '@/components/nurture/PreferenceCenter';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/unsubscribe',
    titleAr: 'إلغاء الاشتراك | مقابلة',
    titleEn: 'Unsubscribe | Muqabaleh',
    descAr: 'إلغاء رسائل التغذية من مقابلة.',
    descEn: 'Unsubscribe from Muqabaleh nurture emails.',
    noIndex: true,
  });
}

export default async function UnsubscribePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div className="min-h-[50vh] bg-[#0A0E17]" />}>
      <PreferenceCenter locale={locale} mode="unsubscribe" />
    </Suspense>
  );
}
