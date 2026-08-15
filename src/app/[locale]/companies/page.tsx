import type { Metadata } from 'next';
import Link from 'next/link';
import { setRequestLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { localePath } from '@/i18n/navigation';
import { pageMetadata, SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ locale: string }> };

type CompanyRow = {
  slug: string;
  name: string;
  country: string;
  industry: string | null;
  jobCount: number;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/companies',
    titleAr: 'الشركات — وظائف وتدريب مقابلات | مقابلة',
    titleEn: 'Companies — jobs and interview practice | Muqabaleh',
    descAr:
      'تصفّح الشركات في الشرق الأوسط. تدرّب مع جيني ثم قدّم بنفسك على موقع الشركة.',
    descEn:
      'Browse MENA companies. Practice with Jeannie, then apply yourself on the company site.',
  });
}

async function loadCompanies(): Promise<CompanyRow[]> {
  try {
    const rows = await db.listedCompany.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        name: true,
        country: true,
        industry: true,
        _count: { select: { jobs: true } },
      },
      orderBy: { name: 'asc' },
      take: 200,
    });
    if (rows.length) {
      return rows.map((c) => ({
        slug: c.slug,
        name: c.name,
        country: c.country,
        industry: c.industry,
        jobCount: c._count.jobs,
      }));
    }
  } catch {
    /* fall through to demo */
  }
  const bySlug = new Map<string, CompanyRow>();
  for (const job of DEMO_JOBS) {
    const existing = bySlug.get(job.company.slug);
    if (existing) {
      existing.jobCount += 1;
    } else {
      bySlug.set(job.company.slug, {
        slug: job.company.slug,
        name: job.company.name,
        country: job.company.country,
        industry: job.company.industry,
        jobCount: 1,
      });
    }
  }
  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export default async function CompaniesIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isAr = locale !== 'en';
  const prefix = locale === 'en' ? '/en' : '';
  const companies = await loadCompanies();

  return (
    <div className="mq-atelier min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: isAr ? 'الرئيسية' : 'Home', url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { name: isAr ? 'الشركات' : 'Companies', url: `${SITE_URL}${prefix}/companies` },
        ]}
      />
      <JobPortalChrome backHref="/" backLabel={{ en: 'Home', ar: 'الرئيسية' }} />
      <main className="mq-wrap py-10 md:py-14">
        <div className="mx-auto max-w-4xl">
          <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">
            {isAr ? 'الشركات' : 'Companies'}
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            {isAr
              ? `${companies.length} شركة — تدرّب ثم قدّم بنفسك على موقع صاحب العمل.`
              : `${companies.length} companies — practice, then apply yourself on the employer site.`}
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {companies.map((c) => (
              <li key={c.slug}>
                <Link
                  href={localePath(`/companies/${c.slug}`, locale)}
                  className="block rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:border-teal-300/30"
                >
                  <span className="font-bold text-white">{c.name}</span>
                  <span className="mt-1 block text-sm text-white/45">
                    {c.country}
                    {c.industry ? ` · ${c.industry}` : ''}
                    {c.jobCount > 0
                      ? ` · ${c.jobCount} ${isAr ? 'وظيفة' : 'jobs'}`
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
