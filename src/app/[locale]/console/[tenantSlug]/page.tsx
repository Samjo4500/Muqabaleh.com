'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  Clock3,
  FileBadge2,
  Loader2,
  Plus,
  Sparkles,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { scoreColor } from '@/lib/console/defaults';
import type { ConsoleDashboard, ConsoleOrganization } from '@/lib/console/types';
import { useParams } from 'next/navigation';

export default function ConsoleDashboardPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [org, setOrg] = useState<ConsoleOrganization | null>(null);
  const [dash, setDash] = useState<ConsoleDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch(`/api/console/${tenantSlug}/dashboard`);
      const json = await res.json();
      if (cancelled) return;
      setOrg(json.organization || null);
      setDash(json.dashboard || null);
      setLoading(false);
    };
    void load();
    const timer = setInterval(() => void load(), 20000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--c-text-2)]">
        <Loader2 className="animate-spin" size={16} />
        {t('loading')}
      </div>
    );
  }

  const kpis = [
    {
      label: t('kpiPassports'),
      value: dash?.kpis.passportsReceived ?? 0,
      icon: FileBadge2,
    },
    {
      label: t('kpiAvgScore'),
      value: dash?.kpis.avgScore ?? 0,
      icon: Sparkles,
    },
    {
      label: t('kpiInterviews'),
      value: dash?.kpis.interviewsCompleted ?? 0,
      icon: BarChart3,
    },
    {
      label: t('kpiTimeSaved'),
      value: `${dash?.kpis.timeSavedHours ?? 0}h`,
      icon: Clock3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--c-text)]">{t('dashboardTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--c-text-2)]">
            {org?.name} · {t('liveFeedHint')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={localePath(`/console/${tenantSlug}/jobs/new`, locale)}
            className="mq-console-btn-primary inline-flex items-center gap-2"
          >
            <Plus size={16} />
            {t('qaCreateJob')}
          </Link>
          <Link
            href={localePath(`/console/${tenantSlug}/team`, locale)}
            className="mq-console-btn-ghost inline-flex items-center gap-2"
          >
            <UserPlus size={16} />
            {t('qaInvite')}
          </Link>
          <Link
            href={localePath(`/console/${tenantSlug}/analytics`, locale)}
            className="mq-console-btn-ghost inline-flex items-center gap-2"
          >
            <BarChart3 size={16} />
            {t('qaReport')}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="mq-console-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--c-text-2)]">
                  {k.label}
                </p>
                <Icon size={16} className="text-[var(--c-primary)]" />
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums text-[var(--c-text)]">
                {k.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mq-console-surface rounded-xl p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[var(--c-text)]">{t('passportFeed')}</h3>
          <Link
            href={localePath(`/console/${tenantSlug}/pipeline`, locale)}
            className="text-sm font-semibold text-[var(--c-primary)]"
          >
            {t('openPipeline')}
          </Link>
        </div>
        <div className="space-y-2">
          {(dash?.feed || []).slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="mq-console-card flex flex-wrap items-center gap-3 p-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--c-primary-soft)] text-sm font-bold text-[var(--c-primary)]">
                {p.candidateName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-[var(--c-text)]">{p.candidateName}</p>
                <p className="truncate text-xs text-[var(--c-text-2)]">
                  {isAr ? p.roleAr || p.role : p.role} ·{' '}
                  {new Date(p.submittedAt).toLocaleString(isAr ? 'ar' : 'en')}
                </p>
              </div>
              <span
                className="rounded-md px-2 py-1 text-sm font-bold tabular-nums"
                style={{ color: scoreColor(p.score), background: `${scoreColor(p.score)}22` }}
              >
                {p.score}
              </span>
              <Link
                href={localePath(`/console/${tenantSlug}/passports/${p.id}`, locale)}
                className="mq-console-btn-ghost text-sm"
              >
                {t('view')}
              </Link>
            </div>
          ))}
          {!dash?.feed?.length ? (
            <p className="py-8 text-center text-sm text-[var(--c-text-2)]">{t('emptyFeed')}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
