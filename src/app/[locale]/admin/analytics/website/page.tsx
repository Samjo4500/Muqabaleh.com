'use client';

import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { AdminStatCard } from '@/components/admin/AdminStatCard';
import { BiLabel } from '@/components/admin/BiLabel';
import { Eye, Users, MousePointerClick, Smartphone } from 'lucide-react';

export default function Page() {
  return (
    <div>
      <AdminPageHeader
        title={{ ar: 'تحليلات أداء الموقع', en: 'Website Analytics' }}
        description={{
          ar: 'المشاهدات، الزوار الفريدون، نسبة الارتداد، مصادر الزيارات، الأجهزة، والدول — GA4: KM7T1T22WW.',
          en: 'Page views, unique visitors, bounce rate, traffic sources, devices, countries — GA4 ID: KM7T1T22WW.',
        }}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label={{ ar: 'عدد مشاهدات الصفحات', en: 'Page views' }} value="12,480" icon={Eye} />
        <AdminStatCard label={{ ar: 'الزيارات الفريدة', en: 'Unique visitors' }} value="4,210" icon={Users} />
        <AdminStatCard label={{ ar: 'نسبة الارتداد', en: 'Bounce rate' }} value="38%" icon={MousePointerClick} />
        <AdminStatCard label={{ ar: 'الجوال', en: 'Mobile share' }} value="64%" icon={Smartphone} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="مصادر الزيارات" en="Traffic sources" />
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ['Organic', '41%'],
              ['Direct', '28%'],
              ['Social', '18%'],
              ['Referral', '13%'],
            ].map(([k, v]) => (
              <li key={k} className="flex justify-between border-b border-white/5 py-2">
                <span>{k}</span>
                <span className="text-cyan-300">{v}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-white/10 bg-[var(--bg-panel)] p-5">
          <BiLabel ar="تكامل GA4" en="GA4 integration" />
          <p className="mt-3 text-sm text-[var(--text-secondary)]">Measurement ID: <code className="text-cyan-300">KM7T1T22WW</code></p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Connect property in production to replace demo metrics.</p>
        </section>
      </div>
    </div>
  );
}
