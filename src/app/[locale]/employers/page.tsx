import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { pageMetadata } from '@/lib/seo';
import { EmployersPricing } from '@/components/employers/employers-pricing';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/employers',
    titleAr: 'للتوظيف — خطط الشركات | مقابلة',
    titleEn: 'For Employers — B2B Pricing | Muqabaleh',
    descAr:
      'وظّف بذكاء. أرسل رابط مقابلة ذكية واستلم جوازاً موثقاً. خطط Starter وPro وEnterprise مع تجربة ١٤ يوماً.',
    descEn:
      'Hire smarter. Send a smart interview link and receive a verified passport. Starter, Pro, and Enterprise with a 14-day trial.',
    keywords:
      locale === 'ar'
        ? ['توظيف', 'أسعار الشركات', 'مقابلة ذكية', 'جواز مرشح']
        : ['employer pricing', 'AI interview', 'candidate passport', 'Muqabaleh B2B'],
  });
}

export default async function EmployersPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <EmployersPricing />;
}
