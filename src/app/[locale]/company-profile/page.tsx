import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { CompanyProfileView } from '@/components/company-profile/CompanyProfileView';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/company-profile',
    titleAr: 'ملف الشركة — خدمات مقابلة وجيني | مقابلة',
    titleEn: 'Company Profile — Muqabaleh & Jeannie Services',
    descAr:
      'ملف تعريفي عالي المستوى بمنصة مقابلة: جيني لمقابلات الذكاء الاصطناعي، جواز الجاهزية، لوحة الوظائف، وحلول التوظيف للشركات في المنطقة.',
    descEn:
      'High-level company profile for Muqabaleh: Jeannie AI interviews, verified passports, MENA jobs, and hiring services for companies.',
    keywords: [
      'Muqabaleh',
      'مقابلة',
      'Jeannie',
      'جيني',
      'AI interview',
      'MENA hiring',
      'company profile',
    ],
  });
}

export default async function CompanyProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CompanyProfileView locale={locale} />;
}
