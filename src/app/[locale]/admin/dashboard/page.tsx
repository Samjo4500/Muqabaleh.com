'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Building2,
  DollarSign,
  Headphones,
  Mic2,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Health = 'green' | 'yellow' | 'red';

interface StatsPayload {
  widgets: {
    todaysInterviews: number;
    newSignups: number;
    revenueTodayCents: number;
    activeCompanies: number;
    pendingSupportTickets: number;
    apiHealth: Health;
    visitors24h: number;
  };
  charts: {
    revenue7d: { date: string; amount: number }[];
    revenue30d: { date: string; amount: number }[];
    revenue90d: { date: string; amount: number }[];
    completionRate: number;
    completedInterviews: number;
    totalInterviews: number;
    userGrowth: { type: string; count: number }[];
    topIndustries: { industry: string; count: number }[];
  };
}

function formatCents(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const HEALTH_LABEL: Record<Health, BiInlineProps> = {
  green: { ar: 'أخضر — سليم', en: 'Green — Healthy' },
  yellow: { ar: 'أصفر — تحذير', en: 'Yellow — Degraded' },
  red: { ar: 'أحمر — تعطّل', en: 'Red — Down' },
};

type BiInlineProps = { ar: string; en: string };

const PIE_COLORS = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#f472b6', '#60a5fa', '#fb7185', '#94a3b8'];

export default function SuperAdminDashboardPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data?.widgets && data?.charts) setStats(data);
      else setStats(null);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const revenueSeries = useMemo(() => {
    if (!stats) return [];
    if (range === '30d') return stats.charts.revenue30d;
    if (range === '90d') return stats.charts.revenue90d;
    return stats.charts.revenue7d;
  }, [stats, range]);

  const w = stats?.widgets;
  const health = w?.apiHealth ?? 'yellow';

  const cards = [
    {
      label: L.todaysInterviews,
      value: w ? String(w.todaysInterviews) : '—',
      icon: Mic2,
    },
    {
      label: L.newSignups,
      value: w ? String(w.newSignups) : '—',
      icon: UserPlus,
    },
    {
      label: L.revenueToday,
      value: w ? formatCents(w.revenueTodayCents) : '—',
      icon: DollarSign,
    },
    {
      label: L.activeCompanies,
      value: w ? String(w.activeCompanies) : '—',
      icon: Building2,
    },
    {
      label: L.pendingTickets,
      value: w ? String(w.pendingSupportTickets) : '—',
      icon: Headphones,
    },
    {
      label: L.apiHealth,
      value: HEALTH_LABEL[health].ar.split('—')[0].trim() + ' / ' + health.toUpperCase(),
      icon: Activity,
      accent: health as 'green' | 'yellow' | 'red',
    },
    {
      label: L.visitors24h,
      value: w ? String(w.visitors24h) : '—',
      icon: Users,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.dashboard.ar, en: L.dashboard.en }}
        description={{
          ar: 'لوحة التحكم الرئيسية — مقابلات اليوم، الإيرادات، الشركات، الدعم، وحالة APIs.',
          en: 'Main control panel — interviews, revenue, companies, support, and API health.',
        }}
        backHref="/admin/dashboard"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} className="gap-2">
            <RefreshCw size={14} />
            <BiInline ar={L.refresh.ar} en={L.refresh.en} />
          </Button>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <AdminStatCard
            key={c.label.en}
            label={c.label}
            value={c.value}
            icon={c.icon}
            loading={loading}
            accent={'accent' in c ? c.accent : undefined}
          />
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <BiLabel ar={L.revenueTrend.ar} en={L.revenueTrend.en} />
            <div className="flex gap-1 rounded-lg border border-white/10 p-1">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-medium transition',
                    range === r ? 'bg-cyan-500/20 text-cyan-200' : 'text-[var(--text-muted)] hover:bg-white/5',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#22d3ee" fill="url(#revFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <div className="mb-4">
            <BiLabel ar={L.completionRate.ar} en={L.completionRate.en} />
          </div>
          <div className="mb-4 flex items-end gap-3">
            <p className="text-4xl font-bold text-cyan-300">
              {loading ? '—' : `${stats?.charts.completionRate ?? 0}%`}
            </p>
            <p className="pb-1 text-sm text-[var(--text-muted)]">
              {stats
                ? `${stats.charts.completedInterviews} / ${stats.charts.totalInterviews}`
                : ''}
            </p>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-l from-cyan-400 to-emerald-400 transition-all"
              style={{ width: `${stats?.charts.completionRate ?? 0}%` }}
            />
          </div>
          <div className="mt-6 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.charts.userGrowth ?? []}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={4}
                >
                  {(stats?.charts.userGrowth ?? []).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <BiLabel ar={L.userGrowth.ar} en={L.userGrowth.en} size="sm" />
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
        <div className="mb-4">
          <BiLabel ar={L.topIndustries.ar} en={L.topIndustries.en} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.charts.topIndustries ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="industry" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {(stats?.charts.topIndustries ?? []).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
