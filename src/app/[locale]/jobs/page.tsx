import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { JobPortalChrome } from '@/components/jobs/JobPortalChrome';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { db } from '@/lib/db';
import { DEMO_JOBS } from '@/lib/jobs/demo-listings';
import { localePath } from '@/i18n/navigation';
import { JobsBrowserClient } from './jobs-browser-client';

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
      applyUrl: j.applyUrl,
      source: j.source,
      company: j.company,
    }));
  }

  return (
    <div className="mq-atelier min-h-screen">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
      </div>
      <JobPortalChrome backHref="/" backLabel={{ en: 'Home', ar: 'الرئيسية' }} />

      <main className="mq-wrap py-10 md:py-14">
        <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-teal-300/20 px-6 py-10 md:px-10 md:py-14">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 15% 20%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(ellipse 50% 60% at 90% 80%, rgba(232,201,122,0.1), transparent 50%), linear-gradient(180deg, rgba(8,14,26,0.9), rgba(5,8,15,0.95))',
            }}
            aria-hidden
          />
          <div className="relative max-w-2xl">
            <p className="mq-kicker mb-3 text-teal-200/90">{isAr ? 'لوحة الوظائف' : 'Job portal'}</p>
            <h1 className="mq-display text-3xl font-bold tracking-tight text-white md:text-5xl">
              {isAr ? 'أدوار حقيقية. تدرّب أولاً. قدّم بنفسك.' : 'Real roles. Practice first. Apply yourself.'}
            </h1>
            <p className="mt-4 text-base text-white/60 md:text-lg">
              {isAr
                ? 'اختر وظيفة، تدرّب عليها مع جيني، ثم افتح موقع الشركة للتقديم. مقابلة لا تقدّم نيابةً عنك.'
                : 'Pick a role, practice it with Jeannie, then open the company site to apply. Muqabaleh never applies for you.'}
            </p>
          </div>
        </div>

        <JobsBrowserClient initialJobs={jobs} />

        <p className="mt-12 text-center text-sm text-white/40">
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
      take: 48,
    });
    return rows.map((j) => ({
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
    }));
  } catch (err) {
    console.error('[jobs page]', err);
    return [];
  }
}
