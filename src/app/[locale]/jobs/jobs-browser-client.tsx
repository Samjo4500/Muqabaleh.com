'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowUpRight, MapPin, Search, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import {
  classifyMenaCity,
  MENA_CITY_LABELS,
  type MenaCityKey,
} from '@/lib/jobs/mena';

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

const CITY_ORDER: MenaCityKey[] = [
  'uae',
  'ksa',
  'egypt',
  'qatar',
  'kuwait',
  'bahrain',
  'oman',
  'jordan',
  'other',
];

export function JobsBrowserClient({ initialJobs }: { initialJobs: ListedJobCard[] }) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [city, setCity] = useState<'all' | MenaCityKey>('all');
  const [q, setQ] = useState('');

  const cityCounts = useMemo(() => {
    const map = new Map<MenaCityKey, number>();
    for (const j of initialJobs) {
      const key = classifyMenaCity(j.location, j.company?.country);
      if (key === 'remote') continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return CITY_ORDER.filter((k) => (map.get(k) || 0) > 0).map((k) => ({
      key: k,
      count: map.get(k) || 0,
    }));
  }, [initialJobs]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initialJobs.filter((j) => {
      const key = classifyMenaCity(j.location, j.company?.country);
      if (city !== 'all' && key !== city) return false;
      if (!needle) return true;
      const hay = `${j.title} ${j.company?.name ?? ''} ${j.location} ${j.department ?? ''}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [initialJobs, city, q]);

  const spotlight = filtered[0] ?? null;
  const rest = filtered.slice(1);

  if (!initialJobs.length) {
    return (
      <div id="roles" className="mq-wrap py-16 text-center">
        <p className="mq-display text-3xl font-bold text-white">
          {isAr ? 'نجهّز أدوار المنطقة' : 'Warming up MENA roles'}
        </p>
        <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
          {isAr
            ? 'تدرّب مع جيني الآن — اللوحة تتحدث من واجهات ATS القانونية.'
            : 'Practice with Jeannie now — the board refreshes from legal ATS feeds.'}
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
    <section id="roles" className="relative border-t border-white/10 bg-[#05080f]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a opacity-40" />
        <div className="mq-orb mq-orb-c opacity-30" />
      </div>

      <div className="mq-wrap relative py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mq-kicker mb-2">{isAr ? 'الأدوار المفتوحة' : 'Open roles'}</p>
            <h2 className="mq-display text-3xl font-bold text-white md:text-4xl">
              {isAr ? 'اختر دوراً. تدرّب عليه.' : 'Pick a role. Practice it.'}
            </h2>
          </div>
          <p className="text-sm text-white/45 md:max-w-xs md:text-end">
            {isAr
              ? `${filtered.length} دور · أنت تقدّم على موقع الشركة`
              : `${filtered.length} roles · you apply on the company site`}
          </p>
        </div>

        {/* Interactive filters — not decorative chips */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isAr ? 'ابحث عن دور، شركة، أو مدينة…' : 'Search role, company, or city…'}
              className="glass-input min-h-[52px] w-full rounded-2xl pe-4 ps-11 text-sm"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterBtn
              active={city === 'all'}
              onClick={() => setCity('all')}
              label={isAr ? `الكل (${initialJobs.length})` : `All (${initialJobs.length})`}
            />
            {cityCounts.map((c) => (
              <FilterBtn
                key={c.key}
                active={city === c.key}
                onClick={() => setCity(c.key)}
                label={`${isAr ? MENA_CITY_LABELS[c.key].ar : MENA_CITY_LABELS[c.key].en} (${c.count})`}
              />
            ))}
          </div>
        </div>

        {spotlight ? (
          <SpotlightRole job={spotlight} isAr={isAr} locale={locale} />
        ) : (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-10 text-center text-sm text-white/50">
            {isAr ? 'لا نتائج — جرّب مدينة أخرى أو امسح البحث.' : 'No matches — try another city or clear search.'}
          </p>
        )}

        {rest.length > 0 ? (
          <motion.ul
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="mt-6 divide-y divide-white/10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.02]"
          >
            {rest.map((job, i) => {
              const href = job.company
                ? localePath(`/companies/${job.company.slug}/${job.slug}`, locale)
                : localePath(`/jobs/${job.id}`, locale);
              const cityKey = classifyMenaCity(job.location, job.company?.country);
              return (
                <motion.li
                  key={job.id}
                  variants={fadeUp}
                  custom={i}
                  className="group"
                >
                  <Link
                    href={href}
                    className="flex flex-col gap-3 px-5 py-5 transition hover:bg-white/[0.04] md:flex-row md:items-center md:justify-between md:gap-6 md:px-7"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-200/80">
                        {job.company?.name ?? '—'}
                      </p>
                      <h3 className="mq-display mt-1 text-xl font-bold text-white transition group-hover:text-teal-100 md:text-2xl">
                        {job.title}
                      </h3>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/45">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={13} />
                          {job.location}
                        </span>
                        <span>
                          {isAr
                            ? MENA_CITY_LABELS[cityKey].ar
                            : MENA_CITY_LABELS[cityKey].en}
                        </span>
                        {job.department ? <span>{job.department}</span> : null}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-teal-200">
                      {isAr ? 'تدرّب لهذا الدور' : 'Practice this role'}
                      <ArrowUpRight
                        size={16}
                        className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}

        <p className="mt-10 text-center text-xs leading-relaxed text-white/35">
          {isAr
            ? 'القوائم من واجهات ATS العامة القانونية فقط. مقابلة لا تقدّم نيابةً عنك.'
            : 'Listings from legal public ATS APIs only. Muqabaleh never applies on your behalf.'}
        </p>
      </div>
    </section>
  );
}

function FilterBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
        active
          ? 'border-teal-300/40 bg-teal-400/15 text-teal-100'
          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80'
      }`}
    >
      {label}
    </button>
  );
}

function SpotlightRole({
  job,
  isAr,
  locale,
}: {
  job: ListedJobCard;
  isAr: boolean;
  locale: string;
}) {
  const href = job.company
    ? localePath(`/companies/${job.company.slug}/${job.slug}`, locale)
    : localePath(`/jobs/${job.id}`, locale);
  const practiceHref = localePath(
    `/interview/prequal?company=${encodeURIComponent(job.company?.name || '')}&role=${encodeURIComponent(job.title)}&job=${encodeURIComponent(job.id)}`,
    locale,
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: easeCrystal }}
      className="relative overflow-hidden rounded-[2rem] border border-teal-300/25 bg-gradient-to-br from-teal-400/10 via-white/[0.03] to-transparent p-6 md:p-9"
    >
      <div
        className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-teal-400/15 blur-3xl"
        aria-hidden
      />
      <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-teal-200/90">
        {isAr ? 'الدور المميّز' : 'Spotlight role'}
      </p>
      <p className="relative mt-3 text-sm font-semibold text-white/55">
        {job.company?.name}
      </p>
      <h3 className="relative mq-display mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
        {job.title}
      </h3>
      <p className="relative mt-3 inline-flex items-center gap-1.5 text-sm text-white/55">
        <MapPin size={14} />
        {job.location}
        {job.department ? ` · ${job.department}` : ''}
      </p>
      <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
        {job.description.slice(0, 220)}
        {job.description.length > 220 ? '…' : ''}
      </p>
      <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href={practiceHref}
          className="mq-btn mq-btn-primary inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 text-sm font-bold"
        >
          <Sparkles size={15} />
          {isAr ? 'تدرّب لهذا الدور مع جيني' : 'Practice this role with Jeannie'}
        </Link>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mq-btn mq-btn-ghost inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 text-sm font-bold"
        >
          {isAr ? 'قدّم على موقع الشركة' : 'Apply on company site'}
          <ArrowUpRight size={15} />
        </a>
        <Link
          href={href}
          className="mq-btn mq-btn-ghost inline-flex min-h-[50px] items-center justify-center px-5 text-sm font-bold sm:flex-none"
        >
          {isAr ? 'التفاصيل' : 'Details'}
        </Link>
      </div>
    </motion.article>
  );
}
