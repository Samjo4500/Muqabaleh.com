'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const JOBS = [
  { title: 'job1Title', industry: 'job1Industry', candidates: 'job1Candidates', completed: 'job1Completed', status: 'job1Status', date: 'job1Date' },
  { title: 'job2Title', industry: 'job2Industry', candidates: 'job2Candidates', completed: 'job2Completed', status: 'job2Status', date: 'job2Date' },
  { title: 'job3Title', industry: 'job3Industry', candidates: 'job3Candidates', completed: 'job3Completed', status: 'job3Status', date: 'job3Date' },
] as const;

function statusColor(status: string) {
  if (status === 'statusActive') return 'border-emerald/30 bg-emerald/10 text-emerald';
  if (status === 'statusCompleted') return 'border-gold/30 bg-gold/10 text-gold';
  return 'border-white/20 bg-white/5 text-[var(--text-muted)]';
}

export default function JobsListPage() {
  const t = useTranslations('b2b.jobs');

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        <Link href="/b2b/jobs/new">
          <Button className="btn-gold flex items-center gap-2 cursor-pointer">
            <Plus size={18} strokeWidth={1.75} />
            {t('createJob')}
          </Button>
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('jobTitle')}</th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('industry')}</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('candidatesCount')}</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('completedCount')}</th>
              <th className="px-4 py-3 text-center font-medium text-[var(--text-muted)]">{t('status')}</th>
              <th className="px-4 py-3 text-start font-medium text-[var(--text-muted)]">{t('createdDate')}</th>
            </tr>
          </thead>
          <tbody>
            {JOBS.map((job, i) => (
              <tr
                key={i}
                className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <Link href={`/b2b/jobs/${i + 1}`} className="font-medium text-[var(--text-primary)] hover:text-gold transition-colors">
                    {t(job.title)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{t(job.industry)}</td>
                <td className="px-4 py-3 text-center text-[var(--text-primary)]">{t(job.candidates)}</td>
                <td className="px-4 py-3 text-center text-[var(--text-primary)]">{t(job.completed)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant="outline" className={statusColor(job.status)}>
                    {t(job.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[var(--text-faint)]">{t(job.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 md:hidden">
        {JOBS.map((job, i) => (
          <Link
            key={i}
            href={`/b2b/jobs/${i + 1}`}
            className="glass-card block rounded-xl p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-[var(--text-primary)]">{t(job.title)}</p>
                <p className="mt-1 text-xs text-[var(--text-faint)]">{t(job.industry)}</p>
              </div>
              <Badge variant="outline" className={statusColor(job.status)}>
                {t(job.status)}
              </Badge>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
              <span>{t('candidatesCount')}: {t(job.candidates)}</span>
              <span>{t('completedCount')}: {t(job.completed)}</span>
              <span className="ms-auto text-[var(--text-faint)]">{t(job.date)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
