'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  Activity,
  Briefcase,
  Building2,
  CreditCard,
  DollarSign,
  Eye,
  Headphones,
  LogIn,
  Mic2,
  RefreshCw,
  UserPlus,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { SystemHealthPanel } from '@/components/admin/SystemHealthPanel';
import { BiInline, BiLabel } from '@/components/admin/BiLabel';
import { L, type Bi } from '@/lib/admin/labels';
import { Button } from '@/components/ui/button';
import { localePath } from '@/i18n/navigation';
import type { LucideIcon } from 'lucide-react';

type Health = 'green' | 'yellow' | 'red';

interface StatsPayload {
  people: {
    total: number;
    newToday: number;
    new7d: number;
    loggedIn24h: number;
    candidates: number;
    companies: number;
    interviewers: number;
    admins: number;
  };
  visitors: {
    available: boolean;
    pageviews24h: number;
    unique24h: number;
    pageviews7d: number;
    unique7d: number;
    topPages: { path: string; views: number }[];
  };
  interviews: {
    today: number;
    last7d: number;
    total: number;
    completed: number;
    completionRate: number;
    guestToday: number;
  };
  money: {
    revenueTodayUsd: number;
    revenueMonthUsd: number;
    revenue30dUsd: number;
    activeJeannieSubs: number;
    jeannieTierUsers: number;
  };
  jobs: {
    liveListings: number;
    companies: number;
  };
  recentUsers: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    accountType: string;
    createdAt: string;
    lastLoginAt: string | null;
  }[];
  widgets: {
    pendingSupportTickets: number;
    apiHealth: Health;
  };
}

function usd(n: number) {
  return `$${n.toFixed(2)}`;
}

function dash(n: number | undefined | null, loading: boolean) {
  if (loading) return '—';
  return String(n ?? 0);
}

function formatWhen(iso: string | null, locale: string) {
  if (!iso) return '—';
  const loc = locale === 'ar' ? 'ar' : 'en-GB';
  return new Date(iso).toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' });
}

function Section({
  title,
  note,
  children,
}: {
  title: Bi;
  note?: Bi;
  children: ReactNode;
}) {
  return (
    <section className="mb-8">
      <div className="mb-3">
        <h2>
          <BiLabel ar={title.ar} en={title.en} />
        </h2>
        {note ? (
          <p className="mt-1 max-w-3xl text-xs text-[var(--text-muted)]">
            <BiInline ar={note.ar} en={note.en} />
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Cards({
  items,
  loading,
}: {
  items: { label: Bi; value: string; icon: LucideIcon; hint?: Bi; accent?: 'green' | 'yellow' | 'red' | 'cyan' }[];
  loading: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((c) => (
        <AdminStatCard
          key={c.label.en}
          label={c.label}
          value={c.value}
          icon={c.icon}
          loading={loading}
          hint={c.hint}
          accent={c.accent}
        />
      ))}
    </div>
  );
}

export default function SuperAdminDashboardPage() {
  const locale = useLocale();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = (await res.json()) as StatsPayload;
      if (data?.people && data?.interviews) setStats(data);
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

  const p = stats?.people;
  const v = stats?.visitors;
  const i = stats?.interviews;
  const m = stats?.money;
  const j = stats?.jobs;
  const health = stats?.widgets.apiHealth ?? 'yellow';

  return (
    <div>
      <AdminPageHeader
        title={{ ar: L.dashboard.ar, en: L.dashboard.en }}
        description={{
          ar: 'أرقام حقيقية فقط. المستخدم = حساب مسجّل. الزائر = مشاهدة صفحة بدون حساب.',
          en: 'Real numbers only. User = registered account. Visitor = anonymous page view.',
        }}
        backHref="/admin/dashboard"
        actions={
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} className="gap-2">
            <RefreshCw size={14} />
            <BiInline ar={L.refresh.ar} en={L.refresh.en} />
          </Button>
        }
      />

      <SystemHealthPanel compact />

      <Section
        title={L.peopleSection}
        note={{
          ar: 'من جدول المستخدمين في Postgres — ليس تخميناً وليس Google Analytics.',
          en: 'From the User table in Postgres — not an estimate, not Google Analytics.',
        }}
      >
        <Cards
          loading={loading}
          items={[
            {
              label: L.usersTotal,
              value: dash(p?.total, loading),
              icon: Users,
              hint: { ar: 'كل الحسابات المسجّلة', en: 'Every registered account' },
            },
            {
              label: L.newSignups,
              value: dash(p?.newToday, loading),
              icon: UserPlus,
              hint: { ar: 'أُنشئ الحساب اليوم', en: 'Account created today' },
            },
            {
              label: L.users7d,
              value: dash(p?.new7d, loading),
              icon: UserPlus,
            },
            {
              label: L.loggedIn24h,
              value: dash(p?.loggedIn24h, loading),
              icon: LogIn,
              hint: { ar: 'lastLoginAt خلال ٢٤ ساعة', en: 'lastLoginAt in the last 24h' },
            },
            {
              label: L.candidates,
              value: dash(p?.candidates, loading),
              icon: Users,
            },
            {
              label: L.companies,
              value: dash(p?.companies, loading),
              icon: Building2,
              hint: { ar: 'حسابات شركات', en: 'Company accounts' },
            },
            {
              label: L.interviewers,
              value: dash(p?.interviewers, loading),
              icon: Mic2,
            },
            {
              label: L.pendingTickets,
              value: dash(stats?.widgets.pendingSupportTickets, loading),
              icon: Headphones,
            },
          ]}
        />

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-[var(--bg-panel)]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-3">
            <BiLabel ar={L.recentSignups.ar} en={L.recentSignups.en} />
            <Link
              href={localePath('/admin/users/all', locale)}
              className="text-xs text-cyan-300 hover:underline"
            >
              <BiInline ar="كل المستخدمين" en="All users" />
            </Link>
          </div>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-2 font-medium">
                  <BiInline ar="الاسم" en="Name" />
                </th>
                <th className="px-5 py-2 font-medium">
                  <BiInline ar="البريد" en="Email" />
                </th>
                <th className="px-5 py-2 font-medium">
                  <BiInline ar="الدور" en="Role" />
                </th>
                <th className="px-5 py-2 font-medium">
                  <BiInline ar="التسجيل" en="Signed up" />
                </th>
                <th className="px-5 py-2 font-medium">
                  <BiInline ar="آخر دخول" en="Last login" />
                </th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentUsers ?? []).map((u) => (
                <tr key={u.id} className="border-t border-white/5">
                  <td className="px-5 py-2.5">{u.name || '—'}</td>
                  <td className="px-5 py-2.5 text-[var(--text-secondary)]">{u.email}</td>
                  <td className="px-5 py-2.5">{u.role}</td>
                  <td className="px-5 py-2.5 text-[var(--text-muted)]">{formatWhen(u.createdAt, locale)}</td>
                  <td className="px-5 py-2.5 text-[var(--text-muted)]">{formatWhen(u.lastLoginAt, locale)}</td>
                </tr>
              ))}
              {!loading && !stats?.recentUsers?.length ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-[var(--text-muted)]">
                    <BiInline ar={L.empty.ar} en={L.empty.en} />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title={L.visitsSection}
        note={{
          ar: 'زوّار بدون حساب — مشاهدات الصفحات بعد نشر جدول الزيارات. ليس تخميناً من المقابلات.',
          en: 'Anonymous traffic — real pageviews after the visits table is live. Not guessed from interviews.',
        }}
      >
        <Cards
          loading={loading}
          items={[
            {
              label: L.visitors24h,
              value: v?.available ? dash(v.unique24h, loading) : '—',
              icon: Users,
              hint: { ar: 'أجهزة/متصفحات فريدة', en: 'Distinct browsers' },
            },
            {
              label: L.pageviews24h,
              value: v?.available ? dash(v.pageviews24h, loading) : '—',
              icon: Eye,
            },
            {
              label: L.unique7d,
              value: v?.available ? dash(v.unique7d, loading) : '—',
              icon: Users,
            },
            {
              label: L.pageviews7d,
              value: v?.available ? dash(v.pageviews7d, loading) : '—',
              icon: Eye,
            },
          ]}
        />
        {!loading && v && !v.available ? (
          <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <BiInline
              ar="عدّاد الزيارات يحتاج تطبيق الهجرة (prisma migrate deploy). أرقام المستخدمين أعلاه صحيحة الآن."
              en="Anonymous visit counts need prisma migrate deploy. The registered-user numbers above are already live."
            />
          </p>
        ) : null}
        {v?.available && v.topPages.length ? (
          <ul className="mt-4 divide-y divide-white/5 rounded-2xl border border-white/10 bg-[var(--bg-panel)] px-5 py-2">
            <li className="py-2 text-xs text-[var(--text-muted)]">
              <BiInline ar={L.topPages.ar} en={L.topPages.en} />
            </li>
            {v.topPages.map((row) => (
              <li key={row.path} className="flex justify-between py-2 text-sm">
                <span className="truncate pe-4 font-mono text-[var(--text-secondary)]">{row.path}</span>
                <span className="text-cyan-300">{row.views}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </Section>

      <Section title={L.interviewsSection}>
        <Cards
          loading={loading}
          items={[
            { label: L.todaysInterviews, value: dash(i?.today, loading), icon: Mic2 },
            { label: L.interviews7d, value: dash(i?.last7d, loading), icon: Mic2 },
            { label: L.interviewsTotal, value: dash(i?.total, loading), icon: Mic2 },
            {
              label: L.completionRate,
              value: loading ? '—' : `${i?.completionRate ?? 0}%`,
              icon: Activity,
              hint: {
                ar: `${i?.completed ?? 0} مكتملة من ${i?.total ?? 0}`,
                en: `${i?.completed ?? 0} completed of ${i?.total ?? 0}`,
              },
            },
          ]}
        />
        {!loading && i ? (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            <BiInline
              ar={`مقابلات ضيف اليوم (بدون حساب): ${i.guestToday}`}
              en={`Guest interviews today (no account): ${i.guestToday}`}
            />
          </p>
        ) : null}
      </Section>

      <div className="mb-8 grid gap-8 xl:grid-cols-2">
        <Section title={L.moneySection}>
          <Cards
            loading={loading}
            items={[
              { label: L.revenueToday, value: loading ? '—' : usd(m?.revenueTodayUsd ?? 0), icon: DollarSign },
              { label: L.revenue30d, value: loading ? '—' : usd(m?.revenue30dUsd ?? 0), icon: DollarSign },
              {
                label: L.activeJeannie,
                value: dash(m?.activeJeannieSubs, loading),
                icon: CreditCard,
                hint: { ar: 'PayPal ACTIVE', en: 'PayPal ACTIVE' },
              },
              {
                label: L.apiHealth,
                value: health.toUpperCase(),
                icon: Activity,
                accent: health,
              },
            ]}
          />
        </Section>
        <Section title={L.jobsSection}>
          <Cards
            loading={loading}
            items={[
              { label: L.liveJobs, value: dash(j?.liveListings, loading), icon: Briefcase },
              {
                label: L.activeCompanies,
                value: dash(j?.companies, loading),
                icon: Building2,
                hint: { ar: 'شركات على لوحة الوظائف', en: 'Companies on the jobs board' },
              },
            ]}
          />
        </Section>
      </div>
    </div>
  );
}
