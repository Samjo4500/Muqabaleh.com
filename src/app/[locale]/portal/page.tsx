import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { localePath } from '@/i18n/navigation';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/portal',
    titleAr: 'بوابة الوظائف — مقابلة',
    titleEn: 'Job Portal — Muqabaleh',
    descAr: 'تصفّح الأدوار، تدرّب مع جيني، ثم قدّم بنفسك على موقع الشركة.',
    descEn: 'Browse roles, practice with Jeannie, then apply yourself on the company site.',
    noIndex: true,
  });
}

/** Legacy /portal → live Prepare-and-Verify jobs board. */
export default async function PortalPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(localePath('/jobs', locale));
}
