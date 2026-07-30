'use client';

import { useTranslations } from 'next-intl';
import { Users, MessageSquare, DollarSign, Activity, UserPlus, CreditCard, ShieldCheck, RefreshCw, PlusCircle, ArrowUpCircle } from 'lucide-react';
import { GlowCard, CountUpStat } from '@/components/brand';
import { Badge } from '@/components/ui/badge';

const KPI_ICONS = [Users, MessageSquare, DollarSign, Activity] as const;
const KPI_KEYS = ['kpiUsers', 'kpiInterviews', 'kpiRevenue', 'kpiDailyActivity'] as const;
const KPI_VALUES = ['1,247', '3,891', '$24,560', '127'];

const EVENT_ICONS = [UserPlus, ArrowUpCircle, CreditCard, ShieldCheck, RefreshCw, PlusCircle] as const;
const EVENT_COLORS = ['text-emerald-400', 'text-cyan', 'text-gold', 'text-[var(--status-amber)]', 'text-red-400', 'text-emerald-400'];
const EVENT_BADGES_BG = ['bg-emerald-500/10 text-emerald-400 border-emerald-500/30', 'bg-cyan/10 text-cyan border-cyan/30', 'bg-gold/10 text-gold border-gold/30', 'bg-[var(--status-amber)]/10 text-[var(--status-amber)] border-[var(--status-amber)]/30', 'bg-red-500/10 text-red-400 border-red-500/30', 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'];
const EVENT_BADGE_KEYS = ['eventUserRegistered', 'eventInterviewCompleted', 'eventPaymentCaptured', 'eventInterviewerApplied', 'eventInterviewerApplied', 'eventSessionAdded'] as const;

const chartData = [65, 42, 78, 55, 90, 70, 85];
const dayKeys = ['daySat', 'daySun', 'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri'] as const;

export default function AdminDashboardPage() {
  const t = useTranslations('adminPanel.dashboard');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
        {t('title')}
      </h1>

      {/* KPI GlowCards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_KEYS.map((key, i) => {
          const Icon = KPI_ICONS[i];
          return (
            <GlowCard key={key}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <Icon size={24} strokeWidth={1.75} className="text-gold" />
                </div>
                <CountUpStat
                  value={KPI_VALUES[i]}
                  label={t(key)}
                  className="text-start"
                />
              </div>
            </GlowCard>
          );
        })}
      </div>

      {/* Weekly Activity Chart */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('weeklyActivity')}
        </h2>
        <div className="flex items-end justify-between gap-2 h-48">
          {chartData.map((val, i) => (
            <div key={dayKeys[i]} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-gold/40 to-gold transition-all"
                style={{ height: `${(val / 100) * 160}px` }}
              />
              <span className="text-xs text-[var(--text-faint)]">
                {t(dayKeys[i])}
              </span>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Recent Events */}
      <GlowCard>
        <h2 className="mb-4 text-lg font-bold text-[var(--text-primary)]">
          {t('recentEvents')}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const Icon = EVENT_ICONS[n - 1];
            return (
              <div
                key={n}
                className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.04]"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${EVENT_COLORS[n - 1]}`}>
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-[var(--text-primary)]">
                    {t(`event${n}` as `event${number}`)}
                  </p>
                </div>
                <Badge variant="outline" className={EVENT_BADGES_BG[n - 1]}>
                  {t(`time${n}` as `time${number}`)}
                </Badge>
              </div>
            );
          })}
        </div>
      </GlowCard>
    </div>
  );
}
