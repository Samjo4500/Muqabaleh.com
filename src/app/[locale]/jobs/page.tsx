import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { JobsHero } from '@/components/jobs/JobsHero';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { JobsItemListJsonLd } from '@/components/json-ld';
import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import {
  JOBS_BOARD_TAKE,
  latestPostedAtIso,
  toJobsBoardCard,
} from '@/lib/jobs/board';
import { isMenaListedRole } from '@/lib/jobs/mena';
import { localePath } from '@/i18n/navigation';
import { pageMetadata } from '@/lib/seo';

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

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/jobs',
    titleAr: 'وظائف الشرق الأوسط — استعد ثم قدّم | مقابلة',
    titleEn: 'MENA jobs — practice then apply | Muqabaleh',
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

  let jobs = await loadJobsSafe();
  if (!jobs.length) {
    jobs = DEMO_JOBS.map((j) =>
      toJobsBoardCard({
        id: j.id,
        title: j.title,
        slug: j.slug,
        location: j.location,
        department: j.department,
        employmentType: j.employmentType,
        description: j.description,
        applyUrl: j.applyUrl,
        source: j.source,
        salaryLabel: null,
        postedAt: null,
        company: j.company,
      }),
    );
  }

  // Strict MENA board: location/title signal (or Remote/Hybrid from regional HQ)
  jobs = jobs.filter((j) =>
    isMenaListedRole(j.location, j.title, j.company?.country),
  );

  const roleCount = jobs.length;
  const updatedIso = latestPostedAtIso(jobs);

  return (
    <div className="mq-atelier min-h-screen bg-[#05080f]">
      <JobsItemListJsonLd
        locale={locale}
        jobs={jobs.map((j) => ({
          title: j.title,
          slug: j.slug,
          companySlug: j.company?.slug ?? null,
        }))}
      />
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
        transparent
      />

      <JobsHero roleCount={roleCount} />
      <JobsBrowserClient initialJobs={jobs} updatedAt={updatedIso} />

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

async function loadJobsSafe() {
  try {
    const rows = await db.listedJob.findMany({
      where: {
        isActive: true,
        OR: [{ companyId: null }, { company: { isActive: true } }],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        location: true,
        department: true,
        employmentType: true,
        description: true,
        applyUrl: true,
        source: true,
        salaryLabel: true,
        postedAt: true,
        company: {
          select: { name: true, slug: true, country: true },
        },
      },
      orderBy: { postedAt: 'desc' },
      take: JOBS_BOARD_TAKE,
    });
    return rows.map(toJobsBoardCard);
  } catch (err) {
    console.error('[jobs page]', err);
    return [];
  }
}
