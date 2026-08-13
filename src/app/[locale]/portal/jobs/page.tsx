import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { PortalParked } from '@/components/portal/PortalParked';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/portal/jobs',
    titleAr: 'الشواغر قريباً — مقابلة',
    titleEn: 'Vacancies coming soon — Muqabaleh',
    descAr: 'بوابة الوظائف متوقفة مؤقتاً. ابدأ مقابلة مجانية واحصل على جوازك مع جيني.',
    descEn: 'Job Portal is paused for now. Start a free interview and get your passport with Jeannie.',
    noIndex: true,
  });
}

export default async function PortalJobsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PortalParked />;
}
