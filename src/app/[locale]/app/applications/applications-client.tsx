'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Briefcase, Loader2, MapPin, MessageSquareText } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

type Application = {
  id: string;
  stage: string;
  score: number | null;
  employerNote?: string | null;
  createdAt: string;
  job: {
    id: string;
    title: string;
    titleAr?: string | null;
    city?: string | null;
    country?: string | null;
    company?: { name: string } | null;
  };
};

const STAGE_STYLE: Record<string, string> = {
  NEW: 'border-teal-300/30 bg-teal-400/10 text-teal-300',
  REVIEWING: 'border-sky-300/30 bg-sky-400/10 text-sky-200',
  SCREENING: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-200',
  INTERVIEW: 'border-amber-300/30 bg-amber-400/10 text-amber-200',
  OFFER: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-300',
  HIRED: 'border-emerald-300/40 bg-emerald-500/15 text-emerald-200',
  REJECTED: 'border-rose-300/30 bg-rose-500/10 text-rose-300',
  WITHDRAWN: 'border-white/15 bg-white/5 text-white/50',
};

export function ApplicationsClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const t = useTranslations('app.applications');
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/candidate/applications')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed');
        if (!cancelled) setItems(data.applications || []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 text-white/50">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('loading')}
      </div>
    );
  }

  if (error) {
    return (
      <p className="mt-8 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </p>
    );
  }

  if (!items.length) {
    return (
      <div className="mq-panel mt-8 rounded-2xl p-8 text-center">
        <Briefcase className="mx-auto text-teal-300" size={36} strokeWidth={1.5} />
        <p className="mt-4 text-white/70">{t('empty')}</p>
        <Link
          href={localePath('/portal/jobs', locale)}
          className="mq-btn mq-btn-primary mt-6 inline-flex px-5 py-2.5 text-sm"
        >
          {t('browseJobs')}
        </Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 space-y-3">
      {items.map((app) => {
        const title = isAr && app.job.titleAr ? app.job.titleAr : app.job.title;
        const stageClass = STAGE_STYLE[app.stage] || STAGE_STYLE.NEW;
        const place = [app.job.city, app.job.country].filter(Boolean).join(', ');
        const note = app.employerNote?.trim();
        return (
          <li key={app.id}>
            <div className="mq-panel rounded-2xl p-4">
              <Link
                href={localePath(`/portal/jobs/${app.job.id}`, locale)}
                className="flex flex-col gap-3 transition hover:opacity-95 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm text-white/55">
                    {app.job.company?.name || (isAr ? 'شركة' : 'Company')}
                  </p>
                  {place ? (
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-white/40">
                      <MapPin size={12} />
                      {place}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-bold ${stageClass}`}
                  >
                    {t(`stage.${app.stage}` as 'stage.NEW')}
                  </span>
                  <span className="text-xs text-white/40">
                    {new Date(app.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </Link>
              {note ? (
                <div className="mt-3 rounded-xl border border-teal-300/20 bg-teal-400/5 px-3 py-2.5">
                  <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300">
                    <MessageSquareText size={13} strokeWidth={1.75} />
                    {t('employerNote')}
                  </p>
                  <p className="whitespace-pre-wrap text-sm text-white/70">{note}</p>
                </div>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
