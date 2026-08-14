'use client';

import { useEffect, useState } from 'react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Mic2, Award, Percent, BookOpen, UserPlus, TrendingUp } from 'lucide-react';

type GuideRow = { slug: string | null; type: string | null; views: number };

type DayBlock = {
  date: string;
  interviewsStarted: number;
  interviewsCompleted: number;
  completionRate: number;
  guideViews: number;
  signupInitiated: number;
  signupCompleted: number;
  signupConversionRate: number;
  counts?: Record<string, number>;
  topGuides?: GuideRow[];
};

type Payload = {
  timezone?: string;
  yesterday?: DayBlock;
  today?: DayBlock;
};

export default function FounderAnalyticsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/analytics')
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 403 ? 'Forbidden' : 'Failed to load');
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  const y = data?.yesterday;
  const t = data?.today;

  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'لوحة التحويل', en: 'Conversion dashboard' }}
        description={{
          ar: 'أحداث القمع لأمس واليوم (توقيت الرياض). المصدر: /api/analytics — يعمل حتى مع حجب الإعلانات.',
          en: "Funnel events for yesterday and today (Asia/Riyadh). Source: /api/analytics — works even when adblockers hide GA4.",
        }}
      />

      {error ? (
        <p className="mb-4 text-sm text-rose-300">{error}</p>
      ) : null}

      <p className="mb-4 text-xs text-[var(--text-muted)]">
        Yesterday ({y?.date ?? '—'}) · {data?.timezone ?? 'Asia/Riyadh'}
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          label={{ ar: 'مقابلات بدأت (أمس)', en: 'Interviews started (yesterday)' }}
          value={String(y?.interviewsStarted ?? '—')}
          icon={Mic2}
        />
        <AdminStatCard
          label={{ ar: 'مقابلات اكتملت (أمس)', en: 'Interviews completed (yesterday)' }}
          value={String(y?.interviewsCompleted ?? '—')}
          icon={Award}
        />
        <AdminStatCard
          label={{ ar: 'نسبة الإكمال', en: 'Completion rate' }}
          value={y ? `${y.completionRate}%` : '—'}
          icon={Percent}
        />
        <AdminStatCard
          label={{ ar: 'مشاهدات الأدلة', en: 'Guide views' }}
          value={String(y?.guideViews ?? '—')}
          icon={BookOpen}
        />
        <AdminStatCard
          label={{ ar: 'بدأ التسجيل', en: 'Signup initiated' }}
          value={String(y?.signupInitiated ?? '—')}
          icon={UserPlus}
        />
        <AdminStatCard
          label={{ ar: 'تحويل التسجيل', en: 'Signup conversion' }}
          value={y ? `${y.signupConversionRate}%` : '—'}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="أكثر ١٠ أدلة مشاهدة (أمس)" en="Top 10 viewed guides (yesterday)" />
          <ul className="mt-4 space-y-2 text-sm">
            {(y?.topGuides ?? []).map((g) => (
              <li
                key={`${g.type}-${g.slug}`}
                className="flex justify-between border-b border-white/5 py-2"
              >
                <span>
                  {g.slug || '—'}
                  {g.type ? (
                    <span className="ms-2 text-xs text-[var(--text-muted)]">{g.type}</span>
                  ) : null}
                </span>
                <span className="text-cyan-300">{g.views}</span>
              </li>
            ))}
            {!y?.topGuides?.length ? (
              <li className="text-[var(--text-muted)]">No guide views yesterday</li>
            ) : null}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="اليوم (مباشر)" en="Today (live)" />
          <p className="mt-1 text-xs text-[var(--text-muted)]">{t?.date ?? '—'}</p>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['interview_started', t?.interviewsStarted],
              ['interview_completed', t?.interviewsCompleted],
              ['guide_viewed', t?.guideViews],
              ['signup_initiated', t?.signupInitiated],
              ['signup_completed', t?.signupCompleted],
            ].map(([k, v]) => (
              <li key={String(k)} className="flex justify-between border-b border-white/5 py-2">
                <span className="font-mono text-xs">{k}</span>
                <span className="text-cyan-300">{v ?? 0}</span>
              </li>
            ))}
            <li className="flex justify-between border-b border-white/5 py-2">
              <span>Completion rate</span>
              <span className="text-cyan-300">{t ? `${t.completionRate}%` : '—'}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Signup conversion</span>
              <span className="text-cyan-300">{t ? `${t.signupConversionRate}%` : '—'}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
