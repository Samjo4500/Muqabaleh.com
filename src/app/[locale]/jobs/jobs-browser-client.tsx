'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ExternalLink, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

export type ListedJobCard = {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string | null;
  employmentType: string | null;
  description: string;
  applyUrl: string;
  source: string;
  company: {
    name: string;
    slug: string;
    country: string;
    logoUrl: string | null;
  } | null;
};

export function JobsBrowserClient({ initialJobs }: { initialJobs: ListedJobCard[] }) {
  const locale = useLocale();
  const isAr = locale === 'ar';

  if (!initialJobs.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
        <p className="text-white/70">
          {isAr
            ? 'لا توجد وظائف نشطة بعد. سنضيف إعلانات أصحاب العمل وواجهات ATS العامة قريباً.'
            : 'No active jobs yet. Employer posts and public ATS listings are coming online.'}
        </p>
        <Link
          href={localePath('/interview/prequal', locale)}
          className="mq-btn mq-btn-primary mt-6 inline-flex min-h-[48px] items-center gap-2 px-5 text-sm font-bold"
        >
          <Sparkles size={16} />
          {isAr ? 'تدرّب مع جيني الآن' : 'Practice with Jeannie now'}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {initialJobs.map((job) => (
        <article
          key={job.id}
          className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="mq-display text-lg font-bold text-white md:text-xl">{job.title}</h2>
              <p className="mt-1 text-sm text-white/55">
                {job.company?.name ?? (isAr ? 'شركة' : 'Company')}
                {job.location ? ` · ${job.location}` : ''}
              </p>
            </div>
            <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
              {job.source === 'EMPLOYER_POSTED' ? (isAr ? 'صاحب عمل' : 'Employer') : job.source}
            </span>
          </div>
          <p className="mb-5 flex-1 text-sm leading-relaxed text-white/50">
            {job.description.slice(0, 300)}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={localePath(
                job.company
                  ? `/companies/${job.company.slug}/${job.slug}`
                  : `/jobs/${job.id}`,
                locale,
              )}
              className="mq-btn mq-btn-primary inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 text-sm font-bold"
            >
              <Sparkles size={15} />
              {isAr ? 'تدرّب لهذه الوظيفة' : 'Practice for this role'}
            </Link>
            <a
              href={job.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mq-btn mq-btn-ghost inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 text-sm font-bold"
            >
              <ExternalLink size={15} />
              {isAr ? 'قدّم على موقع الشركة' : 'Apply on company site'}
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
