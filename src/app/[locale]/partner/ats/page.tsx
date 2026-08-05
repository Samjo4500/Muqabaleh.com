'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Briefcase, Loader2, Users } from 'lucide-react';
import { localePath } from '@/i18n/navigation';

type AtsPayload = {
  jobs: Array<{
    id: string;
    title: string;
    status: string;
    applicationsCount: number;
    company?: { name: string } | null;
  }>;
  candidates: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    headline: string | null;
    hasCv: boolean;
    photoUrl: string | null;
  }>;
  stats: { jobs: number; openJobs: number; applications: number; talent: number };
  demo?: boolean;
};

export default function PartnerAtsPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [data, setData] = useState<AtsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partner/ats')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-white/50">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300/80">
          ATS
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
          {isAr ? 'التوظيف والمواهب' : 'Hiring & talent'}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          {isAr
            ? 'وظائف عملائك والمتقدمون وقاعدة المواهب المشتركة — للشركات والشركاء.'
            : 'Your clients’ jobs, applicants, and the shared talent pool — for business and partners.'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          {
            label: isAr ? 'الوظائف' : 'Jobs',
            value: data?.stats.jobs ?? 0,
            icon: Briefcase,
          },
          {
            label: isAr ? 'مفتوحة' : 'Open',
            value: data?.stats.openJobs ?? 0,
            icon: Briefcase,
          },
          {
            label: isAr ? 'الطلبات' : 'Applications',
            value: data?.stats.applications ?? 0,
            icon: Users,
          },
          {
            label: isAr ? 'المواهب' : 'Talent',
            value: data?.stats.talent ?? 0,
            icon: Users,
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <kpi.icon size={16} className="mb-2 text-teal-300/80" />
            <p className="text-xs text-white/45">{kpi.label}</p>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
          </div>
        ))}
      </div>

      {data?.demo ? (
        <p className="rounded-xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {isAr
            ? 'وضع تجريبي للشريك — اربط عميلاً حقيقياً لرؤية بيانات ATS.'
            : 'Partner demo mode — connect a real client to see live ATS data.'}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white">
          {isAr ? 'وظائف العملاء' : 'Client jobs'}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-white/50">
                <th className="px-4 py-3 text-start">{isAr ? 'الوظيفة' : 'Role'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الشركة' : 'Company'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3 text-start">{isAr ? 'المتقدمون' : 'Applicants'}</th>
              </tr>
            </thead>
            <tbody>
              {(data?.jobs || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/45">
                    {isAr ? 'لا توجد وظائف بعد.' : 'No jobs yet.'}
                  </td>
                </tr>
              ) : (
                data!.jobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5">
                    <td className="px-4 py-3 text-white">{job.title}</td>
                    <td className="px-4 py-3 text-white/60">{job.company?.name || '—'}</td>
                    <td className="px-4 py-3 text-white/60">{job.status}</td>
                    <td className="px-4 py-3 text-white/60">{job.applicationsCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">
            {isAr ? 'قاعدة المواهب' : 'Talent pool'}
          </h2>
          <Link
            href={localePath('/b2b/talent', locale)}
            className="text-sm font-semibold text-teal-300 hover:underline"
          >
            {isAr ? 'فتح بحث الشركات' : 'Open employer search'}
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(data?.candidates || []).slice(0, 8).map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-center gap-3">
                {c.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photoUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xs">
                    {(c.name || c.email).slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{c.name || c.email}</p>
                  <p className="truncate text-xs text-white/50">{c.headline || c.role}</p>
                </div>
                {c.hasCv ? (
                  <span className="ms-auto text-[10px] font-bold uppercase text-teal-300">CV</span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
