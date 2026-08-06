import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { PortalParked } from '@/components/portal/PortalParked';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/portal',
    titleAr: 'بوابة الوظائف قريباً — مقابلة',
    titleEn: 'Job Portal coming soon — Muqabaleh',
    descAr: 'السوق متوقفة مؤقتاً. احصل على جواز مقابلة ودع جيني تقدّم عنك باحتراف.',
    descEn: 'Marketplace paused for now. Get your Muqabaleh passport and let Jeannie apply professionally for you.',
  });
}

export default async function PortalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalParked />;
}
