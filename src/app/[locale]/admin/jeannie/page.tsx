'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Badge } from '@/components/ui/badge';

type Stats = {
  subscribers: number;
  activeSla: number;
  awaitingApproval: number;
  appliedThisWeek: number;
  failed: number;
  listings: number;
};

type SlaRow = {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  promised: number;
  delivered: number;
  remaining: number;
  rolledIn: number;
  periodEnd: string;
  appliesLeft: number;
};

type OppRow = {
  id: string;
  status: string;
  title: string;
  companyName: string;
  applyChannel: string | null;
  matchScore: number;
  failureReason: string | null;
  user: { email: string; name: string | null; tier: string };
};

export default function AdminJeanniePage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [stats, setStats] = useState<Stats | null>(null);
  const [sla, setSla] = useState<SlaRow[]>([]);
  const [opps, setOpps] = useState<OppRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/jeannie');
        if (!res.ok) throw new Error('Failed to load');
        const json = await res.json();
        if (!mounted) return;
        setStats(json.stats);
        setSla(json.slaAtRisk || []);
        setOpps(json.recentOpps || []);
      } catch {
        if (mounted) setError(isAr ? 'تعذر التحميل' : 'Failed to load Jeannie ops');
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAr]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {isAr ? 'عمليات جيني' : 'Jeannie operations'}
        </h1>
        <p className="mt-1 text-sm text-white/55">
          {isAr
            ? 'مراقبة الوعد الشهري، قائمة الانتظار، والتقديمات الخارجية.'
            : 'Monitor monthly promise SLA, approval queue, and external applies.'}
        </p>
      </div>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              [isAr ? 'المشتركون' : 'Subscribers', stats.subscribers],
              [isAr ? 'فترات وعد نشطة' : 'Active SLA periods', stats.activeSla],
              [isAr ? 'بانتظار الموافقة' : 'Awaiting approval', stats.awaitingApproval],
              [isAr ? 'قُدّم هذا الأسبوع' : 'Applied this week', stats.appliedThisWeek],
              [isAr ? 'فشل' : 'Failed', stats.failed],
              [isAr ? 'وظائف في الكتالوج' : 'Catalog listings', stats.listings],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-teal-200">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">
          {isAr ? 'وعد التقديم (SLA)' : 'Apply promise (SLA)'}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/45">
                <th className="px-3 py-2 text-start">{isAr ? 'المشترك' : 'Subscriber'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'الوعد' : 'Promised'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'المُسلَّم' : 'Delivered'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'متبقي' : 'Remaining'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'ترحيل' : 'Rolled in'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'نهاية الفترة' : 'Period end'}</th>
              </tr>
            </thead>
            <tbody>
              {sla.map((row) => (
                <tr key={row.id} className="border-b border-white/5 text-white/80">
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{row.name || '—'}</div>
                    <div className="text-xs text-white/45">{row.email}</div>
                  </td>
                  <td className="px-3 py-2">{row.promised}</td>
                  <td className="px-3 py-2">{row.delivered}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{row.remaining}</Badge>
                  </td>
                  <td className="px-3 py-2">{row.rolledIn}</td>
                  <td className="px-3 py-2">
                    {new Date(row.periodEnd).toLocaleDateString(isAr ? 'ar' : 'en')}
                  </td>
                </tr>
              ))}
              {!sla.length ? (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-white/40">
                    {isAr ? 'لا فترات نشطة بعد' : 'No active SLA periods yet'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">
          {isAr ? 'أحدث الفرص' : 'Recent opportunities'}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/45">
                <th className="px-3 py-2 text-start">{isAr ? 'المرشّح' : 'Candidate'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'الدور' : 'Role'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'القناة' : 'Channel'}</th>
                <th className="px-3 py-2 text-start">{isAr ? 'الملاءمة' : 'Match'}</th>
              </tr>
            </thead>
            <tbody>
              {opps.map((opp) => (
                <tr key={opp.id} className="border-b border-white/5 text-white/80">
                  <td className="px-3 py-2">
                    <div className="text-xs text-white/45">{opp.user.email}</div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-white">{opp.title}</div>
                    <div className="text-xs text-white/45">{opp.companyName}</div>
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant="outline">{opp.status}</Badge>
                    {opp.failureReason ? (
                      <div className="mt-1 max-w-[220px] truncate text-[11px] text-rose-300">
                        {opp.failureReason}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{opp.applyChannel || '—'}</td>
                  <td className="px-3 py-2">{opp.matchScore}</td>
                </tr>
              ))}
              {!opps.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-white/40">
                    {isAr ? 'لا فرص بعد' : 'No opportunities yet'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
