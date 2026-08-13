import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CrystalLanding } from '@/components/landing/crystal';
import { HomeGraphJsonLd, FaqJsonLd } from '@/components/json-ld';
import { C } from '@/components/landing/crystal/copy';
import { pageMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '',
    titleAr: 'مقابلة | تدريب مقابلات العمل بالذكاء الاصطناعي',
    titleEn: 'Muqabaleh | AI Mock Interviews for MENA Jobs',
    descAr:
      'تدرّب على مقابلات العمل بالعربية والإنجليزية مع جيني، واحصل على تقييم فوري وجواز جاهزية موثّق لوظائف الشرق الأوسط.',
    descEn:
      'Practice job interviews in Arabic and English with Jeannie. Instant scoring and a hire-ready passport for MENA careers.',
    keywords:
      locale === 'ar'
        ? ['مقابلة عمل', 'تدريب مقابلات', 'جيني', 'ذكاء اصطناعي', 'وظائف']
        : [
            'mock interview',
            'AI interview practice',
            'Jeannie',
            'MENA careers',
            'Muqabaleh',
          ],
    ogImage: '/og-image.png',
  });
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HomeGraphJsonLd locale={locale} />
      <FaqJsonLd locale={locale} items={C.faq.items} />
      <CrystalLanding />
    </>
  );
}
