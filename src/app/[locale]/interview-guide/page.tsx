import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { bi } from '@/lib/interview-guides/content';
import {
  listRegistryCompanies,
  listRegistryRoles,
} from '@/lib/interview-guides/registry';
import { localePath } from '@/i18n/navigation';
import { pageMetadata, SITE_URL } from '@/lib/seo';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PAGE_SIZE = 50;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/interview-guide',
    titleAr: 'أدلة مقابلات الشركات والأدوار | مقابلة',
    titleEn: 'Company & Role Interview Guides | Muqabaleh',
    descAr:
      'أدلة تحضير لمقابلات أشهر شركات وأدوار الشرق الأوسط — أسئلة شائعة، نصائح، وتدرّب مع جيني.',
    descEn:
      'Interview prep guides for top MENA companies and roles — common questions, tips, and free practice with Jeannie.',
  });
}

export default async function InterviewGuideIndexPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';

  const [companies, roles] = await Promise.all([
    listRegistryCompanies(),
    listRegistryRoles(),
  ]);

  const page = Math.max(1, Number.parseInt(sp.page || '1', 10) || 1);
  const totalPages = Math.max(1, Math.ceil(companies.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const companySlice = companies.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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
        ]}
      />
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
      />
      <main className="mq-wrap py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">
            {isAr ? 'أدلة المقابلات' : 'Interview Guides'}
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            {isAr
              ? `${companies.length} دليل شركة و${roles.length} دليل دور — تحضّر قبل التقديم.`
              : `${companies.length} company guides and ${roles.length} role guides — prepare before you apply.`}
          </p>

          <div className="mt-6">
            <Link
              href={localePath('/interview-guide/role', locale)}
              className="text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              {isAr ? 'عرض كل أدلة الأدوار →' : 'View all role guides →'}
            </Link>
          </div>

          <h2 className="mq-display mt-12 text-xl font-bold text-white md:text-2xl">
            {isAr ? 'أدلة الشركات' : 'Company guides'}
            {totalPages > 1 ? (
              <span className="ms-2 text-sm font-normal text-white/40">
                ({isAr ? `صفحة ${safePage} من ${totalPages}` : `page ${safePage} of ${totalPages}`})
              </span>
            ) : null}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {companySlice.map((c) => (
              <li key={c.slug}>
                <Link
                  href={localePath(`/interview-guide/${c.slug}`, locale)}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-teal-300/30"
                >
                  <span className="font-bold text-white">{bi(locale, c.name)}</span>
                  <span className="mt-1 block text-sm text-white/45">
                    {bi(locale, c.industry)}
                    {c.jobCount > 0
                      ? ` · ${c.jobCount} ${isAr ? 'وظيفة' : 'jobs'}`
                      : ''}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {totalPages > 1 ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {safePage > 1 ? (
                <Link
                  href={localePath(`/interview-guide?page=${safePage - 1}`, locale)}
                  className="text-sm font-semibold text-teal-300"
                >
                  {isAr ? 'السابق' : 'Previous'}
                </Link>
              ) : null}
              {safePage < totalPages ? (
                <Link
                  href={localePath(`/interview-guide?page=${safePage + 1}`, locale)}
                  className="text-sm font-semibold text-teal-300"
                >
                  {isAr ? 'التالي' : 'Next'}
                </Link>
              ) : null}
            </div>
          ) : null}

          <h2 className="mq-display mt-12 text-xl font-bold text-white md:text-2xl">
            {isAr ? 'أدلة أدوار مميزة' : 'Featured role guides'}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {roles.slice(0, 12).map((r) => (
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
