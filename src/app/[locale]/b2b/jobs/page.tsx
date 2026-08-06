'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { localePath } from '@/i18n/navigation';

type JobRow = {
  id: string;
  title: string;
  industry: string;
  status: string;
  isPublic: boolean;
  applicationsCount: number;
  interviewsCount?: number;
  createdAt: string;
  employmentType?: string;
  city?: string | null;
};

function statusColor(status: string) {
  if (status === 'OPEN') return 'border-emerald/30 bg-emerald/10 text-emerald';
  if (status === 'CLOSED') return 'border-white/20 bg-white/5 text-[var(--text-muted)]';
  if (status === 'PAUSED') return 'border-amber-400/30 bg-amber-500/10 text-amber-200';
  return 'border-teal-300/30 bg-teal-400/10 text-teal-300';
}

export default function JobsListPage() {
  const t = useTranslations('b2b.jobs');
  const locale = useLocale();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/b2b/jobs')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed');
        setJobs(d.jobs || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {locale === 'ar'
              ? 'أنشئ وظائف عامة، تابع المتقدمين، وابحث في قاعدة المواهب.'
              : 'Post public roles, track applicants, and search the talent pool.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={localePath("/b2b/talent", locale)}>
            <Button variant="outline" className="cursor-pointer">
              {locale === 'ar' ? 'قاعدة المواهب' : 'Talent pool'}
            </Button>
          </Link>
          <Link href={localePath("/b2b/jobs/new", locale)}>
            <Button className="glass-button flex items-center gap-2 cursor-pointer">
              <Plus size={18} strokeWidth={1.75} />
              {t('createJob')}
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-[var(--text-muted)]">
          <Loader2 className="animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-rose-300">{error}</p>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] p-10 text-center">
          <p className="mb-4 text-[var(--text-muted)]">
            {locale === 'ar' ? 'لا توجد وظائف بعد.' : 'No jobs yet.'}
          </p>
          <Link href={localePath("/b2b/jobs/new", locale)}>
            <Button className="glass-button cursor-pointer">{t('createJob')}</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-white/[0.08]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('jobTitle')}</th>
                  <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('industry')}</th>
                  <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('candidatesCount')}</th>
                  <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('status')}</th>
                  <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('createdDate')}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={localePath(`/b2b/jobs/${job.id}`, locale)}
                        className="font-medium text-[var(--text-primary)] hover:text-teal-300 transition-colors"
                      >
                        {job.title}
                      </Link>
                      {job.isPublic ? (
                        <span className="ms-2 text-[10px] uppercase tracking-wide text-teal-300/80">
                          {locale === 'ar' ? 'عامة' : 'Public'}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">{job.industry}</td>
                    <td className="px-4 py-3 text-center text-[var(--text-primary)]">
                      {job.applicationsCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="outline" className={statusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-faint)]">
                      {new Date(job.createdAt).toLocaleDateString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={localePath(`/b2b/jobs/${job.id}`, locale)}
                className="block rounded-xl border border-white/[0.08] p-4 transition hover:bg-white/[0.02]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-[var(--text-primary)]">{job.title}</h3>
                  <Badge variant="outline" className={statusColor(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  {job.industry} · {job.applicationsCount}{' '}
                  {locale === 'ar' ? 'متقدم' : 'applicants'}
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
