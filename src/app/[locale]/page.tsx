import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CrystalLanding } from '@/components/landing/crystal';
import { FaqJsonLd, SoftwareApplicationJsonLd } from '@/components/json-ld';
import { C } from '@/components/landing/crystal/copy';
import { pageMetadata } from '@/lib/seo';

export const revalidate = 3600;

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '',
    titleAr: 'مقابلة | Muqabaleh — تدرّب على مقابلات العمل بالذكاء الاصطناعي',
    titleEn: 'Muqabaleh — AI Mock Interviews for Job Seekers in MENA',
    descAr:
      'تدرّب على مقابلات العمل بالعربية والإنجليزية مع جيني، واحصل على تقييم فوري وجواز جاهزية موثّق.',
    descEn:
      'Practice job interviews in Arabic and English with Jeannie. Get instant scoring and a verified hire-ready passport.',
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
  });
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <FaqJsonLd locale={locale} items={C.faq.items} />
      <SoftwareApplicationJsonLd locale={locale} />
      <CrystalLanding />
    </>
  );
}
