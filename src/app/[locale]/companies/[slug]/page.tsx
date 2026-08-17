import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { BookOpen, Building2, Sparkles } from 'lucide-react';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd } from '@/components/json-ld';
import { db } from '@/lib/db';
import {
  isPublishedCompanyGuide,
  resolveCompanyGuide,
} from '@/lib/interview-guides/registry';
import { getDemoCompany, getDemoCompanyJobs } from '@/lib/jobs/demo-listings';
import { localePath } from '@/i18n/navigation';
import { jeanniePracticePath } from '@/lib/jobs/jeannie-practice';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import { PracticeGateLink } from '@/components/nurture/PracticeGateLink';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const data = await loadCompany(slug);
  if (!data) {
    return pageMetadata({
      locale,
      path: `/companies/${slug}`,
      titleAr: 'شركة | مقابلة',
      titleEn: 'Company | Muqabaleh',
      descAr: 'وظائف وتدريب مقابلات على مقابلة.',
      descEn: 'Jobs and interview practice on Muqabaleh.',
      noIndex: true,
    });
  }
  const { company, jobs } = data;
  return pageMetadata({
    locale,
    path: `/companies/${company.slug}`,
    titleAr: `${company.name} — وظائف | مقابلة`,
    titleEn: `${company.name} — jobs | Muqabaleh`,
    descAr: `${jobs.length} وظيفة لدى ${company.name}${company.industry ? ` · ${company.industry}` : ''}. تدرّب مع جيني ثم قدّم لدى الشركة.`,
    descEn: `${jobs.length} open roles at ${company.name}${company.industry ? ` · ${company.industry}` : ''}. Practice with Jeannie, then apply on their site.`,
    keywords: [company.name, company.country, 'jobs', 'MENA', 'Muqabaleh'],
  });
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const data = await loadCompany(slug);
  if (!data) notFound();

  const { company, jobs } = data;
  const prefix = locale === 'en' ? '/en' : '';
  const published = await isPublishedCompanyGuide(company.slug);
  const resolvedGuide = published ? await resolveCompanyGuide(company.slug) : null;
  const guide = resolvedGuide?.company || null;

  return (
    <div className="mq-atelier min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: isAr ? 'الرئيسية' : 'Home', url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { name: isAr ? 'الوظائف' : 'Jobs', url: `${SITE_URL}${prefix}/jobs` },
          { name: company.name, url: `${SITE_URL}${prefix}/companies/${company.slug}` },
        ]}
      />
      <JobPortalChrome backHref="/jobs" backLabel={{ en: 'Jobs', ar: 'الوظائف' }} />
      <main className="mq-wrap py-10 md:py-14">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-300/30 bg-teal-400/10 text-teal-200">
              <Building2 size={28} />
            </div>
            <div>
              <p className="mq-kicker mb-2">{company.country}</p>
              <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">{company.name}</h1>
              {company.industry ? (
                <p className="mt-2 text-sm text-white/50">{company.industry}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {guide ? (
              <Link
                href={localePath(`/interview-guide/${guide.slug}`, locale)}
                className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center gap-2 px-5 text-sm font-bold"
              >
                <BookOpen size={16} />
                {isAr
                  ? `دليل مقابلة ${guide.name.ar}`
                  : `${guide.name.en} interview guide`}
              </Link>
            ) : null}
            <PracticeGateLink
              href={localePath(jeanniePracticePath({ company: company.name }), locale)}
              company={company.name}
              companyId={company.slug}
              className="mq-btn mq-btn-primary inline-flex min-h-[48px] items-center justify-center gap-2 px-5 text-sm font-bold"
            >
              <Sparkles size={16} />
              {isAr ? `تدرّب صوتياً لـ ${company.name}` : `Voice practice for ${company.name}`}
            </PracticeGateLink>
          </div>
        </div>

        {guide ? (
          <p className="mb-8 rounded-xl border border-teal-300/20 bg-teal-400/[0.06] px-4 py-3 text-sm text-white/70">
            {isAr
              ? `تستعد لمقابلة ${company.name}؟ `
              : `Preparing for a ${company.name} interview? `}
            <Link
              href={localePath(`/interview-guide/${guide.slug}`, locale)}
              className="font-semibold text-teal-300 hover:text-teal-200"
            >
              {isAr ? 'اقرأ دليل المقابلة' : 'Read our interview guide'}
            </Link>
          </p>
        ) : null}

        <h2 className="mq-display mb-4 text-xl font-bold text-white md:text-2xl">
          {isAr ? 'الوظائف المفتوحة' : 'Open roles'}
        </h2>
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={localePath(`/companies/${company.slug}/${job.slug}`, locale)}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 transition hover:border-teal-300/30 hover:bg-white/[0.05]"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="mq-display text-lg font-bold text-white group-hover:text-teal-100">
                    {job.title}
                  </h3>
                  <p className="mt-1 text-sm text-white/45">
                    {job.location}
                    {job.department ? ` · ${job.department}` : ''}
                  </p>
                </div>
                <span className="text-sm font-bold text-teal-300">
                  {isAr ? 'عرض الدور' : 'View role'} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <CrystalFooter />
    </div>
  );
}

async function loadCompany(slug: string) {
  try {
    const company = await db.listedCompany.findUnique({
      where: { slug },
      include: {
        jobs: {
          where: { isActive: true },
          orderBy: { postedAt: 'desc' },
        },
      },
    });
    if (company && company.jobs.length > 0) {
      return {
        company: {
          name: company.name,
          slug: company.slug,
          country: company.country,
          industry: company.industry,
        },
        jobs: company.jobs.map((j) => ({
          id: j.id,
          title: j.title,
          slug: j.slug,
          location: j.location,
          department: j.department,
        })),
      };
    }
  } catch (err) {
    console.error('[company page]', err);
  }

  const demo = getDemoCompany(slug);
  if (!demo) return null;
  const jobs = getDemoCompanyJobs(slug);
  if (!jobs.length) return null;
  return {
    company: {
      name: demo.name,
      slug: demo.slug,
      country: demo.country,
      industry: demo.industry,
    },
    jobs: jobs.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      department: j.department,
    })),
  };
}
