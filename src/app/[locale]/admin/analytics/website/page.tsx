'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L } from '@/lib/admin/labels';
import { Users, UserPlus, Eye, CreditCard } from 'lucide-react';

type Data = {
  people?: { total: number; newToday: number; new7d: number; loggedIn24h: number };
  visitors?: {
    available: boolean;
    unique24h: number;
    pageviews24h: number;
    unique7d: number;
    pageviews7d: number;
    topPages: { path: string; views: number }[];
  };
  money?: { activeJeannieSubs: number; revenue30dUsd: number };
};

export default function Page() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    void fetch('/api/admin/stats')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  const p = data?.people;
  const v = data?.visitors;
  const m = data?.money;
  const visitsReady = v?.available === true;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات أداء الموقع', en: 'Website Analytics' }}
        description={{
          ar: 'مستخدم = حساب. زائر = مشاهدة صفحة. نفس أرقام لوحة التحكم.',
          en: 'User = account. Visitor = page view. Same numbers as the dashboard.',
        }}
      />
      <p className="mb-6 max-w-2xl text-sm text-[var(--text-secondary)]">
        <BiInline
          ar="لا نخلط Google Analytics هنا. الحسابات من Postgres. الزيارات من عدّاد الموقع الداخلي."
          en="Google Analytics is not mixed in. Accounts come from Postgres. Visits come from first-party pageviews."
        />
      </p>
      <h2 className="mb-3">
        <BiLabel ar={L.peopleSection.ar} en={L.peopleSection.en} />
      </h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={L.usersTotal} value={String(p?.total ?? '—')} icon={Users} hint={{ ar: 'حسابات مسجّلة', en: 'Registered accounts' }} />
        <AdminStatCard label={L.newSignups} value={String(p?.newToday ?? '—')} icon={UserPlus} />
        <AdminStatCard label={L.users7d} value={String(p?.new7d ?? '—')} icon={UserPlus} />
        <AdminStatCard label={L.loggedIn24h} value={String(p?.loggedIn24h ?? '—')} icon={Users} />
      </div>
      <h2 className="mb-3">
        <BiLabel ar={L.visitsSection.ar} en={L.visitsSection.en} />
      </h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label={L.visitors24h}
          value={visitsReady ? String(v?.unique24h ?? 0) : '—'}
          icon={Users}
          hint={{ ar: 'ليس عدد الحسابات', en: 'Not account count' }}
        />
        <AdminStatCard label={L.pageviews24h} value={visitsReady ? String(v?.pageviews24h ?? 0) : '—'} icon={Eye} />
        <AdminStatCard label={L.unique7d} value={visitsReady ? String(v?.unique7d ?? 0) : '—'} icon={Users} />
        <AdminStatCard
          label={L.activeJeannie}
          value={String(m?.activeJeannieSubs ?? '—')}
          icon={CreditCard}
        />
      </div>
      {!visitsReady ? (
        <p className="mb-6 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <BiInline
            ar="عدّاد الزيارات يحتاج prisma migrate deploy. أرقام الحسابات أعلاه صحيحة."
            en="Visit counts need prisma migrate deploy. Account numbers above are already live."
          />
        </p>
      ) : null}
      <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
        <BiLabel ar={L.topPages.ar} en={L.topPages.en} />
        <ul className="mt-4 space-y-2 text-sm">
          {(v?.topPages ?? []).map((row) => (
            <li key={row.path} className="flex justify-between border-b border-white/5 py-2">
              <span className="font-mono">{row.path}</span>
              <span className="text-cyan-300">{row.views}</span>
            </li>
          ))}
          {!v?.topPages?.length ? (
            <li className="text-[var(--text-muted)]">
              <BiInline ar={L.empty.ar} en={L.empty.en} />
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}
