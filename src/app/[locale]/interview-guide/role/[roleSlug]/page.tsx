import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { InterviewGuideView } from '@/components/interview-guides/InterviewGuideView';
import { bi } from '@/lib/interview-guides/content';
import { loadRoleGuide } from '@/lib/interview-guides/data';
import { topGuideRoleSlugs } from '@/lib/interview-guides/registry';
import { pageMetadata } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; roleSlug: string }> };

export const revalidate = 86400;
/**
 * Prerender the top 10 roles. Remaining published roles generate on first
 * request, then cache. Unknown slugs still `notFound()`.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await topGuideRoleSlugs(10);
  return slugs.map((roleSlug) => ({ roleSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, roleSlug } = await params;
  const data = await loadRoleGuide(roleSlug);
  if (!data) {
    return pageMetadata({
      locale,
      path: `/interview-guide/role/${roleSlug}`,
      titleAr: 'دليل مقابلة | مقابلة',
      titleEn: 'Interview Guide | Muqabaleh',
      descAr: 'دليل مقابلة على مقابلة.',
      descEn: 'Interview guide on Muqabaleh.',
      noIndex: true,
    });
  }

  const nameAr = data.role.name.ar;
  const nameEn = data.role.name.en;
  return pageMetadata({
    locale,
    path: `/interview-guide/role/${data.role.slug}`,
    titleAr: `دليل مقابلة ${nameAr} — أسئلة شائعة + نصائح | مقابلة`,
    titleEn: `${nameEn} Interview Guide — Questions & Tips | Muqabaleh`,
    descAr: `تعلّم كيف تتأهب لمقابلة ${nameAr}. أهم الأسئلة، نصائح الإجابة، وتدرّب مجاناً مع جيني.`,
    descEn: `Prepare for your ${nameEn} interview. Common questions, answer tips, and free AI practice with Jeannie.`,
    keywords: [nameEn, nameAr, 'interview questions', 'أسئلة مقابلة', 'Muqabaleh'],
  });
}

export default async function RoleInterviewGuidePage({ params }: Props) {
  const { locale, roleSlug } = await params;
  setRequestLocale(locale);

  const data = await loadRoleGuide(roleSlug);
  if (!data) notFound();

  const isAr = locale !== 'en';
  const name = bi(locale, data.role.name);
  const title = isAr
    ? `دليل مقابلة ${name} — أسئلة شائعة + نصائح | مقابلة`
    : `${name} Interview Guide — Questions & Tips | Muqabaleh`;
  const description = isAr
    ? `تعلّم كيف تتأهب لمقابلة ${name}. أهم الأسئلة، نصائح الإجابة، وتدرّب مجاناً مع جيني.`
    : `Prepare for your ${name} interview. Common questions, answer tips, and free AI practice with Jeannie.`;

  return (
    <InterviewGuideView
      kind="role"
      locale={locale}
      data={data}
      title={title}
      description={description}
    />
  );
}
