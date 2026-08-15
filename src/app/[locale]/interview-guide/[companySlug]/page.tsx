import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { InterviewGuideView } from '@/components/interview-guides/InterviewGuideView';
import { bi } from '@/lib/interview-guides/content';
import { loadCompanyGuide } from '@/lib/interview-guides/data';
import { topGuideCompanySlugs } from '@/lib/interview-guides/registry';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; companySlug: string }> };

export const revalidate = 86400;
/**
 * Prerender the top 20. Other published slugs generate on first request
 * (App Router equivalent of fallback: 'blocking') then ISR-cache.
 * Unknown slugs still `notFound()` — real HTTP 404, not a soft-404 shell.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  // Parent `[locale]/layout` already emits locales — return only this segment.
  const slugs = await topGuideCompanySlugs(20);
  return slugs.map((companySlug) => ({ companySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, companySlug } = await params;
  const data = await loadCompanyGuide(companySlug);
  if (!data) {
    return pageMetadata({
      locale,
      path: `/interview-guide/${companySlug}`,
      titleAr: 'دليل مقابلة | مقابلة',
      titleEn: 'Interview Guide | Muqabaleh',
      descAr: 'دليل مقابلة على مقابلة.',
      descEn: 'Interview guide on Muqabaleh.',
      noIndex: true,
    });
  }

  const nameAr = data.company.name.ar;
  const nameEn = data.company.name.en;
  return pageMetadata({
    locale,
    path: `/interview-guide/${data.company.slug}`,
    titleAr: `دليل مقابلة ${nameAr} — أسئلة شائعة + نصائح | مقابلة`,
    titleEn: `${nameEn} Interview Guide — Questions & Tips | Muqabaleh`,
    descAr: `تعلّم كيف تتأهب لمقابلة ${nameAr}. أهم الأسئلة، نصائح الإجابة، وتدرّب مجاناً مع جيني.`,
    descEn: `Prepare for your ${nameEn} interview. Common questions, answer tips, and free AI practice with Jeannie.`,
    keywords: [nameEn, nameAr, 'interview guide', 'دليل مقابلة', 'Muqabaleh'],
  });
}

export default async function CompanyInterviewGuidePage({ params }: Props) {
  const { locale, companySlug } = await params;
  setRequestLocale(locale);

  const data = await loadCompanyGuide(companySlug);
  if (!data) notFound();

  const isAr = locale !== 'en';
  const name = bi(locale, data.company.name);
  const title = isAr
    ? `دليل مقابلة ${name} — أسئلة شائعة + نصائح | مقابلة`
    : `${name} Interview Guide — Questions & Tips | Muqabaleh`;
  const description = isAr
    ? `تعلّم كيف تتأهب لمقابلة ${name}. أهم الأسئلة، نصائح الإجابة، وتدرّب مجاناً مع جيني.`
    : `Prepare for your ${name} interview. Common questions, answer tips, and free AI practice with Jeannie.`;

  return (
    <InterviewGuideView
      kind="company"
      locale={locale}
      data={data}
      title={title}
      description={description}
    />
  );
}
