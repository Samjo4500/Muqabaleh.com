import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { db } from '@/lib/db';
import { localePath } from '@/i18n/navigation';
import { JobsBrowserClient } from './jobs-browser-client';

export default async function JobsPage() {
  const locale = await getLocale();
  const isAr = locale === 'ar';

  let jobs: Awaited<ReturnType<typeof loadJobs>> = [];
  try {
    jobs = await loadJobs();
  } catch (err) {
    console.error('[jobs page]', err);
  }

  return (
    <div className="mq-atelier min-h-screen">
      <CrystalNavbar />
      <main className="mq-wrap py-12 md:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mq-kicker mb-3">{isAr ? 'الوظائف' : 'Jobs'}</p>
          <h1 className="mq-display text-3xl font-bold text-white md:text-5xl">
            {isAr ? 'تصفّح الأدوار. تدرّب. قدّم بنفسك.' : 'Browse roles. Practice. Apply yourself.'}
          </h1>
          <p className="mt-3 text-base text-white/55 md:text-lg">
            {isAr
              ? 'إعلانات أصحاب العمل وواجهات ATS العامة فقط. التقديم دائماً على موقع الشركة — مقابلة لا تقدّم نيابةً عنك.'
              : 'Employer posts and public ATS feeds only. Apply always on the company site — Muqabaleh never applies for you.'}
          </p>
        </div>

        <JobsBrowserClient
          initialJobs={jobs.map((j) => ({
            id: j.id,
            title: j.title,
            slug: j.slug,
            location: j.location,
            department: j.department,
            employmentType: j.employmentType,
            description: j.description,
            applyUrl: j.applyUrl,
            source: j.source,
            company: j.company,
          }))}
        />

        <p className="mt-10 text-sm text-white/40">
          {isAr ? 'شركة تريد الإزالة؟' : 'Company want removal?'}{' '}
          <Link href={localePath('/legal/opt-out', locale)} className="text-teal-300 underline">
            {isAr ? 'طلب إزالة' : 'Opt out'}
          </Link>
        </p>
      </main>
      <CrystalFooter />
    </div>
  );
}

async function loadJobs() {
  return db.listedJob.findMany({
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
    take: 48,
  });
}
