import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { PortalHomeClient } from './portal-home-client';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/portal',
    titleAr: 'بوابة الوظائف — مقابلة',
    titleEn: 'Job Portal — Muqabaleh',
    descAr: 'تصفّح الشواغر، انضم لقاعدة المواهب، أو اطلب عرضاً لنشر وظائف شركتك.',
    descEn: 'Browse vacancies, join the talent pool, or request a demo to post company roles.',
  });
}

export default async function PortalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalHomeClient />;
}
