import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { ExternalLink, Sparkles } from 'lucide-react';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { db } from '@/lib/db';
import { getDemoJob } from '@/lib/jobs/demo-listings';
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
          <p className="mt-3 text-base text-white/55">
            {[job.location, job.department, job.employmentType].filter(Boolean).join(' · ')}
          </p>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white/45">
              {isAr ? 'ملخص الدور' : 'Role summary'}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-white/70">{job.description}</p>
            {job.requirements ? (
              <>
                <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-white/45">
                  {isAr ? 'المتطلبات' : 'Requirements'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{job.requirements}</p>
              </>
            ) : null}
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
            >
              <ExternalLink size={14} />
              {isAr ? 'عرض الإعلان الأصلي' : 'View original posting'}
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
              {isAr ? 'قدّم على موقع الشركة' : 'Apply on company site'}
            </a>
          </div>

          <p className="mt-5 text-center text-xs text-white/40">
            {isAr
              ? 'مقابلة لا تقدّم نيابةً عنك. أنت ترسل الطلب على موقع الشركة.'
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
        description: row.description.slice(0, 300),
        requirements: row.requirements,
        location: row.location,
        department: row.department,
        employmentType: row.employmentType,
        applyUrl: row.applyUrl,
        companyName: row.company.name,
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
    description: demo.description,
    requirements: demo.requirements,
    location: demo.location,
    department: demo.department,
    employmentType: demo.employmentType,
    applyUrl: demo.applyUrl,
    companyName: demo.company.name,
  };
}
