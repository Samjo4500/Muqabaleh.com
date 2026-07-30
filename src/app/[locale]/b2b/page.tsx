'use client';

import { useTranslations } from 'next-intl';
import { Users, CheckCircle2, BarChart3, Clock, AlertTriangle, Activity } from 'lucide-react';
import { GlowCard } from '@/components/brand';

const KPIS = [
  { key: 'kpiCandidates', value: 47, icon: Users, color: 'text-gold' },
  { key: 'kpiCompleted', value: 23, icon: CheckCircle2, color: 'text-emerald' },
  { key: 'kpiAvgScore', value: 78, icon: BarChart3, color: 'text-cyan' },
  { key: 'kpiSessionsLeft', value: 15, icon: Clock, color: 'text-gold' },
  { key: 'kpiSlaBreached', value: 3, icon: AlertTriangle, color: 'text-red-500' },
] as const;

const ACTIVITIES = ['activity1', 'activity2', 'activity3', 'activity4', 'activity5'] as const;
const TIMES = ['time1', 'time2', 'time3', 'time4', 'time5'] as const;

export default function B2BDashboardPage() {
  const t = useTranslations('b2b.dashboard');

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('title')}</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <GlowCard key={kpi.key} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg bg-white/5 p-2.5 ${kpi.color}`}>
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">
                    {kpi.value}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{t(kpi.key)}</p>
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* Recent Activity */}
      <GlowCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Activity size={20} strokeWidth={1.75} className="text-gold" />
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {t('recentActivity')}
          </h2>
        </div>
        <div className="space-y-4">
          {ACTIVITIES.map((act, i) => (
            <div
              key={act}
              className="flex items-start justify-between gap-4 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <span className="text-sm text-[var(--text-muted)]">{t(act)}</span>
              </div>
              <span className="shrink-0 text-xs text-[var(--text-faint)]">
                {t(TIMES[i])}
              </span>
            </div>
          ))}
        </div>
      </GlowCard>
    </div>
  );
}
