import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { VerifyClient } from './verify-client';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/verify',
    titleAr: 'تحقق من جواز مقابلة — مقابلة | Muqabaleh',
    titleEn: 'Verify a Muqabaleh passport — Muqabaleh',
    descAr: 'أدخل معرّف التحقق للتأكد من صحة جواز أو شهادة مقابلة.',
    descEn: 'Enter a verification ID to confirm a Muqabaleh passport or certificate is authentic.',
    keywords: ['verify passport', 'Muqabaleh certificate', 'تحقق جواز', 'مقابلة'],
  });
}

export default async function VerifyIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <VerifyClient />;
}
