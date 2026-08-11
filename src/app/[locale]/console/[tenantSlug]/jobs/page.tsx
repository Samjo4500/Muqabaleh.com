'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, QrCode } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import type { ConsoleJobPosting } from '@/lib/console/types';
import { ConsoleEmptyState } from '@/components/console/console-empty-state';

export default function JobsPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const to = useTranslations('console.onboarding');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [jobs, setJobs] = useState<ConsoleJobPosting[] | null>(null);

  useEffect(() => {
    fetch(`/api/console/${tenantSlug}/jobs`)
      .then((r) => r.json())
      .then((j) => setJobs(j.jobs || []));
  }, [tenantSlug]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mq-console-title text-[1.65rem]">{t('jobsTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--c-text-2)]">{t('jobsHint')}</p>
        </div>
        <Link
          href={localePath(`/console/${tenantSlug}/jobs/new`, locale)}
          data-tour="cta-create-job"
          className="mq-console-btn-primary inline-flex items-center gap-2"
        >
          <Plus size={16} />
          {t('qaCreateJob')}
        </Link>
      </div>

      {jobs && jobs.length === 0 ? (
        <ConsoleEmptyState
          title={to('emptyJobsTitle')}
          body={to('emptyJobsBody')}
          ctaLabel={to('emptyJobsCta')}
          ctaHref={localePath(`/console/${tenantSlug}/jobs/new`, locale)}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {(jobs || []).map((job) => {
            const link = `https://muqabaleh.com/interview/${tenantSlug}/${job.interviewSlug}`;
            return (
              <div key={job.id} className="mq-console-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-[var(--c-text)]">
                      {isAr ? job.titleAr || job.title : job.title}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--c-text-2)]">
                      {job.difficulty} · {job.language} · {job.status}
                    </p>
                  </div>
                  <span className="rounded-md bg-[var(--c-primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--c-primary)]">
                    {job.applicantCount ?? 0}
                  </span>
                </div>
                <p className="mt-3 break-all text-xs text-[var(--c-text-2)]">{link}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(link)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mq-console-btn-ghost inline-flex items-center gap-1 text-sm"
                  >
                    <QrCode size={14} />
                    QR
                  </a>
                  <Link
                    href={localePath(`/console/${tenantSlug}/jobs/${job.id}`, locale)}
                    className="mq-console-btn-ghost text-sm"
                  >
                    {t('edit')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
