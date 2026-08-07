import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { Banknote, Briefcase, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { db } from '@/lib/db';
import { getDemoJob } from '@/lib/jobs/demo-listings';
import { safeJobText } from '@/lib/jobs/job-details';
import {
  classifyMenaCountry,
  MENA_COUNTRY_FLAGS,
  MENA_COUNTRY_LABELS,
} from '@/lib/jobs/mena';
import { localePath } from '@/i18n/navigation';

export default async function CompanyJobPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; jobSlug: string }>;
}) {
  const { slug, jobSlug } = await params;
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const job = await loadJob(slug, jobSlug);
  if (!job) notFound();

  const practiceHref = localePath(
    `/interview/prequal?company=${encodeURIComponent(job.companyName)}&role=${encodeURIComponent(job.title)}&job=${encodeURIComponent(job.id)}`,
    locale,
  );

  return (
    <div className="mq-atelier min-h-screen">
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
              {isAr ? 'تدرّب لهذه الوظيفة مع جيني' : 'Practice this role with Jeannie'}
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
    countryKey: classifyMenaCountry(demo.location, demo.company.country, demo.title),
  };
}
