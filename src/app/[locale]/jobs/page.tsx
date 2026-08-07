import type { Metadata } from 'next';
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
import { JobsBrowserClient } from './jobs-browser-client';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    locale,
    path: '/jobs',
    titleAr: 'وظائف المنطقة — تدرّب ثم قدّم | مقابلة',
    titleEn: 'MENA jobs — practice then apply | Muqabaleh',
    descAr:
      'أدوار حقيقية عبر دول المنطقة مع راتب معلن عند نشره. تدرّب مع جيني ثم قدّم بنفسك على موقع الشركة.',
    descEn:
      'Live roles across MENA with published salary when employers share it. Practice with Jeannie, then apply yourself on the company site.',
  });
}

export default async function JobsPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  let jobs = await loadJobsSafe();
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

  return (
    <div className="mq-atelier min-h-screen bg-[#05080f]">
      <JobPortalChrome
        backHref="/"
        backLabel={{ en: 'Home', ar: 'الرئيسية' }}
        transparent
      />

      <JobsHero roleCount={jobs.length} />
      <JobsBrowserClient initialJobs={jobs} />

      <div className="mq-wrap pb-12 text-center">
        <p className="text-sm text-white/40">
          {isAr ? 'شركة تريد الإزالة؟' : 'Company want removal?'}{' '}
          <Link href={localePath('/legal/opt-out', locale)} className="text-teal-300 underline">
            {isAr ? 'طلب إزالة' : 'Opt out'}
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
      include: {
        company: {
          select: { name: true, slug: true, country: true, logoUrl: true },
        },
      },
      orderBy: { postedAt: 'desc' },
      take: 400,
    });
    return rows.map((j) => ({
      id: j.id,
      title: j.title,
      slug: j.slug,
      location: j.location,
      department: j.department,
      employmentType: j.employmentType,
      description: safeJobText(j.description),
      requirements: j.requirements ? safeJobText(j.requirements, 400) : null,
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
