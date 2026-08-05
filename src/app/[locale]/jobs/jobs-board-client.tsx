'use client';

import {
  useDeferredValue,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import {
  ArrowUpLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { BiInline, T } from '@/components/landing/crystal/BiText';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { cn } from '@/lib/utils';
import {
  JOBS,
  JOBS_COPY,
  type JobDept,
  type JobListing,
  type JobType,
} from './jobs-data';

const FACETS = [
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-cut',
  'mq-facet mq-facet-amber mq-facet-shape-cap',
  'mq-facet mq-facet-rose mq-facet-shape-soft',
] as const;

const TYPE_OPTS: Array<JobType | 'all'> = ['all', 'fulltime', 'contract', 'remote'];
const CITY_OPTS = ['all', 'dubai', 'riyadh', 'cairo', 'doha', 'remote'] as const;
const DEPT_OPTS: Array<JobDept | 'all'> = [
  'all',
  'product',
  'engineering',
  'design',
  'people',
  'data',
  'sales',
];

function LanguageSwitcherFixed() {
  const locale = useLocale();
  const pathname = usePathname() || '/';
  const nextLocale = locale === 'ar' ? 'en' : 'ar';
  const href = getLocaleSwitchPath(pathname, locale, nextLocale);

  return (
    <div className="fixed top-4 right-4 z-[70]">
      <a
        href={href}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-bold tracking-wide text-white shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-teal-300/40 hover:bg-white/12"
        aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
      >
        <span className={locale === 'en' ? 'text-teal-300' : 'text-white/45'}>EN</span>
        <span className="text-white/35">/</span>
        <span className={locale === 'ar' ? 'text-teal-300' : 'text-white/45'} dir="rtl" lang="ar">
          عربي
        </span>
      </a>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-teal-300/45 bg-teal-400/15 text-teal-200'
          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80',
      )}
    >
      {children}
    </button>
  );
}

function JobCard({
  job,
  index,
  locale,
  isAr,
}: {
  job: JobListing;
  index: number;
  locale: string;
  isAr: boolean;
}) {
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const facet = FACETS[index % FACETS.length];

  return (
    <motion.article
      layout
      variants={fadeUp}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={cn(
        'mq-panel group relative flex flex-col overflow-hidden p-5 md:p-6',
        facet,
        job.featured && 'ring-1 ring-teal-300/25 shadow-[0_0_36px_rgba(45,212,191,0.1)]',
      )}
    >
      <div className="relative mb-4 flex flex-wrap items-center gap-2">
        {job.featured ? (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300/30 bg-teal-400/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-300">
            <Sparkles size={11} />
            <BiInline bi={JOBS_COPY.featured} />
          </span>
        ) : null}
        <span className="text-[11px] text-white/40">
          <BiInline bi={job.posted} />
        </span>
        <span className="ms-auto inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] font-bold text-teal-200/90">
          <BiInline bi={JOBS_COPY.match} /> {job.match}%
        </span>
      </div>

      <T as="h2" bi={job.title} className="mq-display relative mb-1 text-xl font-bold text-white md:text-2xl" />
      <p className="relative mb-3 flex items-center gap-1.5 text-sm text-white/55">
        <Building2 size={14} className="shrink-0 text-white/35" />
        <BiInline bi={job.company} />
      </p>

      <T as="p" bi={job.blurb} className="relative mb-5 text-sm leading-relaxed text-white/60" />

      <div className="relative mb-5 flex flex-wrap gap-2 text-xs text-white/55">
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
          <MapPin size={12} />
          <BiInline bi={job.location} />
        </span>
        <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1">
          <BriefcaseBusiness size={12} />
          <BiInline bi={job.typeLabel} />
        </span>
        <span className="inline-flex items-center rounded-lg border border-amber-200/20 bg-amber-200/8 px-2.5 py-1 font-semibold text-amber-100/90">
          <BiInline bi={job.salary} />
        </span>
      </div>

      <ul className="relative mb-6 flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <li
            key={tag.en}
            className="rounded-md border border-white/8 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/50"
          >
            <BiInline bi={tag} />
          </li>
        ))}
      </ul>

      <div className="relative mt-auto flex flex-wrap items-center gap-3">
        <Link
          href={localePath(`/register?from=jobs&role=${job.id}`, locale)}
          className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[44px] items-center gap-2 px-5 text-sm"
        >
          <BiInline bi={JOBS_COPY.apply} />
          <Arrow size={15} />
        </Link>
        <Link
          href={localePath('/demo', locale)}
          className="inline-flex min-h-[44px] items-center gap-1.5 text-sm font-semibold text-white/55 transition hover:text-teal-300"
        >
          <BiInline bi={JOBS_COPY.viewPrep} />
        </Link>
      </div>
    </motion.article>
  );
}

export function JobsBoardClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;

  const [query, setQuery] = useState('');
  const [type, setType] = useState<JobType | 'all'>('all');
  const [city, setCity] = useState<(typeof CITY_OPTS)[number]>('all');
  const [dept, setDept] = useState<JobDept | 'all'>('all');
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return JOBS.filter((job) => {
      if (type !== 'all' && job.type !== type) return false;
      if (city !== 'all' && job.city !== city) return false;
      if (dept !== 'all' && job.dept !== dept) return false;
      if (!q) return true;
      const hay = [
        job.title.en,
        job.title.ar,
        job.company.en,
        job.company.ar,
        job.blurb.en,
        job.blurb.ar,
        ...job.tags.map((t) => `${t.en} ${t.ar}`),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    }).sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.match - a.match);
  }, [deferredQuery, type, city, dept]);

  const hasFilters = type !== 'all' || city !== 'all' || dept !== 'all' || query.trim().length > 0;

  const clearFilters = () => {
    startTransition(() => {
      setQuery('');
      setType('all');
      setCity('all');
      setDept('all');
    });
  };

  return (
    <div
      className="mq-atelier relative min-h-screen overflow-x-hidden"
      dir={isAr ? 'rtl' : 'ltr'}
      lang={isAr ? 'ar' : 'en'}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="mq-orb mq-orb-a" />
        <div className="mq-orb mq-orb-b" />
        <div className="mq-orb mq-orb-c" />
      </div>

      <LanguageSwitcherFixed />
      <CrystalNavbar />

      <main>
        {/* Hero — one composition */}
        <section className="relative flex min-h-[min(88vh,820px)] items-center overflow-hidden pb-16 pt-8 md:pb-20 md:pt-10">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 90% 70% at 50% -10%, rgba(45,212,191,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 60%, rgba(232,201,122,0.1), transparent 50%)',
            }}
          />
          <motion.div
            className="pointer-events-none absolute -end-[20%] top-[10%] h-[28rem] w-[28rem] rounded-full bg-teal-400/10 blur-3xl"
            animate={{ opacity: [0.35, 0.65, 0.35], scale: [0.95, 1.08, 0.95] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />
          <motion.div
            className="pointer-events-none absolute -start-[15%] bottom-[5%] h-[22rem] w-[22rem] rounded-full bg-amber-200/8 blur-3xl"
            animate={{ opacity: [0.2, 0.45, 0.2], y: [0, -18, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          />

          <div className="mq-wrap relative w-full">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeUp} className="mb-7 flex justify-center">
                <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
                  <BrandLogo size="hero" priority className="mq-logo-glow" />
                </Link>
              </motion.div>

              <motion.p variants={fadeUp} className="mq-kicker mb-3">
                <BiInline bi={JOBS_COPY.kicker} />
              </motion.p>

              <motion.div variants={fadeUp}>
                <T
                  as="h1"
                  bi={JOBS_COPY.title}
                  className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
                />
              </motion.div>

              <motion.div variants={fadeUp}>
                <T
                  as="p"
                  bi={JOBS_COPY.subtitle}
                  className="mx-auto mb-8 max-w-xl text-base text-white/60 md:text-lg"
                />
              </motion.div>

              <motion.form
                variants={fadeUp}
                className="relative mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  document.getElementById('jobs-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <label className="relative flex-1">
                  <span className="sr-only">
                    <BiInline bi={JOBS_COPY.searchPlaceholder} />
                  </span>
                  <Search
                    size={18}
                    className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/35"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isAr ? JOBS_COPY.searchPlaceholder.ar : JOBS_COPY.searchPlaceholder.en}
                    className="h-14 w-full rounded-2xl border border-white/15 bg-white/[0.06] pe-4 ps-11 text-sm text-white shadow-[0_16px_50px_rgba(0,0,0,0.35)] outline-none backdrop-blur-xl transition placeholder:text-white/35 focus:border-teal-300/45 focus:bg-white/[0.09]"
                  />
                </label>
                <button
                  type="submit"
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex h-14 items-center justify-center gap-2 px-6 text-sm font-bold"
                >
                  <BiInline bi={JOBS_COPY.searchCta} />
                  <Arrow size={16} />
                </button>
              </motion.form>

              <motion.ul
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-white/45"
              >
                {JOBS_COPY.trust.map((item) => (
                  <li key={item.en} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300/80" />
                    <BiInline bi={item} />
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </section>

        {/* Filters + results */}
        <section id="jobs-results" className="mq-section scroll-mt-28 !pt-6 md:!pt-8">
          <div className="mq-wrap">
            <div className="mb-8 flex flex-col gap-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white/70">
                  <span className="text-teal-300">{filtered.length}</span>{' '}
                  <BiInline bi={JOBS_COPY.results} />
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45 transition hover:text-teal-300"
                  >
                    <X size={13} />
                    {isAr ? 'مسح الفلاتر' : 'Clear filters'}
                  </button>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    <BiInline bi={JOBS_COPY.filters.type} />
                  </span>
                  {TYPE_OPTS.map((opt) => (
                    <FilterChip key={opt} active={type === opt} onClick={() => setType(opt)}>
                      {opt === 'all' ? (
                        <BiInline bi={JOBS_COPY.all} />
                      ) : (
                        <BiInline bi={JOBS_COPY.types[opt]} />
                      )}
                    </FilterChip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    <BiInline bi={JOBS_COPY.filters.location} />
                  </span>
                  {CITY_OPTS.map((opt) => (
                    <FilterChip key={opt} active={city === opt} onClick={() => setCity(opt)}>
                      {opt === 'all' ? (
                        <BiInline bi={JOBS_COPY.all} />
                      ) : (
                        <BiInline bi={JOBS_COPY.locations[opt]} />
                      )}
                    </FilterChip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    <BiInline bi={JOBS_COPY.filters.department} />
                  </span>
                  {DEPT_OPTS.map((opt) => (
                    <FilterChip key={opt} active={dept === opt} onClick={() => setDept(opt)}>
                      {opt === 'all' ? (
                        <BiInline bi={JOBS_COPY.all} />
                      ) : (
                        <BiInline bi={JOBS_COPY.depts[opt]} />
                      )}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mq-panel mq-facet mq-facet-cyan mx-auto max-w-lg p-8 text-center"
                >
                  <T as="h3" bi={JOBS_COPY.emptyTitle} className="mq-display mb-2 text-xl font-bold text-white" />
                  <T as="p" bi={JOBS_COPY.emptyBody} className="mb-6 text-sm text-white/60" />
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mq-btn mq-btn-ghost inline-flex min-h-[44px] items-center px-5 text-sm"
                    >
                      {isAr ? 'عرض الكل' : 'Show all roles'}
                    </button>
                    <Link
                      href={localePath('/demo', locale)}
                      className="mq-btn mq-btn-primary inline-flex min-h-[44px] items-center px-5 text-sm"
                    >
                      <BiInline bi={JOBS_COPY.ctaInterview} />
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid gap-4 md:grid-cols-2"
                >
                  {filtered.map((job, i) => (
                    <JobCard key={job.id} job={job} index={i} locale={locale} isAr={isAr} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mq-section !pt-8">
          <div className="mq-wrap">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
              className="mq-facet mq-facet-teal relative overflow-hidden rounded-[2rem] border border-teal-300/25 px-6 py-12 text-center md:px-12 md:py-16"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(45,212,191,0.16), transparent 55%), linear-gradient(180deg, rgba(8,14,26,0.92) 0%, rgba(5,8,15,0.96) 100%)',
              }}
            >
              <motion.div
                className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/6 to-transparent"
                animate={{ x: ['-60%', '220%'] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              />
              <T
                as="h2"
                bi={JOBS_COPY.ctaTitle}
                className="mq-display relative mb-3 text-2xl font-bold text-white md:text-4xl"
              />
              <T
                as="p"
                bi={JOBS_COPY.ctaBody}
                className="relative mx-auto mb-8 max-w-lg text-sm text-white/55 md:text-base"
              />
              <div className="relative flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link
                  href={localePath('/demo', locale)}
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-bold"
                >
                  <BiInline bi={JOBS_COPY.ctaInterview} />
                  <Arrow size={16} />
                </Link>
                <Link
                  href={localePath('/business', locale)}
                  className="mq-btn mq-btn-ghost inline-flex min-h-[48px] items-center justify-center gap-2 px-6 text-sm font-bold"
                >
                  <BiInline bi={JOBS_COPY.ctaHire} />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}
