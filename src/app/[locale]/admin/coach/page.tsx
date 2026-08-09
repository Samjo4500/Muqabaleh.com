'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  Activity,
  DollarSign,
  Award,
  Mic2,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Stats = {
  interviewsToday: number;
  interviewsMonth: number;
  interviewsAll: number;
  passports: number;
  activeUsers: number;
  revenueUsd: number;
};

type InterviewRow = {
  id: string;
  candidateName: string;
  email: string;
  role: string;
  language: string;
  score: number | null;
  grade: string | null;
  date: string;
  passportStatus: string;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  signupDate: string;
  tier: string;
  totalInterviews: number;
};

export default function CoachOverviewAdminPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [stats, setStats] = useState<Stats | null>(null);
  const [interviews, setInterviews] = useState<InterviewRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'date' | 'score'>('date');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, iRes, uRes] = await Promise.all([
        fetch('/api/admin/coach-overview?tab=stats'),
        fetch(
          `/api/admin/coach-overview?tab=interviews&page=${page}&sort=${sort}&q=${encodeURIComponent(q)}`,
        ),
        fetch(
          `/api/admin/coach-overview?tab=users&page=1&q=${encodeURIComponent(q)}`,
        ),
      ]);
      const s = await sRes.json();
      const i = await iRes.json();
      const u = await uRes.json();
      if (s.stats) setStats(s.stats);
      if (Array.isArray(i.items)) {
        setInterviews(i.items);
        setTotal(i.total || 0);
      }
      if (Array.isArray(u.items)) setUsers(u.items);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [page, sort, q]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} lang={isAr ? 'ar' : 'en'}>
      <AdminPageHeader
        title={{ ar: 'نظرة جيني والجواز', en: 'Jeannie & Passport Ops' }}
        description={{
          ar: 'إحصاءات المقابلات والجوازات والمستخدمين — بدون جداول جديدة.',
          en: 'Interview, passport, and user stats — existing tables only.',
        }}
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          label={{ ar: 'مقابلات اليوم', en: 'Interviews today' }}
          value={String(stats?.interviewsToday ?? '—')}
          icon={Mic2}
          loading={loading && !stats}
        />
        <AdminStatCard
          label={{ ar: 'مقابلات هذا الشهر', en: 'Interviews this month' }}
          value={String(stats?.interviewsMonth ?? '—')}
          icon={Activity}
          loading={loading && !stats}
        />
        <AdminStatCard
          label={{ ar: 'كل المقابلات', en: 'All-time interviews' }}
          value={String(stats?.interviewsAll ?? '—')}
          icon={Activity}
          loading={loading && !stats}
        />
        <AdminStatCard
          label={{ ar: 'جوازات مُنشأة', en: 'Passports generated' }}
          value={String(stats?.passports ?? '—')}
          icon={Award}
          loading={loading && !stats}
        />
        <AdminStatCard
          label={{ ar: 'مستخدمون نشطون (30 يوماً)', en: 'Active users (30d)' }}
          value={String(stats?.activeUsers ?? '—')}
          icon={Users}
          loading={loading && !stats}
        />
        <AdminStatCard
          label={{ ar: 'الإيرادات (مدفوعات مكتملة)', en: 'Revenue (completed payments)' }}
          value={stats ? `$${(stats.revenueUsd || 0).toFixed(2)}` : '—'}
          icon={DollarSign}
          loading={loading && !stats}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder={isAr ? 'بحث بالاسم أو البريد…' : 'Search name or email…'}
          className="max-w-xs"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => setSort((s) => (s === 'date' ? 'score' : 'date'))}
        >
          <BiLabel
            ar={sort === 'date' ? 'ترتيب: التاريخ' : 'ترتيب: الدرجة'}
            en={sort === 'date' ? 'Sort: date' : 'Sort: score'}
          />
        </Button>
        <a
          className="mq-btn mq-btn-ghost text-sm"
          href="/api/admin/coach-overview?tab=interviews&export=1&range=30d"
        >
          {isAr ? 'تصدير CSV (30 يوماً)' : 'Export CSV (30d)'}
        </a>
        <a
          className="mq-btn mq-btn-ghost text-sm"
          href="/api/admin/coach-overview?tab=interviews&export=1&range=90d"
        >
          {isAr ? 'تصدير CSV (90 يوماً)' : 'Export CSV (90d)'}
        </a>
        <a
          className="mq-btn mq-btn-ghost text-sm"
          href="/api/admin/coach-overview?tab=interviews&export=1&range=all"
        >
          {isAr ? 'تصدير الكل' : 'Export all'}
        </a>
        <Button type="button" onClick={() => void load()} disabled={loading}>
          <BiLabel ar="تحديث" en="Refresh" />
        </Button>
      </div>

      <h2 className="mq-display mt-8 text-xl font-bold text-white">
        {isAr ? 'المقابلات الأخيرة' : 'Recent interviews'}
      </h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2 text-start">{isAr ? 'المرشح' : 'Candidate'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'الدور' : 'Role'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'اللغة' : 'Lang'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'الدرجة' : 'Score'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'الجواز' : 'Passport'}</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="px-3 py-2">{r.candidateName}</td>
                <td className="px-3 py-2">{r.role}</td>
                <td className="px-3 py-2">{r.language}</td>
                <td className="px-3 py-2">
                  {r.score ?? '—'} {r.grade ? `(${r.grade})` : ''}
                </td>
                <td className="px-3 py-2">
                  {new Date(r.date).toLocaleString(isAr ? 'ar' : 'en')}
                </td>
                <td className="px-3 py-2">{r.passportStatus}</td>
              </tr>
            ))}
            {!interviews.length ? (
              <tr>
                <td className="px-3 py-6 text-white/40" colSpan={6}>
                  {loading ? (isAr ? 'جارٍ التحميل…' : 'Loading…') : isAr ? 'لا بيانات' : 'No data'}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          {isAr ? 'السابق' : 'Prev'}
        </Button>
        <span className="text-sm text-white/50">
          {page} / {Math.max(1, Math.ceil(total / 20))}
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={page * 20 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          {isAr ? 'التالي' : 'Next'}
        </Button>
      </div>

      <h2 className="mq-display mt-10 text-xl font-bold text-white">
        {isAr ? 'المستخدمون' : 'Users'}
      </h2>
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm text-white/80">
          <thead className="bg-white/5 text-white/50">
            <tr>
              <th className="px-3 py-2 text-start">{isAr ? 'الاسم' : 'Name'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'البريد' : 'Email'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'التسجيل' : 'Signup'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'الباقة' : 'Tier'}</th>
              <th className="px-3 py-2 text-start">{isAr ? 'المقابلات' : 'Interviews'}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-white/5">
                <td className="px-3 py-2">{u.name || '—'}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  {new Date(u.signupDate).toLocaleDateString(isAr ? 'ar' : 'en')}
                </td>
                <td className="px-3 py-2">{u.tier}</td>
                <td className="px-3 py-2">{u.totalInterviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
