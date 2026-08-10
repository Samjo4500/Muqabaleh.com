'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
  startTransition,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowUpLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileUp,
  ImagePlus,
  Loader2,
  MapPin,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { fadeUp, stagger } from '@/components/landing/crystal/motion';
import {
  CAREER_LEVELS,
  EMPLOYMENT_TYPES,
  MENA_COUNTRIES,
  VACANCY_INDUSTRIES,
} from '@/lib/constants';
import { cn } from '@/lib/utils';

type Tab = 'vacancies' | 'candidates' | 'companies';

type Vacancy = {
  id: string;
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  location?: string | null;
  city?: string | null;
  country?: string | null;
  employmentType?: string;
  careerLevel?: string | null;
  industry?: string;
  department?: string | null;
  salaryRange?: string | null;
  tags?: string[];
  isFeatured?: boolean;
  createdAt?: string;
  company?: { id?: string; name: string; country?: string } | null;
};

type FeaturedEmployer = {
  id: string;
  name: string;
  country: string | null;
  industry: string;
  openRoles: number;
};

const COPY = {
  kicker: { en: 'Job Portal', ar: 'بوابة الوظائف' },
  title: { en: 'Available Vacancies', ar: 'الشواغر المتاحة' },
  subtitle: {
    en: 'Browse open roles across 20 countries. Candidates join the talent pool. Employers request a demo to post authorized vacancies.',
    ar: 'تصفّح الشواغر عبر ٢٠ دولة. المرشّحون ينضمون لقاعدة المواهب. الشركات تطلب عرضاً لنشر شواغر مصرّحة.',
  },
  tabs: {
    vacancies: { en: 'Available Vacancies', ar: 'الشواغر المتاحة' },
    candidates: { en: 'Candidates', ar: 'المرشّحون' },
    companies: { en: 'Companies hiring', ar: 'شركات توظّف' },
  },
  search: { en: 'Search role, company, or skill…', ar: 'ابحث عن وظيفة، شركة، أو مهارة…' },
  allCountries: { en: 'All countries', ar: 'كل الدول' },
  remote: { en: 'Remote · MENA', ar: 'عن بُعد · المنطقة' },
  results: { en: 'open vacancies', ar: 'شاغر مفتوح' },
  apply: { en: 'Apply', ar: 'قدّم' },
  featuredEmployers: { en: 'Featured employers', ar: 'شركات مميزة' },
  hiringNow: { en: 'hiring now', ar: 'توظّف الآن' },
  filters: {
    country: { en: 'Country', ar: 'الدولة' },
    type: { en: 'Work type', ar: 'نوع العمل' },
    level: { en: 'Level', ar: 'المستوى' },
    industry: { en: 'Industry', ar: 'القطاع' },
  },
  all: { en: 'All', ar: 'الكل' },
  badgeNew: { en: 'New', ar: 'جديد' },
  badgeFeatured: { en: 'Featured', ar: 'مميزة' },
  empty: {
    en: 'No vacancies match these filters yet. Candidates can still join the talent pool; companies can post the first role.',
    ar: 'لا توجد شواغر مطابقة لهذه الفلاتر بعد. يمكن للمرشّحين الانضمام لقاعدة المواهب، وللشركات نشر أول شاغر.',
  },
  candidateTitle: {
    en: 'Register for vacancies & future roles',
    ar: 'سجّل للشواغر والفرص المستقبلية',
  },
  candidateBody: {
    en: 'Create your account, upload CV and photo, and let employers across MENA find you.',
    ar: 'أنشئ حسابك، ارفع سيرتك وصورتك، ودع أصحاب العمل في المنطقة يجدونك.',
  },
  companyTitle: {
    en: 'Companies: hire on Muqabaleh',
    ar: 'الشركات: وظّفوا عبر مقابلة',
  },
  companyBody: {
    en: 'Post authorized vacancies and screen with AI. Request a demo to unlock the business console — self-serve posting is paused while we onboard employers.',
    ar: 'انشر شواغر مصرّحة وفرز بالذكاء الاصطناعي. اطلب عرضاً لتفعيل لوحة الأعمال — النشر الذاتي متوقف مؤقتاً أثناء تفعيل الشركات.',
  },
};

function t(locale: string, bi: { en: string; ar: string }) {
  return locale === 'ar' ? bi.ar : bi.en;
}

function countryLabel(locale: string, code: string) {
  if (code === 'REMOTE') return t(locale, COPY.remote);
  const c = MENA_COUNTRIES.find((x) => x.code === code);
  if (!c) return code;
  return locale === 'ar' ? `${c.flag_emoji} ${c.name_ar}` : `${c.flag_emoji} ${c.name_en}`;
}

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

export function VacanciesClient() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'vacancies';

  const [tab, setTab] = useState<Tab>(
    ['vacancies', 'candidates', 'companies'].includes(initialTab) ? initialTab : 'vacancies',
  );
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('all');
  const [employmentType, setEmploymentType] = useState('all');
  const [level, setLevel] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [featuredEmployers, setFeaturedEmployers] = useState<FeaturedEmployer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const param = searchParams.get('tab') as Tab | null;
    if (param && ['vacancies', 'candidates', 'companies'].includes(param) && param !== tab) {
      setTab(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function switchTab(next: Tab) {
    setTab(next);
    const url = localePath(next === 'vacancies' ? '/portal/jobs' : `/portal/jobs?tab=${next}`, locale);
    router.replace(url, { scroll: false });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (country !== 'all') params.set('country', country);
    if (employmentType !== 'all') params.set('type', employmentType);
    if (level !== 'all') params.set('level', level);
    if (industry !== 'all') params.set('industry', industry);
    fetch(`/api/jobs?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setVacancies(Array.isArray(d.jobs) ? d.jobs : []);
        setFeaturedEmployers(
          Array.isArray(d.featuredEmployers) ? d.featuredEmployers : [],
        );
      })
      .catch(() => {
        if (!cancelled) {
          setVacancies([]);
          setFeaturedEmployers([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, country, employmentType, level, industry]);

  const countryOpts = useMemo(
    () => [
      { code: 'all', label: t(locale, COPY.allCountries) },
      { code: 'REMOTE', label: t(locale, COPY.remote) },
      ...MENA_COUNTRIES.map((c) => ({
        code: c.code,
        label: isAr ? `${c.flag_emoji} ${c.name_ar}` : `${c.flag_emoji} ${c.name_en}`,
      })),
    ],
    [locale, isAr],
  );

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
        <section className="relative overflow-hidden pb-10 pt-8 md:pb-12 md:pt-10">
          <div className="mq-wrap relative">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeUp} className="mb-6 flex justify-center">
                <Link href={localePath('/', locale)} aria-label="Muqabaleh" className="inline-flex">
                  <BrandLogo size="hero" priority className="mq-logo-glow" />
                </Link>
              </motion.div>
              <motion.p variants={fadeUp} className="mq-kicker mb-3">
                {t(locale, COPY.kicker)}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                {t(locale, COPY.title)}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mx-auto mb-8 max-w-2xl text-base text-white/60 md:text-lg"
              >
                {t(locale, COPY.subtitle)}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mx-auto flex max-w-xl flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2"
                role="tablist"
              >
                {(
                  [
                    ['vacancies', COPY.tabs.vacancies, BriefcaseBusiness],
                    ['candidates', COPY.tabs.candidates, UserRound],
                    ['companies', COPY.tabs.companies, Building2],
                  ] as const
                ).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => switchTab(key)}
                    className={cn(
                      'inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition sm:text-sm',
                      tab === key
                        ? 'bg-teal-400/20 text-teal-100'
                        : 'text-white/55 hover:bg-white/5 hover:text-white/80',
                    )}
                  >
                    <Icon size={16} />
                    {t(locale, label)}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="mq-section !pt-2">
          <div className="mq-wrap">
            <AnimatePresence mode="wait">
              {tab === 'vacancies' ? (
                <motion.div
                  key="vacancies"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <VacanciesPanel
                    locale={locale}
                    isAr={isAr}
                    Arrow={Arrow}
                    query={query}
                    setQuery={setQuery}
                    country={country}
                    setCountry={setCountry}
                    employmentType={employmentType}
                    setEmploymentType={setEmploymentType}
                    level={level}
                    setLevel={setLevel}
                    industry={industry}
                    setIndustry={setIndustry}
                    countryOpts={countryOpts}
                    vacancies={vacancies}
                    featuredEmployers={featuredEmployers}
                    loading={loading}
                    onGoCandidates={() => switchTab('candidates')}
                    onGoCompanies={() => switchTab('companies')}
                    onClearFilters={() => {
                      setCountry('all');
                      setEmploymentType('all');
                      setLevel('all');
                      setIndustry('all');
                      setQuery('');
                    }}
                  />
                </motion.div>
              ) : null}
              {tab === 'candidates' ? (
                <motion.div
                  key="candidates"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <CandidatePanel locale={locale} isAr={isAr} />
                </motion.div>
              ) : null}
              {tab === 'companies' ? (
                <motion.div
                  key="companies"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <CompanyPanel
                    locale={locale}
                    isAr={isAr}
                    onPosted={() => {
                      switchTab('vacancies');
                      startTransition(() => {
                        setCountry('all');
                        setEmploymentType('all');
                        setLevel('all');
                        setIndustry('all');
                        setQuery('');
                      });
                    }}
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}

function labelForType(locale: string, code: string) {
  const row = EMPLOYMENT_TYPES.find((x) => x.code === code);
  if (!row) return code;
  return locale === 'ar' ? row.ar : row.en;
}

function labelForLevel(locale: string, code: string) {
  const row = CAREER_LEVELS.find((x) => x.code === code);
  if (!row) return code;
  return locale === 'ar' ? row.ar : row.en;
}

function labelForIndustry(locale: string, code: string) {
  const row = VACANCY_INDUSTRIES.find(
    (x) => x.code.toLowerCase() === code.toLowerCase(),
  );
  if (!row) return code;
  return locale === 'ar' ? row.ar : row.en;
}

function isNewVacancy(createdAt?: string) {
  if (!createdAt) return false;
  const age = Date.now() - new Date(createdAt).getTime();
  return age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
}

function VacanciesPanel({
  locale,
  isAr,
  Arrow,
  query,
  setQuery,
  country,
  setCountry,
  employmentType,
  setEmploymentType,
  level,
  setLevel,
  industry,
  setIndustry,
  countryOpts,
  vacancies,
  featuredEmployers,
  loading,
  onGoCandidates,
  onGoCompanies,
  onClearFilters,
}: {
  locale: string;
  isAr: boolean;
  Arrow: typeof ArrowUpRight;
  query: string;
  setQuery: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
  employmentType: string;
  setEmploymentType: (v: string) => void;
  level: string;
  setLevel: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  countryOpts: Array<{ code: string; label: string }>;
  vacancies: Vacancy[];
  featuredEmployers: FeaturedEmployer[];
  loading: boolean;
  onGoCandidates: () => void;
  onGoCompanies: () => void;
  onClearFilters: () => void;
}) {
  const hasFilters =
    country !== 'all' ||
    employmentType !== 'all' ||
    level !== 'all' ||
    industry !== 'all' ||
    query.trim().length > 0;

  return (
    <div className="space-y-6">
      {featuredEmployers.length > 0 ? (
        <div className="rounded-[1.5rem] border border-teal-300/20 bg-teal-400/[0.06] p-4 md:p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-white">
              {t(locale, COPY.featuredEmployers)}
            </h2>
            <button
              type="button"
              onClick={onGoCompanies}
              className="text-xs font-semibold text-teal-300 hover:underline"
            >
              {isAr ? 'انشر شاغراً' : 'Post a vacancy'}
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {featuredEmployers.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  setQuery(emp.name);
                }}
                className="min-w-[160px] shrink-0 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-start transition hover:border-teal-300/35"
              >
                <p className="truncate text-sm font-semibold text-white">{emp.name}</p>
                <p className="mt-1 truncate text-[11px] text-white/45">
                  {emp.country ? countryLabel(locale, emp.country) : emp.industry} ·{' '}
                  {emp.openRoles} {t(locale, COPY.hiringNow)}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-5">
        <form
          className="mb-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/35"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(locale, COPY.search)}
              className="h-12 w-full rounded-2xl border border-white/15 bg-white/[0.06] pe-4 ps-11 text-sm text-white outline-none placeholder:text-white/35 focus:border-teal-300/45"
            />
          </label>
        </form>

        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white/70">
            <span className="text-teal-300">{loading ? '…' : vacancies.length}</span>{' '}
            {t(locale, COPY.results)}
          </p>
          {hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45 hover:text-teal-300"
            >
              <X size={13} />
              {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          ) : null}
        </div>

        <div className="space-y-3">
          <FacetRow label={t(locale, COPY.filters.country)}>
            {countryOpts.map((opt) => (
              <FilterChip
                key={opt.code}
                active={country === opt.code}
                onClick={() => setCountry(opt.code)}
              >
                {opt.label}
              </FilterChip>
            ))}
          </FacetRow>

          <FacetRow label={t(locale, COPY.filters.type)}>
            <FilterChip
              active={employmentType === 'all'}
              onClick={() => setEmploymentType('all')}
            >
              {t(locale, COPY.all)}
            </FilterChip>
            {EMPLOYMENT_TYPES.map((opt) => (
              <FilterChip
                key={opt.code}
                active={employmentType === opt.code}
                onClick={() => setEmploymentType(opt.code)}
              >
                {locale === 'ar' ? opt.ar : opt.en}
              </FilterChip>
            ))}
          </FacetRow>

          <FacetRow label={t(locale, COPY.filters.level)}>
            <FilterChip active={level === 'all'} onClick={() => setLevel('all')}>
              {t(locale, COPY.all)}
            </FilterChip>
            {CAREER_LEVELS.map((opt) => (
              <FilterChip
                key={opt.code}
                active={level === opt.code}
                onClick={() => setLevel(opt.code)}
              >
                {locale === 'ar' ? opt.ar : opt.en}
              </FilterChip>
            ))}
          </FacetRow>

          <FacetRow label={t(locale, COPY.filters.industry)}>
            <FilterChip active={industry === 'all'} onClick={() => setIndustry('all')}>
              {t(locale, COPY.all)}
            </FilterChip>
            {VACANCY_INDUSTRIES.map((opt) => (
              <FilterChip
                key={opt.code}
                active={industry === opt.code}
                onClick={() => setIndustry(opt.code)}
              >
                {locale === 'ar' ? opt.ar : opt.en}
              </FilterChip>
            ))}
          </FacetRow>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-white/50">
          <Loader2 className="animate-spin" />
        </div>
      ) : vacancies.length === 0 ? (
        <div className="mq-panel mx-auto max-w-xl p-8 text-center">
          <p className="mb-6 text-sm text-white/60">{t(locale, COPY.empty)}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onGoCandidates}
              className="mq-btn mq-btn-primary min-h-[44px] px-5 text-sm"
            >
              {t(locale, COPY.tabs.candidates)}
            </button>
            <button
              type="button"
              onClick={onGoCompanies}
              className="mq-btn mq-btn-ghost min-h-[44px] px-5 text-sm"
            >
              {t(locale, COPY.tabs.companies)}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {vacancies.map((job, i) => {
            const title = isAr && job.titleAr ? job.titleAr : job.title;
            const blurb = (
              isAr && job.descriptionAr ? job.descriptionAr : job.description || ''
            ).slice(0, 160);
            return (
              <motion.article
                key={job.id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'mq-panel flex flex-col p-5 md:p-6',
                  job.isFeatured && 'ring-1 ring-teal-300/25',
                )}
              >
                <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/45">
                  {job.isFeatured ? (
                    <span className="rounded-md border border-teal-300/30 bg-teal-400/15 px-2 py-0.5 font-bold text-teal-200">
                      {t(locale, COPY.badgeFeatured)}
                    </span>
                  ) : null}
                  {isNewVacancy(job.createdAt) ? (
                    <span className="rounded-md border border-amber-200/30 bg-amber-200/10 px-2 py-0.5 font-bold text-amber-100">
                      {t(locale, COPY.badgeNew)}
                    </span>
                  ) : null}
                  {job.country ? <span>{countryLabel(locale, job.country)}</span> : null}
                  {job.employmentType ? (
                    <span className="rounded-md border border-white/10 px-2 py-0.5">
                      {labelForType(locale, job.employmentType)}
                    </span>
                  ) : null}
                  {job.careerLevel ? (
                    <span className="rounded-md border border-white/10 px-2 py-0.5">
                      {labelForLevel(locale, job.careerLevel)}
                    </span>
                  ) : null}
                </div>
                <h2 className="mq-display mb-1 text-xl font-bold text-white">{title}</h2>
                <p className="mb-3 flex items-center gap-1.5 text-sm text-white/55">
                  <Building2 size={14} />
                  {job.company?.name || 'Muqabaleh'}
                  {job.industry ? (
                    <span className="text-white/35">
                      · {labelForIndustry(locale, job.industry)}
                    </span>
                  ) : null}
                </p>
                {blurb ? (
                  <p className="mb-4 text-sm leading-relaxed text-white/60">{blurb}</p>
                ) : null}
                <div className="mb-5 flex flex-wrap gap-2 text-xs text-white/55">
                  {(job.location || job.city) && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1">
                      <MapPin size={12} />
                      {job.location || job.city}
                    </span>
                  )}
                  {job.salaryRange ? (
                    <span className="rounded-lg border border-amber-200/20 bg-amber-200/8 px-2.5 py-1 text-amber-100">
                      {job.salaryRange}
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto">
                  <Link
                    href={localePath(`/portal/jobs/${job.id}`, locale)}
                    className="mq-btn mq-btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 text-sm"
                  >
                    {t(locale, COPY.apply)}
                    <Arrow size={15} />
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FacetRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-white/35">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">{children}</div>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-white/60">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white placeholder:text-white/30"
      />
    </label>
  );
}

function CountrySelect({
  name,
  locale,
  required,
  label,
  defaultValue = 'SA',
}: {
  name: string;
  locale: string;
  required?: boolean;
  label: string;
  defaultValue?: string;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-white/60">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
      >
        {MENA_COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {locale === 'ar'
              ? `${c.flag_emoji} ${c.name_ar}`
              : `${c.flag_emoji} ${c.name_en}`}
          </option>
        ))}
        <option value="REMOTE">{t(locale, COPY.remote)}</option>
      </select>
    </label>
  );
}

function CandidatePanel({ locale, isAr }: { locale: string; isAr: boolean }) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [cvName, setCvName] = useState('');
  const [photoName, setPhotoName] = useState('');
  const loggedIn = status === 'authenticated';

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDone(false);
    const form = new FormData(e.currentTarget);
    form.set('openToWork', 'true');
    form.set('marketingOptIn', 'true');
    form.set('locale', locale);
    if (!form.get('desiredRole') && form.get('role')) {
      form.set('desiredRole', String(form.get('role')));
    }
    try {
      const { attributionPayload } = await import('@/lib/marketing/attribution');
      const attr = attributionPayload();
      for (const [k, v] of Object.entries(attr)) form.set(k, v);
      const endpoint = loggedIn ? '/api/talent/me' : '/api/talent/register';
      const method = loggedIn ? 'PATCH' : 'POST';
      const res = await fetch(endpoint, { method, body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed');
        return;
      }
      setDone(true);
      if (data.createdAccount) {
        window.location.href = localePath(
          `/auth/signin?callbackUrl=${encodeURIComponent('/portal/jobs?tab=candidates&from=talent')}`,
          locale,
        );
      }
    } catch {
      setError(isAr ? 'حدث خطأ' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mq-display mb-2 text-2xl font-bold text-white md:text-3xl">
        {t(locale, COPY.candidateTitle)}
      </h2>
      <p className="mb-6 text-sm text-white/60">{t(locale, COPY.candidateBody)}</p>

      {done ? (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-teal-300/30 bg-teal-400/10 px-4 py-3 text-sm text-teal-100">
          <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
          <span>
            {isAr
              ? 'أنت الآن في قاعدة المواهب. يمكن لأصحاب العمل إيجادك.'
              : 'You are in the talent pool. Employers can find you now.'}
          </span>
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-8"
      >
        {loggedIn ? (
          <p className="text-sm text-white/55">
            {isAr ? 'مسجّل الدخول باسم' : 'Signed in as'}{' '}
            <span className="text-white">{session?.user?.email}</span>
          </p>
        ) : (
          <>
            <Field label={isAr ? 'الاسم الكامل' : 'Full name'} name="name" required />
            <Field label={isAr ? 'البريد الإلكتروني' : 'Email'} name="email" type="email" required />
            <Field
              label={isAr ? 'كلمة المرور (٨+)' : 'Password (8+)'}
              name="password"
              type="password"
              required
              minLength={8}
            />
          </>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <CountrySelect
            name="country"
            locale={locale}
            label={isAr ? 'الدولة' : 'Country'}
            required
          />
          <Field label={isAr ? 'الجوال' : 'Phone'} name="phone" />
        </div>
        <Field
          label={isAr ? 'الدور المطلوب' : 'Desired role'}
          name="role"
          required
          placeholder={isAr ? 'مثال: مهندس برمجيات' : 'e.g. Software Engineer'}
        />
        <Field label={isAr ? 'عنوان مختصر' : 'Headline'} name="headline" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5 text-sm">
            <span className="text-white/60">{isAr ? 'المستوى' : 'Level'}</span>
            <select
              name="level"
              defaultValue="MID"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
            >
              <option value="JUNIOR">{isAr ? 'مبتدئ' : 'Junior'}</option>
              <option value="MID">{isAr ? 'متوسط' : 'Mid'}</option>
              <option value="SENIOR">{isAr ? 'خبير' : 'Senior'}</option>
              <option value="LEAD">{isAr ? 'قيادي' : 'Lead'}</option>
            </select>
          </label>
          <Field
            label={isAr ? 'سنوات الخبرة' : 'Years of experience'}
            name="yearsExperience"
            type="number"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={isAr ? 'القطاع' : 'Industry'} name="industry" />
          <Field label={isAr ? 'المدينة / الموقع' : 'City / location'} name="location" />
        </div>
        <Field
          label={isAr ? 'رابط LinkedIn' : 'LinkedIn URL'}
          name="linkedInUrl"
          placeholder="https://linkedin.com/in/…"
        />
        <Field
          label={isAr ? 'المهارات (فواصل)' : 'Skills (comma-separated)'}
          name="skills"
        />
        <label className="block space-y-1.5 text-sm">
          <span className="text-white/60">{isAr ? 'نبذة' : 'Summary'}</span>
          <textarea
            name="summary"
            rows={4}
            className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-white"
          />
        </label>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center hover:border-teal-300/40">
          <FileUp className="text-teal-300" size={22} />
          <span className="text-sm font-semibold text-white">
            {isAr ? 'رفع السيرة (PDF / Word) *' : 'Upload CV (PDF / Word) *'}
          </span>
          <span className="text-xs text-white/45">
            {cvName || (isAr ? 'مطلوب · حتى ٣ ميجابايت' : 'Required · up to 3 MB')}
          </span>
          <input
            type="file"
            name="cv"
            accept=".pdf,.doc,.docx,application/pdf"
            required
            className="sr-only"
            onChange={(e) => setCvName(e.target.files?.[0]?.name || '')}
          />
        </label>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 px-4 py-8 text-center hover:border-amber-200/40">
          <ImagePlus className="text-amber-200" size={22} />
          <span className="text-sm font-semibold text-white">
            {isAr ? 'رفع صورة شخصية' : 'Upload profile photo'}
          </span>
          <span className="text-xs text-white/45">
            {photoName || (isAr ? 'اختياري' : 'Optional')}
          </span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')}
          />
        </label>

        {error ? (
          <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mq-btn mq-btn-primary flex w-full min-h-[48px] items-center justify-center gap-2 text-sm font-bold"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {isAr ? 'انضم لقاعدة المواهب' : 'Join the talent pool'}
        </button>
      </form>
    </div>
  );
}

function CompanyPanel({
  locale,
  isAr,
}: {
  locale: string;
  isAr: boolean;
  onPosted: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="mq-display mb-2 text-2xl font-bold text-white md:text-3xl">
        {t(locale, COPY.companyTitle)}
      </h2>
      <p className="mb-6 text-sm text-white/60">{t(locale, COPY.companyBody)}</p>

      <div className="space-y-5 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
          <Building2 size={22} strokeWidth={1.75} />
        </div>
        <p className="text-sm text-white/70">
          {isAr
            ? 'لوحة الأعمال متاحة للمعاينة ببيانات تجريبية. لنشر شواغر حقيقية وإدارة المرشحين، اطلب عرضاً توضيحياً.'
            : 'The business console is available as a sample-data preview. To post real vacancies and manage candidates, request a demo.'}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={localePath('/request-demo?from=portal-companies', locale)}
            className="mq-btn mq-btn-primary inline-flex min-h-[48px] flex-1 items-center justify-center text-sm font-bold"
          >
            {isAr ? 'اطلب عرضاً توضيحياً' : 'Request a demo'}
          </Link>
          <Link
            href={localePath('/b2b', locale)}
            className="mq-btn mq-btn-ghost inline-flex min-h-[48px] flex-1 items-center justify-center text-sm font-bold"
          >
            {isAr ? 'معاينة اللوحة' : 'Preview console'}
          </Link>
        </div>
        <p className="text-center text-xs text-white/40">
          <Link href={localePath('/business', locale)} className="text-teal-300 hover:underline">
            {isAr ? 'تعرّف على مقابلة للأعمال' : 'Learn about Muqabaleh for Business'}
          </Link>
        </p>
      </div>
    </div>
  );
}
