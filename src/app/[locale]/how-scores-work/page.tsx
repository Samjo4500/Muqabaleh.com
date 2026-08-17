import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/components/json-ld';
import { HowScoresWorkView } from '@/components/marketing/HowScoresWorkView';
import { HOW_SCORES, HOW_SCORES_PATH } from '@/lib/marketing/how-scores-work';
import { pageMetadata, SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: HOW_SCORES_PATH,
    titleAr: 'كيف تعمل درجات مقابلة | مقابلة',
    titleEn: 'How Muqabaleh Scores Work | Muqabaleh',
    descAr:
      'الجواز سجل جاهزية تحت سيطرة المرشّح، خاص افتراضياً. الدرجة تعكس منهجية التدريب وليست ضمان توظيف ولا قرار أهلية تلقائي.',
    descEn:
      'The Passport is a candidate-controlled interview-readiness record, private by default. The score reflects practice methodology — not a hiring guarantee or automatic eligibility decision.',
    keywords:
      locale === 'ar'
        ? ['درجات مقابلة', 'جواز مقابلة', 'خصوصية', 'تقييم مقابلات']
        : ['Muqabaleh scores', 'Passport', 'interview scoring', 'responsible use'],
  });
}

export default async function HowScoresWorkPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          {
            name: isAr ? 'الرئيسية' : 'Home',
            url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
          },
          {
            name: isAr ? HOW_SCORES.title.ar : HOW_SCORES.title.en,
            url: `${SITE_URL}${prefix}${HOW_SCORES_PATH}`,
          },
        ]}
      />
      <FaqJsonLd locale={locale} items={HOW_SCORES.faqs} />
      <HowScoresWorkView />
    </>
  );
}
