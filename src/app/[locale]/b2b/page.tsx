'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Users,
  CheckCircle2,
  BarChart3,
  Clock,
  AlertTriangle,
  Activity,
  Loader2,
} from 'lucide-react';
import { GlowCard } from '@/components/brand';

type StatsPayload = {
  company?: { name: string; credits: number; plan: string };
  kpis?: {
    candidates: number;
    completed: number;
    avgScore: number;
    sessionsLeft: number;
    slaBreached: number;
  };
  recentActivity?: Array<{ id: string; title: string; stage: string; at: string }>;
};

export default function B2BDashboardPage() {
  const t = useTranslations('b2b.dashboard');
  const [data, setData] = useState<StatsPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/b2b/stats');
        const json = (await res.json()) as StatsPayload & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(json.error || 'Unavailable');
          return;
        }
        setData(json);
      } catch {
        if (!cancelled) setError('Unavailable');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = [
    {
      key: 'kpiCandidates',
      value: data?.kpis?.candidates ?? '—',
      icon: Users,
      color: 'text-teal-300',
    },
    {
      key: 'kpiCompleted',
      value: data?.kpis?.completed ?? '—',
      icon: CheckCircle2,
      color: 'text-emerald',
    },
    {
      key: 'kpiAvgScore',
      value: data?.kpis?.avgScore ?? '—',
      icon: BarChart3,
      color: 'text-cyan',
    },
    {
      key: 'kpiSessionsLeft',
      value: data?.kpis?.sessionsLeft ?? '—',
      icon: Clock,
      color: 'text-teal-300',
    },
    {
      key: 'kpiSlaBreached',
      value: data?.kpis?.slaBreached ?? '—',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>
        {data?.company ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            {data.company.name} · {data.company.plan}
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-amber-200/90">
          {error === 'Unauthorized' || error === 'Forbidden'
            ? 'Sign in as a company admin to see live metrics.'
            : error}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlowCard key={kpi.key} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-white/5 p-2.5 ${kpi.color}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {!data && !error ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      kpi.value
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{t(kpi.key)}</p>
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      <GlowCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={20} strokeWidth={1.75} className="text-teal-300" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {t('recentActivity')}
          </h2>
        </div>
        <div className="space-y-4">
          {(data?.recentActivity || []).length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">
              {error ? '—' : 'No recent applications yet.'}
            </p>
          ) : (
            data!.recentActivity!.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-4 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-teal-500" />
                  <div>
                    <span className="text-sm text-[var(--text-muted)]">{act.title}</span>
                    <p className="text-xs text-[var(--text-faint)]">{act.stage}</p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-[var(--text-faint)]">
                  {new Date(act.at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </GlowCard>
    </div>
  );
}
