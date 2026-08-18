import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { Building2 } from 'lucide-react';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { db } from '@/lib/db';
import { localePath } from '@/i18n/navigation';
import { pageMetadata, SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/companies',
    titleAr: 'شركات توظّف في المنطقة | مقابلة',
    titleEn: 'Hiring companies across MENA | Muqabaleh',
    descAr:
      'شركات لديها وظائف معلنة على مقابلة. تدرّب مع جيني ثم قدّم بنفسك لدى الشركة.',
    descEn:
      'Employers with live roles on Muqabaleh. Practice with Jeannie, then apply on the company site.',
    keywords:
      locale === 'ar'
        ? ['شركات', 'وظائف', 'الخليج', 'مقابلة']
        : ['MENA companies', 'hiring', 'jobs', 'Muqabaleh'],
  });
}

export default async function CompaniesPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';
  const prefix = locale === 'en' ? '/en' : '';
  const companies = await loadCompaniesSafe();

  return (
    <div className="mq-atelier min-h-screen bg-[#05080f]">
      <BreadcrumbJsonLd
        items={[
          { name: isAr ? 'الرئيسية' : 'Home', url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { name: isAr ? 'الشركات' : 'Companies', url: `${SITE_URL}${prefix}/companies` },
        ]}
      />
      <JobPortalChrome
        backHref="/jobs"
        backLabel={{ en: 'Jobs', ar: 'الوظائف' }}
      />
      <main className="mq-wrap py-10 md:py-14">
        <p className="mq-kicker mb-2">{isAr ? 'أصحاب العمل' : 'Employers'}</p>
        <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">
          {isAr ? 'شركات لديها وظائف الآن' : 'Companies hiring now'}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/55 md:text-base">
          {isAr
            ? 'نعرض فقط الشركات التي لديها إعلان نشط من لوحة ATS قانونية أو نشر مباشر.'
            : 'Only employers with an active legal ATS or direct listing appear here.'}
        </p>

        {companies.length ? (
          <ul className="mt-10 divide-y divide-white/10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.02]">
            {companies.map((c) => (
              <li key={c.slug}>
                <Link
                  href={localePath(`/companies/${c.slug}`, locale)}
                  className="flex items-center justify-between gap-4 px-5 py-5 transition hover:bg-white/[0.03] md:px-7"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-300/25 bg-teal-400/10 text-teal-200">
                      <Building2 size={18} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{c.name}</p>
                      <p className="truncate text-sm text-white/45">
                        {c.country}
                        {c.industry ? ` · ${c.industry}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-teal-200/90">
                    {isAr ? `${c.openRoles} وظيفة` : `${c.openRoles} roles`}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 text-sm text-white/50">
            {isAr ? (
              <>
                القائمة تُحدَّث يومياً.{' '}
                <Link href={localePath('/jobs', locale)} className="text-teal-300 underline">
                  تصفّح الوظائف
                </Link>
              </>
            ) : (
              <>
                Listings refresh daily.{' '}
                <Link href={localePath('/jobs', locale)} className="text-teal-300 underline">
                  Browse jobs
                </Link>
              </>
            )}
          </p>
        )}
      </main>
      <CrystalFooter />
    </div>
  );
}

async function loadCompaniesSafe() {
  try {
    const rows = await db.listedCompany.findMany({
      where: {
        isActive: true,
        jobs: { some: { isActive: true } },
      },
      select: {
        name: true,
        slug: true,
        country: true,
        industry: true,
        _count: { select: { jobs: { where: { isActive: true } } } },
      },
      orderBy: { name: 'asc' },
      take: 200,
    });
    return rows
      .filter((c) => c.slug)
      .map((c) => ({
        name: c.name,
        slug: c.slug,
        country: c.country,
        industry: c.industry,
        openRoles: c._count.jobs,
      }));
  } catch (err) {
    console.error('[companies index]', err);
    return [];
  }
}
