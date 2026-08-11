'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  Clock3,
  FileBadge2,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  UserPlus,
  BarChart3,
} from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { scoreColor } from '@/lib/console/defaults';
import { CONSOLE_PRODUCT, getConsoleEdition } from '@/lib/console/identity';
import {
  isDemoPassport,
  markDemoCleared,
  readDemoCleared,
} from '@/lib/console/onboarding';
import type {
  ConsoleDashboard,
  ConsoleOrganization,
  OrgMemberRole,
  TenantType,
} from '@/lib/console/types';
import { useParams } from 'next/navigation';
import { ConsoleEmptyState } from '@/components/console/console-empty-state';
import { SetupChecklist } from '@/components/console/setup-checklist';

function roleWelcomeKey(
  role: OrgMemberRole | null,
  tenantType: TenantType | undefined,
):
  | 'welcomeOwner'
  | 'welcomeHiringManager'
  | 'welcomeReviewer'
  | 'welcomeDean'
  | 'welcomeAgency' {
  if (tenantType === 'AGENCY') return 'welcomeAgency';
  if (tenantType === 'ACADEMY') return 'welcomeDean';
  if (role === 'HIRING_MANAGER') return 'welcomeHiringManager';
  if (role === 'REVIEWER' || role === 'INTERVIEWER') return 'welcomeReviewer';
  return 'welcomeOwner';
}

export default function ConsoleDashboardPage() {
  const params = useParams();
  const tenantSlug = String(params.tenantSlug);
  const t = useTranslations('console');
  const to = useTranslations('console.onboarding');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [org, setOrg] = useState<ConsoleOrganization | null>(null);
  const [dash, setDash] = useState<ConsoleDashboard | null>(null);
  const [role, setRole] = useState<OrgMemberRole | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [jobCount, setJobCount] = useState(0);
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    const [dashRes, jobsRes, teamRes] = await Promise.all([
      fetch(`/api/console/${tenantSlug}/dashboard`),
      fetch(`/api/console/${tenantSlug}/jobs`),
      fetch(`/api/console/${tenantSlug}/team`),
    ]);
    const dashJson = await dashRes.json();
    const jobsJson = await jobsRes.json();
    const teamJson = await teamRes.json();
    setOrg(dashJson.organization || null);
    const nextDash = dashJson.dashboard || null;
    if (nextDash && readDemoCleared(tenantSlug)) {
      nextDash.feed = (nextDash.feed || []).filter(
        (p: { tags?: string[] | null }) => !isDemoPassport(p.tags),
      );
      nextDash.kpis = {
        ...nextDash.kpis,
        passportsReceived: nextDash.feed.length,
        interviewsCompleted: nextDash.feed.length,
        avgScore: nextDash.feed.length
          ? Math.round(
              nextDash.feed.reduce(
                (s: number, p: { score: number }) => s + p.score,
                0,
              ) / nextDash.feed.length,
            )
          : 0,
      };
    }
    setDash(nextDash);
    setRole(dashJson.role || null);
    setUsingDemo(Boolean(dashJson.usingDemo));
    setJobCount((jobsJson.jobs || []).length);
    setMemberCount((teamJson.members || []).length);
    setLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await load();
      if (cancelled) return;
    };
    void run();
    const timer = setInterval(() => void load(), 20000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  const facts = useMemo(
    () => ({
      hasLogo: Boolean(org?.whiteLabel?.logoUrl),
      hasJob: jobCount > 0,
      hasInvite: memberCount > 1,
      hasPassport: (dash?.feed?.length || 0) > 0,
      hasQuestions: jobCount > 0,
    }),
    [org, jobCount, memberCount, dash?.feed?.length],
  );

  const clearDemo = async () => {
    setClearing(true);
    markDemoCleared(tenantSlug);
    await fetch(`/api/console/${tenantSlug}/demo/clear`, {
      method: 'POST',
      credentials: 'same-origin',
    });
    setConfirmClear(false);
    setClearing(false);
    await load();
  };

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
  const welcomeKey = roleWelcomeKey(role, org?.tenantType);
  const demoCount = (dash?.feed || []).filter((p) => isDemoPassport(p.tags)).length;

  const copyInterviewLink = async () => {
    const link = `${window.location.origin}/interview/${tenantSlug}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-8">
      <SetupChecklist tenantSlug={tenantSlug} facts={facts} />

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
            {to(welcomeKey)}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-[var(--c-text-2)]">
            {org?.name}
            {usingDemo && demoCount > 0 ? (
              <span className="ms-2 inline-flex items-center gap-2">
                <span className="rounded-md bg-[var(--c-primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--c-primary)]">
                  {to('demoBadge')}
                </span>
              </span>
            ) : null}
          </p>
          {usingDemo && demoCount > 0 ? (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="mq-console-btn-ghost mt-3 inline-flex items-center gap-1.5 text-xs"
            >
              <Trash2 size={13} strokeWidth={1.5} />
              {to('clearDemo')}
            </button>
          ) : null}
        </div>
      </section>

      {confirmClear ? (
        <div className="mq-console-surface border border-amber-500/30 p-4">
          <p className="text-sm text-[var(--c-text)]">{to('clearDemoConfirm')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={clearing}
              onClick={() => void clearDemo()}
              className="mq-console-btn-primary text-sm"
            >
              {clearing ? t('loading') : to('clearDemoConfirmBtn')}
            </button>
            <button
              type="button"
              onClick={() => setConfirmClear(false)}
              className="mq-console-btn-ghost text-sm"
            >
              {to('clearDemoCancel')}
            </button>
          </div>
        </div>
      ) : null}

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
            data-tour="cta-create-job"
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

      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        data-tour="kpi-cards"
      >
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="mq-console-card p-5">
              <div className="flex items-center justify-between">
                <p className="mq-console-eyebrow">{k.label}</p>
                <Icon
                  size={15}
                  strokeWidth={1.5}
                  className="text-[var(--c-primary)] opacity-80"
                />
              </div>
              <p className="mq-console-metric mt-3 text-[2rem] text-[var(--c-text)] md:text-[2.25rem]">
                {k.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="mq-console-surface p-5 md:p-6" data-tour="passport-feed">
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
          {(dash?.feed || []).slice(0, 8).map((p) => {
            const name =
              isAr && p.candidateNameAr ? p.candidateNameAr : p.candidateName;
            return (
              <div
                key={p.id}
                className="mq-console-card flex flex-wrap items-center gap-3 px-3.5 py-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-xs font-normal tracking-wide text-[var(--c-primary)]">
                  {name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium tracking-tight text-[var(--c-text)]">
                    {name}
                    {isDemoPassport(p.tags) ? (
                      <span className="ms-2 rounded bg-[var(--c-primary-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--c-primary)]">
                        {to('demoBadge')}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-[var(--c-text-3)]">
                    {isAr ? p.roleAr || p.role : p.role} ·{' '}
                    {new Date(p.submittedAt).toLocaleString(isAr ? 'ar' : 'en')}
                  </p>
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-normal tabular-nums tracking-wide"
                  style={{
                    color: scoreColor(p.score),
                    background: `${scoreColor(p.score)}18`,
                  }}
                >
                  {p.score} · {p.grade}
                </span>
                <Link
                  href={localePath(
                    `/console/${tenantSlug}/passports/${p.id}`,
                    locale,
                  )}
                  className="mq-console-btn-ghost text-sm"
                >
                  {t('view')}
                </Link>
              </div>
            );
          })}
          {!dash?.feed?.length ? (
            <ConsoleEmptyState
              title={to('emptyPassportsTitle')}
              body={to('emptyPassportsBody')}
              ctaLabel={copied ? to('linkCopied') : to('emptyPassportsCta')}
              onCtaClick={() => void copyInterviewLink()}
            />
          ) : null}
        </div>
      </section>
    </div>
  );
}
