'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowUpRight, Banknote, Briefcase, MapPin, Search, Sparkles } from 'lucide-react';
import { localePath } from '@/i18n/navigation';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import {
  classifyMenaCountry,
  MENA_COUNTRY_FLAGS,
  MENA_COUNTRY_LABELS,
  MENA_COUNTRY_ORDER,
  type MenaCountryKey,
} from '@/lib/jobs/mena';

export type ListedJobCard = {
  id: string;
  title: string;
  slug: string;
  location: string;
  department: string | null;
  employmentType: string | null;
  description: string;
  requirements: string | null;
  applyUrl: string;
  source: string;
  salaryLabel: string | null;
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
  const [country, setCountry] = useState<'all' | MenaCountryKey>('all');
  const [q, setQ] = useState('');
  const [salaryOnly, setSalaryOnly] = useState(false);

  const [showEmptyCountries, setShowEmptyCountries] = useState(false);

  const countryCounts = useMemo(() => {
    const map = new Map<MenaCountryKey, number>();
    for (const j of initialJobs) {
      const key = classifyMenaCountry(j.location, j.company?.country, j.title);
      map.set(key, (map.get(key) || 0) + 1);
    }
    const all = MENA_COUNTRY_ORDER.map((k) => ({
      key: k,
      count: map.get(k) || 0,
    }));
    // Live markets first; zeros last (still available via "all countries")
    return all.sort((a, b) => {
      if (a.count === 0 && b.count > 0) return 1;
      if (b.count === 0 && a.count > 0) return -1;
      return MENA_COUNTRY_ORDER.indexOf(a.key) - MENA_COUNTRY_ORDER.indexOf(b.key);
    });
  }, [initialJobs]);

  const visibleCountryCounts = useMemo(
    () =>
      showEmptyCountries ? countryCounts : countryCounts.filter((c) => c.count > 0 || c.key === country),
    [countryCounts, showEmptyCountries, country],
  );

  const emptyCountryCount = useMemo(
    () => countryCounts.filter((c) => c.count === 0 && c.key !== 'other').length,
    [countryCounts],
  );

  const withSalaryCount = useMemo(
    () => initialJobs.filter((j) => Boolean(j.salaryLabel)).length,
    [initialJobs],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return initialJobs
      .filter((j) => {
        const key = classifyMenaCountry(j.location, j.company?.country, j.title);
        if (country !== 'all' && key !== country) return false;
        if (salaryOnly && !j.salaryLabel) return false;
        if (!needle) return true;
        const hay =
          `${j.title} ${j.company?.name ?? ''} ${j.location} ${j.department ?? ''} ${j.employmentType ?? ''} ${j.salaryLabel ?? ''} ${j.description}`.toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => Number(Boolean(b.salaryLabel)) - Number(Boolean(a.salaryLabel)));
  }, [initialJobs, country, q, salaryOnly]);

  const spotlight =
    filtered.find((j) => j.salaryLabel) ?? filtered[0] ?? null;
  const rest = filtered.filter((j) => j.id !== spotlight?.id);

  if (!initialJobs.length) {
    return (
      <div id="roles" className="mq-wrap py-16 text-center">
        <p className="mq-display text-3xl font-bold text-white">
          {isAr ? 'نجهّز قائمة الوظائف' : 'Warming up MENA roles'}
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
            <p className="mq-kicker mb-2">{isAr ? 'الوظائف المتاحة' : 'Open roles'}</p>
            <h2 className="mq-display text-3xl font-bold text-white md:text-4xl">
              {isAr ? 'اختر وظيفة. تدرّب عليها.' : 'Pick a role. Practice it.'}
            </h2>
          </div>
          <p className="text-sm text-white/45 md:max-w-xs md:text-end">
            {isAr
              ? `${filtered.length} وظيفة · ${withSalaryCount} براتب معلن`
              : `${filtered.length} roles · ${withSalaryCount} with published pay`}
          </p>
        </div>

        <div className="mb-8 space-y-5">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث عن وظيفة أو شركة أو مدينة أو راتب…'
                  : 'Search role, company, city, or salary…'
              }
              className="glass-input min-h-[52px] w-full rounded-2xl pe-4 ps-11 text-sm"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              {isAr ? 'حسب الدولة' : 'By country'}
            </p>
            <div className="flex flex-wrap gap-2 pb-1 pt-0.5">
              <CountryFlagTile
                flag="🌐"
                label={isAr ? 'الكل' : 'All'}
                count={initialJobs.length}
                active={country === 'all'}
                onClick={() => setCountry('all')}
              />
              {visibleCountryCounts.map((c) => (
                <CountryFlagTile
                  key={c.key}
                  flag={MENA_COUNTRY_FLAGS[c.key]}
                  label={isAr ? MENA_COUNTRY_LABELS[c.key].ar : MENA_COUNTRY_LABELS[c.key].en}
                  count={c.count}
                  active={country === c.key}
                  muted={c.count === 0}
                  onClick={() => setCountry(c.key)}
                />
              ))}
              {emptyCountryCount > 0 ? (
                <button
                  type="button"
                  onClick={() => setShowEmptyCountries((v) => !v)}
                  className="inline-flex min-h-[44px] items-center rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-3 text-xs font-semibold text-white/45 transition hover:border-white/25 hover:text-white/70"
                >
                  {showEmptyCountries
                    ? isAr
                      ? 'إخفاء الدول بلا وظائف'
                      : 'Hide empty countries'
                    : isAr
                      ? `+ ${emptyCountryCount} دول قريباً`
                      : `+ ${emptyCountryCount} coming soon`}
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/35">
              {isAr
                ? 'نعرض فقط الوظائف من لوحات ATS قانونية (Greenhouse / Lever / Workable…). بعض الدول بلا إعلانات عامة بعد.'
                : 'We only list roles from legal public ATS boards (Greenhouse / Lever / Workable…). Some countries have no public openings yet.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSalaryOnly((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
              salaryOnly
                ? 'border-amber-300/40 bg-amber-400/15 text-amber-100'
                : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80'
            }`}
          >
            <Banknote size={14} />
            {isAr
              ? `الراتب المعلن فقط (${withSalaryCount})`
              : `Published salary only (${withSalaryCount})`}
          </button>
        </div>

        {spotlight ? (
          <SpotlightRole job={spotlight} isAr={isAr} locale={locale} />
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="mq-display text-2xl font-bold text-white">
              {isAr ? 'لا وظائف هنا بعد' : 'No roles here yet'}
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
              {isAr
                ? 'نضيف شركات لديها لوحات توظيف قانونية في كل دولة. تدرّب مع جيني الآن، أو امسح الفلاتر لعرض الوظائف المتاحة.'
                : 'We’re adding employers with legal ATS boards in every country. Practice with Jeannie now — or clear filters to see open roles.'}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setCountry('all');
                  setSalaryOnly(false);
                  setQ('');
                }}
                className="mq-btn mq-btn-ghost inline-flex min-h-[48px] px-5 text-sm font-bold"
              >
                {isAr ? 'عرض كل الوظائف' : 'Show all MENA'}
              </button>
              <Link
                href={localePath('/interview/prequal', locale)}
                className="mq-btn mq-btn-primary inline-flex min-h-[48px] items-center gap-2 px-5 text-sm font-bold"
              >
                <Sparkles size={15} />
                {isAr ? 'تدرّب مع جيني' : 'Practice with Jeannie'}
              </Link>
            </div>
          </div>
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
              const countryKey = classifyMenaCountry(
                job.location,
                job.company?.country,
                job.title,
              );
              const meta = [job.department, job.employmentType].filter(Boolean).join(' · ');
              return (
                <motion.li key={job.id} variants={fadeUp} custom={i} className="group">
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
                        <span className="inline-flex items-center gap-1">
                          <span aria-hidden>{MENA_COUNTRY_FLAGS[countryKey]}</span>
                          {isAr
                            ? MENA_COUNTRY_LABELS[countryKey].ar
                            : MENA_COUNTRY_LABELS[countryKey].en}
                        </span>
                        {meta ? (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase size={13} />
                            {meta}
                          </span>
                        ) : null}
                        {job.salaryLabel ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-200/90">
                            <Banknote size={13} />
                            {job.salaryLabel}
                          </span>
                        ) : (
                          <span className="text-white/35">
                            {isAr ? 'الراتب لدى الشركة' : 'Pay on company site'}
                          </span>
                        )}
                      </p>
                      {job.description && !/^https?:\/\//i.test(job.description.trim()) ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/40">
                          {job.description}
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-teal-200">
                      {isAr ? 'تدرّب لهذه الوظيفة' : 'Practice this role'}
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                </motion.li>
              );
            })}
          </motion.ul>
        ) : null}

        <p className="mt-10 text-center text-xs leading-relaxed text-white/35">
          {isAr
            ? 'نعرض الراتب فقط إذا أعلنه صاحب العمل. الدول بلا وظائف بعد ضمن نطاقنا — ونضيف لوحات توظيف قانونية باستمرار.'
            : 'Salaries appear only when the employer published pay via ATS. Countries at 0 are still in scope — we add legal boards continuously.'}
        </p>
      </div>
    </section>
  );
}

function CountryFlagTile({
  flag,
  label,
  count,
  active,
  muted,
  onClick,
}: {
  flag: string;
  label: string;
  count: number;
  active: boolean;
  muted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${count}`}
      className={`flex w-[4.6rem] shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-1.5 py-2.5 transition ${
        active
          ? 'border-teal-300/45 bg-teal-400/15 text-teal-50'
          : muted
            ? 'border-white/8 bg-transparent text-white/30 hover:border-white/15 hover:text-white/50'
            : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20 hover:text-white'
      }`}
    >
      <span className="text-[1.55rem] leading-none" aria-hidden>
        {flag}
      </span>
      <span className="max-w-full truncate text-[0.62rem] font-bold uppercase tracking-[0.04em]">
        {label}
      </span>
      <span
        className={`text-sm font-bold tabular-nums ${
          active ? 'text-teal-100' : muted ? 'text-white/25' : 'text-white/85'
        }`}
      >
        {count}
      </span>
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
  const countryKey = classifyMenaCountry(job.location, job.company?.country, job.title);
  const meta = [job.department, job.employmentType].filter(Boolean).join(' · ');

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
      <div className="relative flex flex-wrap items-center gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-200/90">
          {isAr ? 'فرصة مميزة' : 'Spotlight role'}
        </p>
        {job.salaryLabel ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-400/10 px-2.5 py-1 text-xs font-bold text-amber-100">
            <Banknote size={13} />
            {job.salaryLabel}
          </span>
        ) : null}
      </div>
      <p className="relative mt-3 text-sm font-semibold text-white/55">{job.company?.name}</p>
      <h3 className="relative mq-display mt-1 text-3xl font-bold tracking-tight text-white md:text-4xl">
        {job.title}
      </h3>
      <p className="relative mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/55">
        <span className="inline-flex items-center gap-1.5">
          <MapPin size={14} />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <span aria-hidden>{MENA_COUNTRY_FLAGS[countryKey]}</span>
          {isAr ? MENA_COUNTRY_LABELS[countryKey].ar : MENA_COUNTRY_LABELS[countryKey].en}
        </span>
        {meta ? (
          <span className="inline-flex items-center gap-1">
            <Briefcase size={14} />
            {meta}
          </span>
        ) : null}
      </p>
      {!job.salaryLabel ? (
        <p className="relative mt-2 text-sm text-white/40">
          {isAr
            ? 'الراتب غير معلن هنا — راجعه عند التقديم لدى الشركة.'
            : 'Pay not published here — check the company site when you apply.'}
        </p>
      ) : null}
      {job.description && !/^https?:\/\//i.test(job.description.trim()) ? (
        <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
          {job.description}
        </p>
      ) : (
        <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base">
          {isAr
            ? 'تدرّب مع جيني على أسئلة مخصّصة لهذه الوظيفة، ثم قدّم بنفسك لدى الشركة.'
            : 'Practice role-specific questions with Jeannie, then apply yourself on the company site.'}
        </p>
      )}
      {job.requirements ? (
        <p className="relative mt-3 max-w-2xl text-sm leading-relaxed text-white/45">
          <span className="font-semibold text-white/55">
            {isAr ? 'المتطلبات: ' : 'Requirements: '}
          </span>
          {job.requirements.slice(0, 220)}
          {job.requirements.length > 220 ? '…' : ''}
        </p>
      ) : null}
      <div className="relative mt-7 flex flex-col gap-3 sm:flex-row">
        <Link
          href={practiceHref}
          className="mq-btn mq-btn-primary inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 text-sm font-bold"
        >
          <Sparkles size={15} />
          {isAr ? 'تدرّب لهذه الوظيفة مع جيني' : 'Practice this role with Jeannie'}
        </Link>
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mq-btn mq-btn-ghost inline-flex min-h-[50px] flex-1 items-center justify-center gap-2 text-sm font-bold"
        >
          {isAr ? 'التقديم لدى الشركة' : 'Apply on company site'}
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
