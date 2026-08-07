'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Building2, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { fadeUp, stagger } from '@/components/landing/crystal/motion';

export type ListedJobCard = {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string | null;
  employmentType: string | null;
  description: string;
  applyUrl: string;
  source: string;
  company: {
    name: string;
    slug: string;
    country: string;
    logoUrl: string | null;
  } | null;
};

export function JobsBrowserClient({ initialJobs }: { initialJobs: ListedJobCard[] }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [country, setCountry] = useState('all');
  const [q, setQ] = useState('');

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const j of initialJobs) {
      if (j.company?.country) set.add(j.company.country);
    }
    return Array.from(set).sort();
  }, [initialJobs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initialJobs.filter((j) => {
      if (country !== 'all' && j.company?.country !== country) return false;
      if (!needle) return true;
      const hay = `${j.title} ${j.company?.name ?? ''} ${j.location} ${j.department ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [initialJobs, country, q]);

  if (!initialJobs.length) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
        <p className="mq-display text-2xl font-bold text-white">
          {isAr ? 'لوحة الوظائف تُجهَّز' : 'Jobs board warming up'}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
          {isAr
            ? 'تدرّب مع جيني الآن — سنملأ اللوحة بإعلانات قانونية قريباً.'
            : 'Practice with Jeannie now — legal listings are coming online soon.'}
        </p>
        <Link
          href={localePath('/interview/prequal', locale)}
          className="mq-btn mq-btn-primary mt-8 inline-flex min-h-[48px] items-center gap-2 px-6 text-sm font-bold"
        >
          <Sparkles size={16} />
          {isAr ? 'تدرّب مع جيني' : 'Practice with Jeannie'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:flex-row md:items-center md:p-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={isAr ? 'ابحث عن دور أو شركة…' : 'Search role or company…'}
          className="min-h-[48px] flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white placeholder:text-white/35"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="min-h-[48px] rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white"
        >
          <option value="all">{isAr ? 'كل البلدان' : 'All countries'}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm text-white/40">
        {filtered.length} {isAr ? 'وظيفة' : filtered.length === 1 ? 'role' : 'roles'}
      </p>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid gap-4 lg:grid-cols-2"
      >
        {filtered.map((job, i) => {
          const href = job.company
            ? localePath(`/companies/${job.company.slug}/${job.slug}`, locale)
            : localePath(`/jobs/${job.id}`, locale);
          return (
            <motion.article
              key={job.id}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]"
            >
              <div
                className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl transition group-hover:bg-teal-400/20"
                aria-hidden
              />
              <div className="relative mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-300/25 bg-teal-400/10 text-teal-200">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2 className="mq-display text-xl font-bold text-white">{job.title}</h2>
                    <p className="mt-1 text-sm text-white/55">{job.company?.name ?? '—'}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  {job.employmentType || (isAr ? 'دوام كامل' : 'Full-time')}
                </span>
              </div>

              <div className="relative mb-3 flex flex-wrap gap-3 text-xs text-white/45">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} /> {job.location}
                </span>
                {job.department ? <span>{job.department}</span> : null}
                {job.company?.country ? <span>{job.company.country}</span> : null}
              </div>

              <p className="relative mb-6 flex-1 text-sm leading-relaxed text-white/55">
                {job.description.slice(0, 220)}
                {job.description.length > 220 ? '…' : ''}
              </p>

              <div className="relative flex flex-col gap-2 sm:flex-row">
                <Link
                  href={href}
                  className="mq-btn mq-btn-primary inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 text-sm font-bold"
                >
                  <Sparkles size={15} />
                  {isAr ? 'تدرّب لهذه الوظيفة' : 'Practice for this role'}
                </Link>
                <a
                  href={job.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 text-sm font-bold"
                >
                  <ExternalLink size={15} />
                  {isAr ? 'قدّم على موقع الشركة' : 'Apply on company site'}
                </a>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
