'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Mic2, Award, Users } from 'lucide-react';

type Data = {
  behavior?: {
    interviews7d: number;
    mockTotal: number;
    mockCompleted: number;
    poolPublic: number;
    poolTotal: number;
    accountTypes: { type: string; count: number }[];
    funnel: {
      signedUp: number;
      startedInterview: number;
      completedInterview: number;
      publicPassport: number;
    };
  };
};

export default function Page() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    void fetch('/api/admin/analytics/overview')
      .then((r) => r.json())
      .then(setData)
      .catch(() => null);
  }, []);

  const b = data?.behavior;
  const funnel = b?.funnel;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات سلوك المستخدمين', en: 'Behavior Analytics' }}
        description={{
          ar: 'قمع التحويل الحقيقي: تسجيل → مقابلة → إكمال → جواز عام.',
          en: 'Real funnel: signup → interview → completed → public passport.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard label={{ ar: 'مقابلات ٧ أيام', en: 'Interviews 7d' }} value={String(b?.interviews7d ?? '—')} icon={Mic2} />
        <AdminStatCard label={{ ar: 'محاكاة مكتملة', en: 'Mocks completed' }} value={String(b?.mockCompleted ?? '—')} icon={Award} />
        <AdminStatCard label={{ ar: 'جوازات عامة', en: 'Public passports' }} value={`${b?.poolPublic ?? 0}/${b?.poolTotal ?? 0}`} icon={Users} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="قمع التحويل" en="Conversion funnel" />
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['Signed up', funnel?.signedUp],
              ['Started interview', funnel?.startedInterview],
              ['Completed interview', funnel?.completedInterview],
              ['Public passport', funnel?.publicPassport],
            ].map(([k, v]) => (
              <li key={String(k)} className="flex justify-between border-b border-white/5 py-2">
                <span>{k}</span>
                <span className="text-cyan-300">{v ?? 0}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="نوع الحساب" en="Account types" />
          <ul className="mt-4 space-y-2 text-sm">
            {(b?.accountTypes ?? []).map((a) => (
              <li key={a.type} className="flex justify-between border-b border-white/5 py-2">
                <span>{a.type}</span>
                <span className="text-cyan-300">{a.count}</span>
              </li>
            ))}
            {!b?.accountTypes?.length ? (
              <li className="text-[var(--text-muted)]">No data yet</li>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}
