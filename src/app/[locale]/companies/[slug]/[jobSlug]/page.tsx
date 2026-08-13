import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Banknote, BookOpen, Briefcase, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { BreadcrumbJsonLd, JobPostingJsonLd } from '@/components/json-ld';
import { db } from '@/lib/db';
import {
  isPublishedCompanyGuide,
  isPublishedRoleGuide,
  resolveCompanyGuide,
  resolveRoleGuide,
} from '@/lib/interview-guides/registry';
import { getDemoJob } from '@/lib/jobs/demo-listings';
import { safeJobText } from '@/lib/jobs/job-details';
import {
  classifyMenaCountry,
  MENA_COUNTRY_FLAGS,
  MENA_COUNTRY_LABELS,
} from '@/lib/jobs/mena';
import { localePath } from '@/i18n/navigation';
import { inferCoachRoleIdFromTitle, jeanniePracticePath } from '@/lib/jobs/jeannie-practice';
import { pageMetadata, SITE_URL } from '@/lib/seo';

type Props = { params: Promise<{ locale: string; slug: string; jobSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug, jobSlug } = await params;
  const job = await loadJob(slug, jobSlug);
  if (!job) {
    return pageMetadata({
      locale,
      path: `/companies/${slug}/${jobSlug}`,
      titleAr: 'وظيفة | مقابلة',
      titleEn: 'Job | Muqabaleh',
      descAr: 'وظيفة على مقابلة.',
      descEn: 'Job listing on Muqabaleh.',
      noIndex: true,
    });
  }
  return pageMetadata({
    locale,
    path: `/companies/${slug}/${jobSlug}`,
    titleAr: `${job.title} — ${job.companyName} | مقابلة`,
    titleEn: `${job.title} — ${job.companyName} | Muqabaleh`,
    descAr: `${job.title} لدى ${job.companyName} · ${job.location}. تدرّب مع جيني ثم قدّم لدى الشركة.`,
    descEn: `${job.title} at ${job.companyName} · ${job.location}. Practice with Jeannie, then apply on their site.`,
    keywords: [job.title, job.companyName, job.location, 'MENA jobs', 'Muqabaleh'],
  });
}

export default async function CompanyJobPage({ params }: Props) {
  const { slug, jobSlug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const job = await loadJob(slug, jobSlug);
  if (!job) notFound();

  const practiceHref = localePath(
    jeanniePracticePath({
      company: job.companyName,
      role: job.title,
      job: job.id,
    }),
    locale,
  );
  const prefix = locale === 'en' ? '/en' : '';
  const coachRoleId = inferCoachRoleIdFromTitle(job.title);
  const [companyPublished, rolePublished] = await Promise.all([
    isPublishedCompanyGuide(slug),
    isPublishedRoleGuide(coachRoleId),
  ]);
  const resolvedCompany = companyPublished ? await resolveCompanyGuide(slug) : null;
  const companyGuide = resolvedCompany?.company || null;
  const resolvedRole = rolePublished ? await resolveRoleGuide(coachRoleId) : null;
  const roleGuide = resolvedRole?.role || null;

  return (
    <div className="mq-atelier min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: isAr ? 'الرئيسية' : 'Home', url: locale === 'en' ? `${SITE_URL}/en` : SITE_URL },
          { name: isAr ? 'الوظائف' : 'Jobs', url: `${SITE_URL}${prefix}/jobs` },
          {
            name: job.companyName,
            url: `${SITE_URL}${prefix}/companies/${slug}`,
          },
          {
            name: job.title,
            url: `${SITE_URL}${prefix}/companies/${slug}/${jobSlug}`,
          },
        ]}
      />
      <JobPostingJsonLd
        title={job.title}
        description={job.description}
        datePosted={job.datePosted}
        hiringOrganization={job.companyName}
        jobLocation={job.location}
        employmentType={job.employmentType}
        applyUrl={job.applyUrl}
        salaryLabel={job.salaryLabel}
        locale={locale}
      />
      <JobPortalChrome
        backHref={`/companies/${slug}`}
        backLabel={{ en: job.companyName, ar: job.companyName }}
      />

      <main className="mq-wrap py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <p className="mq-kicker mb-3">{job.companyName}</p>
          <h1 className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {job.title}
          </h1>
          {companyGuide || roleGuide ? (
            <p className="mt-4 rounded-xl border border-teal-300/20 bg-teal-400/[0.06] px-4 py-3 text-sm text-white/70">
              <BookOpen size={14} className="me-1.5 inline-block text-teal-300" aria-hidden />
              {isAr
                ? `تستعد لمقابلة ${job.companyName}؟ `
                : `Preparing for a ${job.companyName} interview? `}
              {companyGuide ? (
                <Link
                  href={localePath(`/interview-guide/${companyGuide.slug}`, locale)}
                  className="font-semibold text-teal-300 hover:text-teal-200"
                >
                  {isAr ? 'اقرأ دليل الشركة' : 'Read the company guide'}
                </Link>
              ) : null}
              {companyGuide && roleGuide ? (
                <span className="text-white/35"> · </span>
              ) : null}
              {roleGuide ? (
                <Link
                  href={localePath(`/interview-guide/role/${roleGuide.slug}`, locale)}
                  className="font-semibold text-teal-300 hover:text-teal-200"
                >
                  {isAr
                    ? `دليل ${roleGuide.name.ar}`
                    : `${roleGuide.name.en} guide`}
                </Link>
              ) : null}
            </p>
          ) : null}
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-white/55">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={16} />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <span aria-hidden>{MENA_COUNTRY_FLAGS[job.countryKey]}</span>
              {isAr
                ? MENA_COUNTRY_LABELS[job.countryKey].ar
                : MENA_COUNTRY_LABELS[job.countryKey].en}
            </span>
            {job.department || job.employmentType ? (
              <span className="inline-flex items-center gap-1.5">
                <Briefcase size={16} />
                {[job.department, job.employmentType].filter(Boolean).join(' · ')}
              </span>
            ) : null}
          </p>
          {job.salaryLabel ? (
            <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 px-3 py-2 text-sm font-bold text-amber-100">
              <Banknote size={16} />
              {job.salaryLabel}
            </p>
          ) : (
            <p className="mt-3 text-sm text-white/40">
              {isAr
                ? 'الراتب غير معلن هنا — راجعه عند التقديم لدى الشركة.'
                : 'Pay not published here — check the company site when you apply.'}
            </p>
          )}

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white/45">
              {isAr ? 'عن الوظيفة' : 'Position details'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70">
              {safeJobText(job.description)}
            </p>
            {job.requirements ? (
              <>
                <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-white/45">
                  {isAr ? 'المتطلبات' : 'Requirements'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {safeJobText(job.requirements, 400)}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-white/40">
                {isAr
                  ? 'التفاصيل والمتطلبات الكاملة في إعلان الشركة.'
                  : 'Full requirements are on the original company posting.'}
              </p>
            )}
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              <ExternalLink size={14} />
              {isAr ? 'افتح إعلان الشركة' : 'View original posting'}
            </a>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href={practiceHref}
              className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[52px] items-center justify-center gap-2 text-sm font-bold"
            >
              <Sparkles size={16} />
              {isAr ? 'تدرّب صوتياً لهذه الوظيفة مع جيني' : 'Voice practice this role with Jeannie'}
            </Link>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mq-btn mq-btn-ghost inline-flex min-h-[52px] items-center justify-center gap-2 text-sm font-bold"
            >
              <ExternalLink size={16} />
              {isAr ? 'التقديم لدى الشركة' : 'Apply on company site'}
            </a>
          </div>

          <p className="mt-5 text-center text-xs text-white/40">
            {isAr
              ? 'مقابلة لا تقدّم نيابةً عنك — أنت ترسل طلبك مباشرة لدى الشركة.'
              : 'Muqabaleh never applies for you. You submit on the company site.'}
          </p>
        </div>
      </main>
      <CrystalFooter />
    </div>
  );
}

async function loadJob(companySlug: string, jobSlug: string) {
  try {
    const row = await db.listedJob.findFirst({
      where: {
        slug: jobSlug,
        isActive: true,
        company: { slug: companySlug, isActive: true },
      },
      include: { company: true },
    });
    if (row?.company) {
      return {
        id: row.id,
        title: row.title,
        description: safeJobText(row.description),
        requirements: row.requirements ? safeJobText(row.requirements, 400) : null,
        location: row.location,
        department: row.department,
        employmentType: row.employmentType,
        applyUrl: row.applyUrl,
        salaryLabel: row.salaryLabel,
        companyName: row.company.name,
        datePosted: (row.postedAt || row.updatedAt)?.toISOString?.() ?? null,
        countryKey: classifyMenaCountry(row.location, row.company.country, row.title),
      };
    }
  } catch (err) {
    console.error('[job detail]', err);
  }

  const demo = getDemoJob(companySlug, jobSlug);
  if (!demo) return null;
  return {
    id: demo.id,
    title: demo.title,
    description: safeJobText(demo.description),
    requirements: demo.requirements ? safeJobText(demo.requirements, 400) : null,
    location: demo.location,
    department: demo.department,
    employmentType: demo.employmentType,
    applyUrl: demo.applyUrl,
    salaryLabel: null as string | null,
    companyName: demo.company.name,
    datePosted: null as string | null,
    countryKey: classifyMenaCountry(demo.location, demo.company.country, demo.title),
  };
}
