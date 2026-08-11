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
import { CONSOLE_PRODUCT, getConsoleEdition } from '@/lib/console/identity';
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

  const edition = getConsoleEdition(org?.tenantType || 'EMPLOYER');
  const product = isAr ? CONSOLE_PRODUCT.ar : CONSOLE_PRODUCT.en;

  return (
    <div className="space-y-8">
      <section className="mq-console-surface relative overflow-hidden p-5 md:p-6">
        <div
          className="pointer-events-none absolute -end-16 -top-20 h-48 w-48 rounded-full bg-[var(--c-primary)]/10 blur-3xl"
          aria-hidden
        />
        <div className="relative min-w-0">
          <p className="mq-console-eyebrow">
            {product} · {isAr ? edition.ar : edition.en}
          </p>
          <h2 className="mq-console-title mt-1 text-[1.45rem] md:text-[1.7rem]">
            {isAr
              ? `مرحباً بكم في بوابتكم — ${org?.name || ''}`
              : `Welcome to your portal — ${org?.name || 'Leadership'}`}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--c-text-2)]">
            {isAr ? edition.lineAr : edition.lineEn}
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mq-console-eyebrow">{t('dashboardTitle')}</p>
          <h2 className="mq-console-title mt-1 text-[1.45rem] md:text-[1.65rem]">
            {t('commandCenter')}
          </h2>
          <p className="mt-1.5 max-w-xl text-sm text-[var(--c-text-2)]">
            {t('liveFeedHint')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={localePath(`/console/${tenantSlug}/jobs/new`, locale)}
            className="mq-console-btn-primary inline-flex items-center gap-2"
          >
            <Plus size={15} strokeWidth={1.5} />
            {t('qaCreateJob')}
          </Link>
          <Link
            href={localePath(`/console/${tenantSlug}/team`, locale)}
            className="mq-console-btn-ghost inline-flex items-center gap-2"
          >
            <UserPlus size={15} strokeWidth={1.5} />
            {t('qaInvite')}
          </Link>
          <Link
            href={localePath(`/console/${tenantSlug}/analytics`, locale)}
            className="mq-console-btn-ghost inline-flex items-center gap-2"
          >
            <BarChart3 size={15} strokeWidth={1.5} />
            {t('qaReport')}
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="mq-console-card p-5">
              <div className="flex items-center justify-between">
                <p className="mq-console-eyebrow">{k.label}</p>
                <Icon size={15} strokeWidth={1.5} className="text-[var(--c-primary)] opacity-80" />
              </div>
              <p className="mq-console-metric mt-3 text-[2rem] text-[var(--c-text)] md:text-[2.25rem]">
                {k.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mq-console-surface p-5 md:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-medium tracking-tight text-[var(--c-text)]">
              {t('passportFeed')}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--c-text-3)]">{t('liveFeedHint')}</p>
          </div>
          <Link
            href={localePath(`/console/${tenantSlug}/pipeline`, locale)}
            className="text-sm font-normal text-[var(--c-primary)] transition-opacity hover:opacity-80"
          >
            {t('openPipeline')}
          </Link>
        </div>
        <div className="space-y-2">
          {(dash?.feed || []).slice(0, 8).map((p) => (
            <div
              key={p.id}
              className="mq-console-card flex flex-wrap items-center gap-3 px-3.5 py-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-xs font-normal tracking-wide text-[var(--c-primary)]">
                {p.candidateName.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium tracking-tight text-[var(--c-text)]">
                  {p.candidateName}
                </p>
                <p className="truncate text-xs text-[var(--c-text-3)]">
                  {isAr ? p.roleAr || p.role : p.role} ·{' '}
                  {new Date(p.submittedAt).toLocaleString(isAr ? 'ar' : 'en')}
                </p>
              </div>
              <span
                className="rounded-full px-2.5 py-1 text-xs font-normal tabular-nums tracking-wide"
                style={{ color: scoreColor(p.score), background: `${scoreColor(p.score)}18` }}
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
            <p className="py-10 text-center text-sm text-[var(--c-text-3)]">{t('emptyFeed')}</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
