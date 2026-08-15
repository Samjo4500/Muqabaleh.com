'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Building2, Briefcase, RefreshCw, Globe2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiInline } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type Agg = {
  activeJobs: number;
  companyCount: number;
  catalogSize?: number;
  recentSuccessRate: number | null;
  recent404: number;
  byAts: { ats: string; _count: { _all: number } }[];
  byCountry?: { country: string; _count: { _all: number } }[];
  companies: {
    id: string;
    name: string;
    slug: string;
    ats: string;
    country: string | null;
    _count: { jobs: number };
    updatedAt: string;
  }[];
  recentLogs: {
    id: string;
    statusCode: number | null;
    errorMessage: string | null;
    createdAt: string;
    company: { name: string; slug: string; ats: string } | null;
  }[];
};

export default function AtsAggregatorPage() {
  const [data, setData] = useState<Agg | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/jobs/aggregator');
      const json = await res.json();
      if (res.ok) setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runTick = async (limit = 8) => {
    setRunning(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/jobs/aggregator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit, action: 'fetch' }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMsg(json.error || 'Fetch failed');
        return;
      }
      setMsg(
        `Tick complete · companies ${json.companies ?? '—'} · upserted ${json.upserted ?? 0} · catalog ${json.catalogSize ?? '—'} · errors ${(json.errors || []).length}`,
      );
      await load();
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'مجمّع ATS', en: 'ATS Aggregator' }}
        description={{
          ar: 'لوحات MENA الموثّقة عبر Greenhouse / Lever / Workable / Recruitee — مزامنة الكتالوج ثم الجلب.',
          en: 'Verified MENA boards via Greenhouse / Lever / Workable / Recruitee — sync catalog then fetch.',
        }}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className="me-2 h-4 w-4" />
              <BiInline ar="تحديث" en="Refresh" />
            </Button>
            <Button type="button" size="sm" onClick={() => void runTick(8)} disabled={running}>
              <BiInline
                ar={running ? 'جارٍ الجلب عبر MENA…' : 'جلب كل لوحات MENA'}
                en={running ? 'Fetching MENA…' : 'Fetch all MENA boards'}
              />
            </Button>
          </div>
        }
      />

      <p className="mb-4 text-xs leading-relaxed text-white/40">
        <BiInline
          ar="تحديث تلقائي: كرون Vercel يومياً الساعة ٠٣:٠٠ UTC (يعمل على Hobby). المسح الكامل عبر GitHub يحتاج سر CRON_SECRET في إعدادات المستودع."
          en="Auto-refresh: Vercel daily cron at 03:00 UTC (Hobby-safe). The GitHub full sweep needs repo secret CRON_SECRET — it is not set, so that job has been failing."
        />
      </p>

      {msg ? <p className="mb-4 text-sm text-cyan-300">{msg}</p> : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={{ ar: 'وظائف نشطة', en: 'Active jobs' }}
          value={String(data?.activeJobs ?? '—')}
          icon={Briefcase}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'شركات مدرجة', en: 'Listed companies' }}
          value={String(data?.companyCount ?? '—')}
          icon={Building2}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'كتالوج MENA', en: 'MENA catalog' }}
          value={String(data?.catalogSize ?? '—')}
          icon={Globe2}
          loading={loading && !data}
        />
        <AdminStatCard
          label={{ ar: 'نجاح الجلب الأخير', en: 'Recent success rate' }}
          value={data?.recentSuccessRate != null ? `${data.recentSuccessRate}%` : '—'}
          icon={Activity}
          loading={loading && !data}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(data?.byAts ?? []).map((a) => (
          <Badge key={a.ats} variant="outline">
            {a.ats}: {a._count._all}
          </Badge>
        ))}
        {(data?.byCountry ?? []).map((c) => (
          <Badge key={c.country} variant="outline">
            {c.country}: {c._count._all}
          </Badge>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <h3 className="mb-3 text-sm font-medium">
            <BiInline ar="الشركات" en="Companies" />
          </h3>
          <ul className="max-h-[480px] space-y-2 overflow-auto text-sm">
            {(data?.companies ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 border-b border-white/5 py-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {c.ats} · {c.slug} · {c.country || '—'}
                  </div>
                </div>
                <Badge variant="outline">{c._count.jobs} jobs</Badge>
              </li>
            ))}
            {!loading && !(data?.companies?.length) ? (
              <li className="text-[var(--text-muted)]">
                <BiInline ar="لا شركات بعد" en="No companies yet" />
              </li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <h3 className="mb-3 text-sm font-medium">
            <BiInline ar="سجلات الجلب الأخيرة" en="Recent fetch logs" />
          </h3>
          <ul className="max-h-[480px] space-y-2 overflow-auto text-sm">
            {(data?.recentLogs ?? []).map((l) => (
              <li key={l.id} className="border-b border-white/5 py-2">
                <div className="flex justify-between gap-2">
                  <span>{l.company?.name ?? '—'}</span>
                  <Badge variant="outline">{l.statusCode ?? 'err'}</Badge>
                </div>
                <div className="text-xs text-[var(--text-muted)]">
                  {l.company?.ats} · {new Date(l.createdAt).toLocaleString()}
                  {l.errorMessage ? ` · ${l.errorMessage.slice(0, 80)}` : ''}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
