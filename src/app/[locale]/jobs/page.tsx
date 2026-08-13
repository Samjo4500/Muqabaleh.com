import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { JobsHero } from '@/components/jobs/JobsHero';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { safeJobText } from '@/lib/jobs/job-details';
import { isMenaListedRole } from '@/lib/jobs/mena';
import { localePath } from '@/i18n/navigation';
import { pageMetadata } from '@/lib/seo';

/** Soft cap for client payload — banner uses a separate live MENA count. */
const JOBS_PAGE_TAKE = 500;

const JobsBrowserClient = dynamic(
  () =>
    import('./jobs-browser-client').then((m) => m.JobsBrowserClient),
  {
    loading: () => (
      <div className="mq-wrap grid gap-4 py-10 md:grid-cols-2" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
    ),
  },
);

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/jobs',
    titleAr: 'وظائف الشرق الأوسط — تدريب مقابلات | مقابلة',
    titleEn: 'MENA Jobs — Practice Interviews | Muqabaleh',
    descAr:
      'وظائف حقيقية في الخليج وشمال أفريقيا والشام. يظهر الراتب إن أعلنه صاحب العمل. تدرّب مع جيني ثم قدّم بنفسك لدى الشركة.',
    descEn:
      'Live roles across MENA with published salary when employers share it. Practice with Jeannie, then apply yourself on the company site.',
    keywords:
      locale === 'ar'
        ? [
            'وظائف الشرق الأوسط',
            'وظائف الخليج',
            'وظائف السعودية',
            'وظائف الإمارات',
            'راتب معلن',
            'مقابلة',
          ]
        : [
            'MENA jobs',
            'Gulf jobs',
            'Saudi jobs',
            'UAE jobs',
            'jobs with salary',
            'Muqabaleh',
          ],
  });
}

export default async function JobsPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  const [loaded, liveCount] = await Promise.all([loadJobsSafe(), countMenaJobsSafe()]);
  let jobs = loaded;
  if (!jobs.length) {
    jobs = DEMO_JOBS.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      department: j.department,
      employmentType: j.employmentType,
      description: j.description,
      requirements: j.requirements ?? null,
      applyUrl: j.applyUrl,
      source: j.source,
      salaryLabel: null as string | null,
      company: j.company,
    }));
  }

  // Strict MENA board: location/title signal (or Remote/Hybrid from regional HQ)
  jobs = jobs.filter((j) =>
    isMenaListedRole(j.location, j.title, j.company?.country),
  );

  const roleCount = Math.max(liveCount, jobs.length);

  return (
    <div className="mq-atelier min-h-screen bg-[#05080f]">
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
        transparent
      />

      <JobsHero roleCount={roleCount} />
      <JobsBrowserClient initialJobs={jobs} />

      <div className="mq-wrap pb-12 text-center">
        <p className="text-sm text-white/40">
          {isAr ? 'شركتك تريد حذف إعلاناتها؟' : 'Company want removal?'}{' '}
          <Link href={localePath('/legal/opt-out', locale)} className="text-teal-300 underline">
            {isAr ? 'اطلب الحذف' : 'Opt out'}
          </Link>
        </p>
      </div>

      <CrystalFooter />
    </div>
  );
}

async function countMenaJobsSafe(): Promise<number> {
  try {
    // Count with the same MENA filter as the board (not raw DB total).
    const rows = await db.listedJob.findMany({
      where: {
        isActive: true,
        OR: [{ companyId: null }, { company: { isActive: true } }],
      },
      select: {
        location: true,
        title: true,
        department: true,
        description: true,
        company: { select: { country: true } },
      },
      take: 2000,
      orderBy: { postedAt: 'desc' },
    });
    return rows.filter((j) =>
      isMenaListedRole(j.location, j.title, j.company?.country, {
        department: j.department,
        description: j.description,
      }),
    ).length;
  } catch (err) {
    console.error('[jobs page count]', err);
    return 0;
  }
}

async function loadJobsSafe() {
  try {
    const rows = await db.listedJob.findMany({
      where: {
        isActive: true,
        OR: [{ companyId: null }, { company: { isActive: true } }],
      },
      include: {
        company: {
          select: { name: true, slug: true, country: true, logoUrl: true },
        },
      },
      orderBy: { postedAt: 'desc' },
      take: JOBS_PAGE_TAKE,
    });
    return rows.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      department: j.department,
      employmentType: j.employmentType,
      description: safeJobText(j.description, 280),
      requirements: j.requirements ? safeJobText(j.requirements, 220) : null,
      applyUrl: j.applyUrl,
      source: j.source,
      salaryLabel: j.salaryLabel,
      company: j.company,
    }));
  } catch (err) {
    console.error('[jobs page]', err);
    return [];
  }
}
