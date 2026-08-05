import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { CrystalLanding } from '@/components/landing/crystal';
import {
  OrganizationJsonLd,
  WebSiteJsonLd,
  FaqJsonLd,
} from '@/components/json-ld';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://muqabaleh.com';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const url = isAr ? SITE_URL : `${SITE_URL}/en`;
  const title = isAr
    ? 'مقابلة | Muqabaleh — تدرّب على مقابلات العمل بالذكاء الاصطناعي'
    : 'Muqabaleh — AI Mock Interviews for Job Seekers in MENA';
  const description = isAr
    ? 'تدرّب على مقابلات العمل بالعربية والإنجليزية مع محاور ذكاء اصطناعي، واحصل على تقييم فوري وشهادة موثّقة.'
    : 'Practice job interviews in Arabic and English with an AI interviewer. Get instant scoring, coaching tips, and a verified certificate.';

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: {
        'ar-SA': SITE_URL,
        'en-US': `${SITE_URL}/en`,
        'x-default': SITE_URL,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Muqabaleh' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.jpg'],
    },
    keywords: isAr
      ? ['مقابلة عمل', 'تدريب مقابلات', 'ذكاء اصطناعي', 'مقابلة', 'مقابلات وظيفية']
      : [
          'mock interview',
          'AI interview practice',
          'job interview Arabic',
          'MENA careers',
          'Muqabaleh',
        ],
  };
}

export default async function LandingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd locale={locale} />
      <FaqJsonLd locale={locale} />
      <CrystalLanding />
    </>
  );
}
