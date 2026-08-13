import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CrystalLanding } from '@/components/landing/crystal';
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  FaqJsonLd,
} from '@/components/json-ld';
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
    titleAr: 'مقابلة | ادخل واثق. اخرج ناجح.',
    titleEn: 'Muqabaleh | Walk in prepared. Walk out hired.',
    descAr:
      'تدرّب على مقابلات العمل الحقيقية مع جيني — مساعدك الذكي بالعربية والإنجليزية. استعد للأسئلة الصعبة، وحسّن إجاباتك قبل ما تقدم على الوظيفة.',
    descEn:
      'Practice real job interviews with Jeannie — your AI coach in Arabic and English. Get ready for tough questions before you apply.',
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
      <OrganizationJsonLd />
      <WebSiteJsonLd locale={locale} />
      <FaqJsonLd locale={locale} items={C.faq.items} />
      <CrystalLanding />
    </>
  );
}
