'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Eye,
  Globe2,
  Monitor,
  Radio,
  RefreshCw,
  Timer,
  UserPlus,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RangeKey } from '@/lib/visitors/parse';

type LiveRow = {
  sessionId: string;
  path: string;
  title: string | null;
  country: string | null;
  city: string | null;
  device: string | null;
  browser: string | null;
  locale: string | null;
  userId: string | null;
  lastSeenAt: string;
};

type Report = {
  range: RangeKey;
  from: string;
  to: string;
  live: { live: number; checkedAt: string; visitors: LiveRow[] };
  totals: {
    pageviews: number;
    uniqueVisitors: number;
    sessions: number;
    newVisitors: number;
    returningVisitors: number;
    bounceRate: number;
    pagesPerSession: number;
  };
  lastHour: { minute: string; views: number }[];
  trend: { label: string; views: number; visitors: number }[];
  topPages: { key: string; count: number }[];
  topReferrers: { key: string; count: number }[];
  countries: { key: string; count: number }[];
  devices: { key: string; count: number }[];
  browsers: { key: string; count: number }[];
  os: { key: string; count: number }[];
  locales: { key: string; count: number }[];
  campaigns: { key: string; count: number }[];
  recent: {
    path: string;
    title: string | null;
    country: string | null;
    city: string | null;
    device: string | null;
    browser: string | null;
    referrerHost: string | null;
    locale: string | null;
    createdAt: string;
  }[];
};

const RANGES: { id: RangeKey; ar: string; en: string }[] = [
  { id: '24h', ar: '٢٤ ساعة', en: '24 hours' },
  { id: '7d', ar: '٧ أيام', en: '7 days' },
  { id: '30d', ar: '٣٠ يوماً', en: '30 days' },
];

function RankList({
  titleAr,
  titleEn,
  rows,
}: {
  titleAr: string;
  titleEn: string;
  rows: { key: string; count: number }[];
}) {
  const max = rows[0]?.count || 1;
  return (
    <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
      <h3 className="mb-4 text-sm font-semibold text-white/80">
        <BiInline ar={titleAr} en={titleEn} />
      </h3>
      <ul className="space-y-2">
        {rows.map((row) => (
          <li key={row.key}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="truncate text-white/80">{row.key}</span>
              <span className="shrink-0 tabular-nums text-cyan-300">{row.count}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-400 to-cyan-300"
                style={{ width: `${Math.max(6, Math.round((row.count / max) * 100))}%` }}
              />
            </div>
          </li>
        ))}
        {!rows.length ? (
          <li className="text-sm text-white/40">
            <BiInline ar="لا بيانات بعد — افتح الموقع في تبويب آخر." en="No data yet — open the site in another tab." />
          </li>
        ) : null}
      </ul>
    </section>
  );
}

export default function VisitorsDashboardPage() {
  const [range, setRange] = useState<RangeKey>('24h');
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (nextRange: RangeKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/visitors?range=${nextRange}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json as Report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [load, range]);

  useEffect(() => {
    const tick = window.setInterval(async () => {
      try {
        const res = await fetch('/api/admin/visitors/live');
        const json = await res.json();
        if (!res.ok || !json.ok) return;
        setData((prev) => (prev ? { ...prev, live: json } : prev));
      } catch {
        /* ignore */
      }
    }, 8000);
    return () => window.clearInterval(tick);
  }, []);

  const t = data?.totals;
  const live = data?.live.live ?? 0;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'الزوار — المصدر الوحيد', en: 'Visitors — source of truth' }}
        description={{
          ar: 'قياس طرف-أول من خوادمنا. ليس غوغل أناليتكس. يشمل المتواجدين الآن والصفحات والدول والأجهزة.',
          en: 'First-party measurement from our servers. Not Google Analytics. Live presence, pages, countries, devices.',
        }}
        actions={
          <Button type="button" size="sm" variant="outline" onClick={() => void load(range)} disabled={loading}>
            <RefreshCw className={cn('me-2 h-4 w-4', loading && 'animate-spin')} />
            <BiInline ar="تحديث" en="Refresh" />
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-200/80">
              <BiInline ar="متواجدون الآن" en="Live right now" />
            </p>
            <p className="text-2xl font-bold tabular-nums text-emerald-100">{live}</p>
          </div>
          <Radio size={18} className="ms-2 text-emerald-300/80" />
        </div>

        <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium',
                range === r.id ? 'bg-cyan-300 text-slate-950' : 'text-white/60 hover:text-white',
              )}
            >
              <BiInline ar={r.ar} en={r.en} />
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <p className="mb-4 text-xs text-white/35">
        <BiInline
          ar="المصدر: Postgres / قياس طرف-أول. غوغل أناليتكس وفيercel Analytics لا يُخلطان هنا."
          en="Source: Postgres first-party beacons. GA4 and Vercel Analytics are not mixed in."
        />
        {data ? ` · ${new Date(data.from).toLocaleString()} → ${new Date(data.to).toLocaleString()}` : ''}
      </p>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={{ ar: 'زوار فريدون', en: 'Unique visitors' }}
          value={t ? String(t.uniqueVisitors) : '—'}
          icon={Users}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'مشاهدات الصفحات', en: 'Pageviews' }}
          value={t ? String(t.pageviews) : '—'}
          icon={Eye}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'جلسات', en: 'Sessions' }}
          value={t ? String(t.sessions) : '—'}
          icon={Timer}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'زوار جدد', en: 'New visitors' }}
          value={t ? String(t.newVisitors) : '—'}
          icon={UserPlus}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'عائدون', en: 'Returning' }}
          value={t ? String(t.returningVisitors) : '—'}
          icon={Activity}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'معدل الارتداد', en: 'Bounce rate' }}
          value={t ? `${t.bounceRate}%` : '—'}
          icon={Monitor}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'صفحات / جلسة', en: 'Pages / session' }}
          value={t ? String(t.pagesPerSession) : '—'}
          icon={Globe2}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'مباشر (٩٠ ثانية)', en: 'Live (90s window)' }}
          value={String(live)}
          icon={Radio}
          accent="green"
        />
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            <BiInline ar="الستين دقيقة الأخيرة" en="Last 60 minutes" />
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.lastHour || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="minute" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={9} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey="views" stroke="#67e8f9" fill="rgba(45,212,191,0.25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            <BiInline ar="الاتجاه" en="Trend" />
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend || []}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} width={28} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0b1220', border: '1px solid rgba(255,255,255,0.1)' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#2dd4bf" fill="rgba(45,212,191,0.2)" />
                <Area type="monotone" dataKey="views" stroke="#67e8f9" fill="rgba(103,232,249,0.12)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <RankList titleAr="أكثر الصفحات" titleEn="Top pages" rows={data?.topPages || []} />
        <RankList titleAr="مصادر الزيارة" titleEn="Referrers" rows={data?.topReferrers || []} />
        <RankList titleAr="الدول" titleEn="Countries" rows={data?.countries || []} />
        <RankList titleAr="الأجهزة" titleEn="Devices" rows={data?.devices || []} />
        <RankList titleAr="المتصفحات" titleEn="Browsers" rows={data?.browsers || []} />
        <RankList titleAr="أنظمة التشغيل" titleEn="Operating systems" rows={data?.os || []} />
        <RankList titleAr="اللغة" titleEn="Language" rows={data?.locales || []} />
        <RankList titleAr="حملات UTM" titleEn="UTM sources" rows={data?.campaigns || []} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            <BiInline ar="المتواجدون الآن" en="People on the site now" />
          </h3>
          <ul className="max-h-[420px] space-y-2 overflow-auto text-sm">
            {(data?.live.visitors || []).map((v) => (
              <li key={v.sessionId} className="border-b border-white/5 py-2">
                <div className="flex justify-between gap-3">
                  <span className="truncate font-medium text-white/90">{v.path}</span>
                  <span className="shrink-0 text-xs text-emerald-300">
                    {new Date(v.lastSeenAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-white/40">
                  {[v.city, v.country, v.device, v.browser, v.locale, v.userId ? 'signed-in' : 'anon']
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            ))}
            {!data?.live.visitors?.length ? (
              <li className="text-white/40">
                <BiInline ar="لا أحد على الموقع في هذه اللحظة." en="Nobody on the site right now." />
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            <BiInline ar="آخر المشاهدات" en="Latest pageviews" />
          </h3>
          <ul className="max-h-[420px] space-y-2 overflow-auto text-sm">
            {(data?.recent || []).map((r, i) => (
              <li key={`${r.createdAt}-${i}`} className="border-b border-white/5 py-2">
                <div className="flex justify-between gap-3">
                  <span className="truncate font-medium text-white/90">{r.path}</span>
                  <span className="shrink-0 text-xs text-cyan-300">
                    {new Date(r.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-white/40">
                  {[r.city, r.country, r.device, r.browser, r.referrerHost || 'direct']
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
