import Link from 'next/link';
import { MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { isMenaListedRole } from '@/lib/jobs/mena';
import { localePath } from '@/i18n/navigation';

type LatestJob = {
  id: string;
  title: string;
  slug: string;
  location: string;
  companyName: string;
  companySlug: string;
};

async function loadLatestJobs(): Promise<LatestJob[]> {
  try {
    const rows = await db.listedJob.findMany({
      where: {
        isActive: true,
        company: { isActive: true },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        company: { select: { name: true, slug: true, country: true } },
      },
      orderBy: { postedAt: 'desc' },
      take: 24,
    });

    const mena = rows
      .filter(
        (j) =>
          j.company &&
          isMenaListedRole(j.location, j.title, j.company.country),
      )
      .slice(0, 8)
      .map((j) => ({
        id: j.id,
        title: j.title,
        slug: j.slug,
        location: j.location,
        companyName: j.company!.name,
        companySlug: j.company!.slug,
      }));

    if (mena.length) return mena;
  } catch (err) {
    console.error('[LatestJobs]', err);
  }

  return DEMO_JOBS.filter((j) =>
    isMenaListedRole(j.location, j.title, j.company.country),
  )
    .slice(0, 8)
    .map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      companyName: j.company.name,
      companySlug: j.company.slug,
    }));
}

export async function LatestJobs({ locale }: { locale: string }) {
  const isAr = locale !== 'en';
  const jobs = await loadLatestJobs();
  if (!jobs.length) return null;

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="mq-section relative py-16 md:py-20" aria-labelledby="latest-jobs-heading">
      <div className="mq-wrap mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mq-kicker mb-2">Muqabaleh</p>
            <h2
              id="latest-jobs-heading"
              className="mq-display text-2xl font-bold text-white md:text-3xl"
            >
              {isAr ? 'أحدث الوظائف' : 'Latest Jobs'}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/55 md:text-base">
              {isAr
                ? 'وظائف حقيقية في الشرق الأوسط — تدرّب مع جيني ثم قدّم لدى الشركة.'
                : 'Live MENA roles — practice with Jeannie, then apply on the company site.'}
            </p>
          </div>
          <Link
            href={localePath('/jobs', locale)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-300 hover:text-teal-200"
          >
            {isAr ? 'كل الوظائف' : 'All jobs'}
            <Arrow size={16} />
          </Link>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link
                href={localePath(
                  `/companies/${job.companySlug}/${job.slug}`,
                  locale,
                )}
                className="group flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition hover:border-teal-300/30 hover:bg-white/[0.05]"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-teal-300/80">
                  {job.companyName}
                </span>
                <span className="mq-display mt-1 text-base font-bold text-white group-hover:text-teal-100 md:text-lg">
                  {job.title}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/45">
                  <MapPin size={14} aria-hidden />
                  {job.location}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
