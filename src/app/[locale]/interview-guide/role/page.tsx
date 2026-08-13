import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { bi } from '@/lib/interview-guides/content';
import { listRegistryRoles } from '@/lib/interview-guides/registry';
import { localePath } from '@/i18n/navigation';
import { pageMetadata, SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/interview-guide/role',
    titleAr: 'أدلة مقابلات الأدوار | مقابلة',
    titleEn: 'Role Interview Guides | Muqabaleh',
    descAr: 'أدلة أسئلة ونصائح لأهم أدوار التوظيف في الشرق الأوسط — تدرّب مع جيني.',
    descEn: 'Interview question guides for top MENA roles — practice with Jeannie.',
  });
}

export default async function RoleGuideIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';
  const roles = await listRegistryRoles();

  return (
    <div className="mq-atelier min-h-screen">
      <BreadcrumbJsonLd
        items={[
          {
            name: isAr ? 'الرئيسية' : 'Home',
            url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL,
          },
          {
            name: isAr ? 'أدلة المقابلات' : 'Interview Guides',
            url: `${SITE_URL}${prefix}/interview-guide`,
          },
          {
            name: isAr ? 'الأدوار' : 'Roles',
            url: `${SITE_URL}${prefix}/interview-guide/role`,
          },
        ]}
      />
      <JobPortalChrome
        backHref="/interview-guide"
        backLabel={{ en: 'Interview Guides', ar: 'أدلة المقابلات' }}
      />
      <main className="mq-wrap py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">
            {isAr ? 'أدلة مقابلات الأدوار' : 'Role Interview Guides'}
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            {isAr
              ? `${roles.length} دليل دور — أسئلة شائعة ونصائح قبل التقديم.`
              : `${roles.length} role guides — common questions and tips before you apply.`}
          </p>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2">
            {roles.map((r) => (
              <li key={r.slug}>
                <Link
                  href={localePath(`/interview-guide/role/${r.slug}`, locale)}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-teal-300/30"
                >
                  <span className="font-bold text-white">{bi(locale, r.name)}</span>
                  <span className="mt-1 block text-sm text-white/45">
                    {isAr ? `صعوبة ${r.difficulty}/5` : `Difficulty ${r.difficulty}/5`}
                    {r.jobCount > 0
                      ? ` · ${r.jobCount} ${isAr ? 'وظيفة' : 'jobs'}`
                      : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <CrystalFooter />
    </div>
  );
}
