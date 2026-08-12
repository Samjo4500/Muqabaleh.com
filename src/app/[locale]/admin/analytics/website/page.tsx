'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  Eye,
  Timer,
  MousePointerClick,
  Globe2,
  Smartphone,
  Link2,
  AlertTriangle,
  RefreshCw,
  ScrollText,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';

type Row = { key: string; count: number };

type Traffic = {
  rangeDays: number;
  totals: {
    pageviews: number;
    pageviews24h: number;
    sessions: number;
    sessions24h: number;
    visitors: number;
    visitors24h: number;
    outbound: number;
    errors: number;
    avgDurationSec: number;
    avgScrollPct: number;
    pagesPerSession: number;
  };
  topPages: Row[];
  topCountries: Row[];
  topDevices: Row[];
  topBrowsers: Row[];
  topOs: Row[];
  topReferrers: Row[];
  topUtmSources: Row[];
  topCampaigns: Row[];
  locales: Row[];
  hourlyUtc: { hour: number; count: number }[];
  daily: { date: string; count: number }[];
  recent: {
    id: string;
    occurredAt: string;
    pathNorm: string;
    path: string;
    locale: string | null;
    country: string | null;
    city: string | null;
    deviceClass: string | null;
    browser: string | null;
    os: string | null;
    referrer: string | null;
    utmSource: string | null;
    utmCampaign: string | null;
    visitorId: string;
    sessionId: string;
    userId: string | null;
    title: string | null;
  }[];
};

type Product = {
  website?: {
    usersTotal: number;
    signups24h: number;
    signups7d: number;
    activeSubs: number;
    revenue30dUsd: number;
    paymentsOk: number;
    paymentsFailed: number;
    refundRate: number;
  };
};

function RankList({ rows, empty }: { rows: Row[]; empty: string }) {
  if (!rows.length) {
    return <p className="mt-3 text-sm text-[var(--text-secondary)]">{empty}</p>;
  }
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <ul className="mt-4 space-y-2">
      {rows.map((r) => (
        <li key={r.key} className="text-sm">
          <div className="mb-1 flex justify-between gap-3">
            <span className="truncate text-[var(--text-primary)]" title={r.key}>
              {r.key}
            </span>
            <span className="shrink-0 tabular-nums text-cyan-300">{r.count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-cyan-400/70"
              style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  titleAr,
  titleEn,
  children,
  className,
}: {
  titleAr: string;
  titleEn: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5 ${className || ''}`}>
      <BiLabel ar={titleAr} en={titleEn} />
      {children}
    </section>
  );
}

export default function Page() {
  const [days, setDays] = useState(7);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'live'>('overview');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, p] = await Promise.all([
        fetch(`/api/admin/analytics/traffic?days=${days}`).then((r) => r.json()),
        fetch('/api/admin/analytics/overview').then((r) => r.json()),
      ]);
      setTraffic(t.traffic || null);
      setProduct(p);
    } catch {
      setTraffic(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  const t = traffic?.totals;
  const w = product?.website;
  const maxHour = Math.max(...(traffic?.hourlyUtc.map((h) => h.count) || [1]), 1);
  const maxDay = Math.max(...(traffic?.daily.map((d) => d.count) || [1]), 1);

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات زوار الموقع', en: 'Website visitor analytics' }}
        description={{
          ar: 'تتبع أول-الطرف: مشاهدات الصفحات، الجلسات، المصادر، الأجهزة، الجغرافيا، والتمرير — بدون اعتماد على GA.',
          en: 'First-party tracking: pageviews, sessions, sources, devices, geo, and scroll — no GA dependency.',
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {[1, 7, 30].map((d) => (
              <Button
                key={d}
                type="button"
                size="sm"
                variant={days === d ? 'default' : 'outline'}
                onClick={() => setDays(d)}
              >
                {d === 1 ? '24h' : `${d}d`}
              </Button>
            ))}
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={() => void load()}>
              <RefreshCw size={14} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={tab === 'overview' ? 'default' : 'outline'}
          onClick={() => setTab('overview')}
        >
          Overview
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === 'live' ? 'default' : 'outline'}
          onClick={() => setTab('live')}
        >
          Live log
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={{ ar: 'زوار (النطاق)', en: 'Visitors (range)' }}
          value={String(t?.visitors ?? '—')}
          icon={Users}
          loading={loading}
        />
        <AdminStatCard
          label={{ ar: 'مشاهدات', en: 'Pageviews' }}
          value={String(t?.pageviews ?? '—')}
          icon={Eye}
          loading={loading}
        />
        <AdminStatCard
          label={{ ar: 'جلسات', en: 'Sessions' }}
          value={String(t?.sessions ?? '—')}
          icon={MousePointerClick}
          loading={loading}
        />
        <AdminStatCard
          label={{ ar: 'زوار ٢٤ ساعة', en: 'Visitors 24h' }}
          value={String(t?.visitors24h ?? '—')}
          icon={Users}
          loading={loading}
          accent="green"
        />
        <AdminStatCard
          label={{ ar: 'متوسط المدة', en: 'Avg duration' }}
          value={t ? `${t.avgDurationSec}s` : '—'}
          icon={Timer}
          loading={loading}
        />
        <AdminStatCard
          label={{ ar: 'متوسط التمرير', en: 'Avg scroll' }}
          value={t ? `${t.avgScrollPct}%` : '—'}
          icon={ScrollText}
          loading={loading}
        />
        <AdminStatCard
          label={{ ar: 'صفحات / جلسة', en: 'Pages / session' }}
          value={String(t?.pagesPerSession ?? '—')}
          icon={Eye}
          loading={loading}
        />
        <AdminStatCard
          label={{ ar: 'روابط خارجية', en: 'Outbound clicks' }}
          value={String(t?.outbound ?? '—')}
          icon={Link2}
          loading={loading}
        />
      </div>

      {tab === 'overview' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel titleAr="المشاهدات اليومية" titleEn="Daily pageviews" className="lg:col-span-2">
            <div className="mt-4 flex h-36 items-end gap-1">
              {(traffic?.daily || []).map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-cyan-400/70"
                    style={{ height: `${Math.max(4, (d.count / maxDay) * 100)}%` }}
                    title={`${d.date}: ${d.count}`}
                  />
                  <span className="text-[10px] text-[var(--text-secondary)]">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel titleAr="الذروة حسب الساعة (UTC)" titleEn="Peak hours (UTC)">
            <div className="mt-4 flex h-28 items-end gap-0.5">
              {(traffic?.hourlyUtc || []).map((h) => (
                <div
                  key={h.hour}
                  className="flex-1 rounded-t bg-teal-400/60"
                  style={{ height: `${Math.max(3, (h.count / maxHour) * 100)}%` }}
                  title={`${h.hour}:00 UTC — ${h.count}`}
                />
              ))}
            </div>
          </Panel>

          <Panel titleAr="اللغة" titleEn="Locale">
            <RankList rows={traffic?.locales || []} empty="No locale data yet" />
          </Panel>

          <Panel titleAr="أهم الصفحات" titleEn="Top pages">
            <RankList rows={traffic?.topPages || []} empty="No pageviews yet — browse the site to seed data" />
          </Panel>

          <Panel titleAr="المصادر / الإحالات" titleEn="Referrers">
            <RankList rows={traffic?.topReferrers || []} empty="No external referrers yet" />
          </Panel>

          <Panel titleAr="UTM Source" titleEn="UTM sources">
            <RankList rows={traffic?.topUtmSources || []} empty="No UTM traffic yet" />
          </Panel>

          <Panel titleAr="الحملات" titleEn="Campaigns">
            <RankList rows={traffic?.topCampaigns || []} empty="No campaign params yet" />
          </Panel>

          <Panel titleAr="الدول" titleEn="Countries">
            <RankList rows={traffic?.topCountries || []} empty="No geo headers yet (shows on Vercel)" />
          </Panel>

          <Panel titleAr="الأجهزة" titleEn="Devices">
            <RankList rows={traffic?.topDevices || []} empty="—" />
          </Panel>

          <Panel titleAr="المتصفحات" titleEn="Browsers">
            <RankList rows={traffic?.topBrowsers || []} empty="—" />
          </Panel>

          <Panel titleAr="أنظمة التشغيل" titleEn="Operating systems">
            <RankList rows={traffic?.topOs || []} empty="—" />
          </Panel>

          <Panel titleAr="منتج / إيرادات (قاعدة البيانات)" titleEn="Product / revenue (DB)">
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between border-b border-white/5 py-2">
                <span>Users</span>
                <span className="text-cyan-300">{w?.usersTotal ?? 0}</span>
              </li>
              <li className="flex justify-between border-b border-white/5 py-2">
                <span>Signups 24h / 7d</span>
                <span className="text-cyan-300">
                  {w?.signups24h ?? 0} / {w?.signups7d ?? 0}
                </span>
              </li>
              <li className="flex justify-between border-b border-white/5 py-2">
                <span>Active subs</span>
                <span className="text-cyan-300">{w?.activeSubs ?? 0}</span>
              </li>
              <li className="flex justify-between border-b border-white/5 py-2">
                <span>Revenue 30d</span>
                <span className="text-cyan-300">${Number(w?.revenue30dUsd ?? 0).toFixed(0)}</span>
              </li>
              <li className="flex justify-between border-b border-white/5 py-2">
                <span>Payments ok / failed / refund%</span>
                <span className="text-cyan-300">
                  {w?.paymentsOk ?? 0} / {w?.paymentsFailed ?? 0} / {w?.refundRate ?? 0}%
                </span>
              </li>
              <li className="flex justify-between border-b border-white/5 py-2">
                <span className="inline-flex items-center gap-1">
                  <AlertTriangle size={14} /> Client errors (range)
                </span>
                <span className="text-cyan-300">{t?.errors ?? 0}</span>
              </li>
            </ul>
          </Panel>

          <Panel titleAr="ما الذي نلتقطه؟" titleEn="What we capture">
            <ul className="mt-3 list-disc space-y-1 ps-5 text-sm text-[var(--text-secondary)]">
              <li>Pageviews, exits, scroll milestones (25–100%), outbound clicks</li>
              <li>Visitor + session IDs, locale, title, path, sanitized query</li>
              <li>UTM / gclid / fbclid, referrer host, device / browser / OS</li>
              <li>Viewport & screen size, timezone, language, connection type</li>
              <li>Geo from Vercel/CF headers; IP stored only as daily rotating hash</li>
              <li>Optional opt-out: localStorage <code>mq_analytics_opt_out=1</code></li>
            </ul>
            <p className="mt-3 inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Globe2 size={14} /> <Smartphone size={14} /> First-party only — bots filtered from dashboards
            </p>
          </Panel>
        </div>
      ) : (
        <Panel titleAr="سجل المشاهدات الأخير" titleEn="Recent pageview log">
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-[var(--text-secondary)]">
                <tr className="border-b border-white/10">
                  <th className="py-2 pe-3 font-medium">Time</th>
                  <th className="py-2 pe-3 font-medium">Path</th>
                  <th className="py-2 pe-3 font-medium">Geo</th>
                  <th className="py-2 pe-3 font-medium">Device</th>
                  <th className="py-2 pe-3 font-medium">Source</th>
                  <th className="py-2 pe-3 font-medium">Visitor</th>
                </tr>
              </thead>
              <tbody>
                {(traffic?.recent || []).map((r) => (
                  <tr key={r.id} className="border-b border-white/5 align-top">
                    <td className="py-2 pe-3 whitespace-nowrap text-[var(--text-secondary)]">
                      {new Date(r.occurredAt).toLocaleString()}
                    </td>
                    <td className="py-2 pe-3">
                      <div className="font-medium text-[var(--text-primary)]">{r.pathNorm}</div>
                      <div className="text-xs text-[var(--text-secondary)]">
                        {r.locale || '—'} · {r.title || '—'}
                      </div>
                    </td>
                    <td className="py-2 pe-3 text-[var(--text-secondary)]">
                      {[r.city, r.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-2 pe-3 text-[var(--text-secondary)]">
                      {[r.deviceClass, r.browser, r.os].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="py-2 pe-3 text-[var(--text-secondary)]">
                      {r.utmSource || r.referrer || 'direct'}
                      {r.utmCampaign ? ` / ${r.utmCampaign}` : ''}
                    </td>
                    <td className="py-2 pe-3 font-mono text-xs text-[var(--text-secondary)]">
                      {r.visitorId.slice(0, 8)}
                      {r.userId ? ` · user` : ''}
                    </td>
                  </tr>
                ))}
                {!traffic?.recent?.length && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[var(--text-secondary)]">
                      No events yet. Open the public site to generate pageviews.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
