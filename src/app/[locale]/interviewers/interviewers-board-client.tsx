'use client';

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Search,
  Star,
  Users,
  X,
} from 'lucide-react';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { cn } from '@/lib/utils';

type InterviewerApiData = {
  id: string;
  fullName: string;
  fullNameAr: string | null;
  bio: string | null;
  bioAr: string | null;
  rating: number;
  totalInterviews: number;
  specialties: string[];
  industries: string[];
  languages: string[];
  priceTier: string;
  hourlyRate: number;
  initials?: string;
};

const FACETS = [
  'mq-facet mq-facet-teal mq-facet-shape-soft',
  'mq-facet mq-facet-gold mq-facet-shape-wave',
  'mq-facet mq-facet-cyan mq-facet-shape-soft',
  'mq-facet mq-facet-amber mq-facet-shape-cap',
  'mq-facet mq-facet-rose mq-facet-shape-wave',
] as const;

const INDUSTRY_OPTS = [
  'all',
  'TECH',
  'FINTECH',
  'FINANCE',
  'HEALTHCARE',
  'RETAIL',
  'TELECOM',
  'MANUFACTURING',
] as const;

const LANG_OPTS = ['all', 'AR', 'EN'] as const;
const PRICE_OPTS = ['all', 'STANDARD', 'PREMIUM', 'ELITE'] as const;
const RATING_OPTS = ['all', '4.5', '4.0', '3.5'] as const;

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatPrice(cents: number) {
  return Math.round(cents / 100);
}

function formatSpecialty(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function CardSkeleton() {
  return (
    <div className="mq-panel flex flex-col gap-4 p-5 md:p-6">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 animate-pulse rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/8" />
        </div>
      </div>
      <div className="h-4 w-24 animate-pulse rounded bg-white/8" />
      <div className="mt-auto h-10 animate-pulse rounded-xl bg-white/8" />
    </div>
  );
}

function InterviewerCard({
  data,
  index,
  locale,
  isAr,
  t,
}: {
  data: InterviewerApiData;
  index: number;
  locale: string;
  isAr: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;
  const name = (isAr ? data.fullNameAr : data.fullName) || data.fullName;
  const bio = (isAr ? data.bioAr : data.bio) || '';
  const initials = data.initials || getInitials(data.fullName);
  const price = formatPrice(data.hourlyRate);
  const specialties = data.specialties.map(formatSpecialty).slice(0, 3);
  const langLabels = data.languages.map((l) => {
    if (l === 'AR') return t('dialectMSA');
    if (l === 'EN') return t('dialectEnglish');
    return l;
  });

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={cn(
        'mq-panel group relative flex flex-col overflow-hidden p-5 md:p-6',
        FACETS[index % FACETS.length],
      )}
    >
      <div className="relative mb-4 flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-teal-300/30 bg-teal-400/12 text-sm font-bold text-teal-100">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mq-display truncate text-lg font-bold text-white md:text-xl">{name}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/55">
            {bio.length > 100 ? `${bio.slice(0, 100)}…` : bio}
          </p>
        </div>
      </div>

      <div className="relative mb-4 flex flex-wrap gap-1.5">
        {specialties.map((s) => (
          <span
            key={s}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-medium text-white/50"
          >
            {s}
          </span>
        ))}
      </div>

      <div className="relative mb-5 flex flex-wrap items-center gap-3 text-xs text-white/50">
        <span className="inline-flex items-center gap-1 font-semibold text-amber-100/90">
          <Star size={13} className="fill-amber-200/80 text-amber-200/80" />
          {data.rating.toFixed(1)}
        </span>
        <span>
          {data.totalInterviews}{' '}
          {data.totalInterviews === 1 ? t('sessions') : t('sessionsPlural')}
        </span>
        <span>{langLabels.join(' · ')}</span>
      </div>

      <div className="relative mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-white/8 pt-4">
        <p className="text-sm text-white/50">
          {t('from')}{' '}
          <span className="mq-display text-xl font-bold text-teal-300">${price}</span>
          <span className="text-[11px] text-white/35"> / {t('perSession')}</span>
        </p>
        <Link
          href={localePath(`/interviewer/${data.id}`, locale)}
          className="mq-btn mq-btn-primary inline-flex min-h-[40px] items-center gap-1.5 px-4 text-sm font-bold"
        >
          {t('viewProfile')}
          <Arrow size={14} />
        </Link>
      </div>
    </motion.article>
  );
}

export function InterviewersBoardClient() {
  const t = useTranslations('interviewers');
  const locale = useLocale();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowUpLeft : ArrowUpRight;

  const [interviewers, setInterviewers] = useState<InterviewerApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<(typeof INDUSTRY_OPTS)[number]>('all');
  const [language, setLanguage] = useState<(typeof LANG_OPTS)[number]>('all');
  const [price, setPrice] = useState<(typeof PRICE_OPTS)[number]>('all');
  const [rating, setRating] = useState<(typeof RATING_OPTS)[number]>('all');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (industry !== 'all') params.set('industry', industry);
        if (language !== 'all') params.set('language', language);
        if (price !== 'all') params.set('price', price);
        if (rating !== 'all') params.set('rating', rating);

        const res = await fetch(`/api/interviewers?${params.toString()}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled) setInterviewers(data.interviewers || []);
      } catch {
        if (!cancelled) setError('Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [industry, language, price, rating]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return interviewers;
    return interviewers.filter((i) => {
      const name = ((isAr ? i.fullNameAr : i.fullName) || i.fullName).toLowerCase();
      const bio = ((isAr ? i.bioAr : i.bio) || '').toLowerCase();
      const specs = i.specialties.join(' ').toLowerCase();
      return name.includes(q) || bio.includes(q) || specs.includes(q);
    });
  }, [interviewers, deferredSearch, isAr]);

  const hasFilters =
    search.trim().length > 0 ||
    industry !== 'all' ||
    language !== 'all' ||
    price !== 'all' ||
    rating !== 'all';

  const resetFilters = useCallback(() => {
    setSearch('');
    setIndustry('all');
    setLanguage('all');
    setPrice('all');
    setRating('all');
  }, []);

  const sectorLabel = (key: string) => {
    const map: Record<string, string> = {
      TECH: 'sectorTECH',
      FINTECH: 'sectorFINTECH',
      FINANCE: 'sectorFINANCE',
      HEALTHCARE: 'sectorHEALTHCARE',
      RETAIL: 'sectorRETAIL',
      TELECOM: 'sectorTELECOM',
      MANUFACTURING: 'sectorMANUFACTURING',
    };
    const msgKey = map[key];
    return msgKey ? t(msgKey as 'sectorTECH') : key;
  };

  const priceLabel = (key: string) => {
    if (key === 'STANDARD') return '$29';
    if (key === 'PREMIUM') return '$39';
    if (key === 'ELITE') return '$59';
    return key;
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
        <section className="relative flex min-h-[min(78vh,720px)] items-center overflow-hidden pb-12 pt-8 md:pb-16 md:pt-10">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 80% 55% at 50% 0%, rgba(45,212,191,0.15), transparent 55%), radial-gradient(ellipse 45% 40% at 90% 70%, rgba(232,201,122,0.1), transparent 50%)',
            }}
          />

          <div className="mq-wrap relative w-full">
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="mx-auto max-w-3xl text-center"
            >
              <motion.div variants={fadeUp} className="mb-6 flex justify-center">
                <BrandLogo size="hero" priority className="mq-logo-glow" />
              </motion.div>
              <motion.p variants={fadeUp} className="mq-kicker mb-3">
                {t('eyebrow')}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="mq-display mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
              >
                {t('title')}
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mx-auto mb-8 max-w-xl text-base text-white/60 md:text-lg"
              >
                {t('sub')}
              </motion.p>

              <motion.form
                variants={fadeUp}
                className="relative mx-auto flex max-w-xl flex-col gap-3 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('experts-results')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <label className="relative flex-1">
                  <span className="sr-only">{t('searchPlaceholder')}</span>
                  <Search
                    size={18}
                    className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-white/35"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="h-14 w-full rounded-2xl border border-white/15 bg-white/[0.06] pe-4 ps-11 text-sm text-white shadow-[0_16px_50px_rgba(0,0,0,0.35)] outline-none backdrop-blur-xl transition placeholder:text-white/35 focus:border-teal-300/45"
                  />
                </label>
                <button
                  type="submit"
                  className="mq-btn mq-btn-primary mq-btn-shimmer inline-flex h-14 items-center justify-center gap-2 px-6 text-sm font-bold"
                >
                  {t('searchCta')}
                  <Arrow size={16} />
                </button>
              </motion.form>

              <motion.ul
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-white/45"
              >
                {[t('trust1'), t('trust2'), t('trust3')].map((item) => (
                  <li key={item} className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-300/80" />
                    {item}
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </div>
        </section>

        <section id="experts-results" className="mq-section scroll-mt-28 !pt-4 md:!pt-6">
          <div className="mq-wrap">
            <div className="mb-8 flex flex-col gap-5 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white/70">
                  <span className="text-teal-300">{loading ? '—' : filtered.length}</span>{' '}
                  {t('results')}
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45 transition hover:text-teal-300"
                  >
                    <X size={13} />
                    {t('clearFilters')}
                  </button>
                ) : null}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    {t('allSectors')}
                  </span>
                  {INDUSTRY_OPTS.map((opt) => (
                    <FilterChip
                      key={opt}
                      active={industry === opt}
                      onClick={() => setIndustry(opt)}
                    >
                      {opt === 'all' ? t('allSectors') : sectorLabel(opt)}
                    </FilterChip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    {t('allLanguages')}
                  </span>
                  {LANG_OPTS.map((opt) => (
                    <FilterChip
                      key={opt}
                      active={language === opt}
                      onClick={() => setLanguage(opt)}
                    >
                      {opt === 'all'
                        ? t('allLanguages')
                        : opt === 'AR'
                          ? t('dialectMSA')
                          : t('dialectEnglish')}
                    </FilterChip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    {t('priceRange')}
                  </span>
                  {PRICE_OPTS.map((opt) => (
                    <FilterChip key={opt} active={price === opt} onClick={() => setPrice(opt)}>
                      {opt === 'all' ? t('anyPrice') : priceLabel(opt)}
                    </FilterChip>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                    {t('allRatings')}
                  </span>
                  {RATING_OPTS.map((opt) => (
                    <FilterChip
                      key={opt}
                      active={rating === opt}
                      onClick={() => setRating(opt)}
                    >
                      {opt === 'all'
                        ? t('allRatings')
                        : opt === '4.5'
                          ? t('rating4Plus')
                          : opt === '4.0'
                            ? t('rating4')
                            : t('rating3')}
                    </FilterChip>
                  ))}
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : null}

            {!loading && error ? (
              <div className="mq-panel mq-facet mq-facet-rose mx-auto max-w-lg p-8 text-center">
                <Users className="mx-auto mb-3 text-rose-300/80" size={36} />
                <h3 className="mq-display mb-2 text-xl font-bold text-white">{t('emptyTitle')}</h3>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mq-btn mq-btn-ghost mt-4 inline-flex min-h-[44px] items-center px-5 text-sm"
                >
                  {t('emptyCta')}
                </button>
              </div>
            ) : null}

            {!loading && !error && filtered.length > 0 ? (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {filtered.map((item, i) => (
                  <InterviewerCard
                    key={item.id}
                    data={item}
                    index={i}
                    locale={locale}
                    isAr={isAr}
                    t={t}
                  />
                ))}
              </motion.div>
            ) : null}

            {!loading && !error && filtered.length === 0 ? (
              <div className="mq-panel mq-facet mq-facet-cyan mx-auto max-w-lg p-8 text-center">
                <h3 className="mq-display mb-2 text-xl font-bold text-white">{t('emptyTitle')}</h3>
                <p className="mb-6 text-sm text-white/60">
                  {interviewers.length === 0 ? t('emptyZero') : t('emptySub')}
                </p>
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mq-btn mq-btn-primary inline-flex min-h-[44px] items-center px-5 text-sm"
                  >
                    {t('emptyCta')}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section className="mq-section !pt-6">
          <div className="mq-wrap">
            <motion.div
              className="mq-facet mq-facet-gold relative overflow-hidden rounded-[2rem] border border-amber-200/25 px-6 py-12 text-center md:px-12 md:py-16"
              style={{
                background:
                  'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(232,201,122,0.14), transparent 55%), linear-gradient(180deg, rgba(8,14,26,0.92) 0%, rgba(5,8,15,0.96) 100%)',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: easeCrystal }}
            >
              <h2 className="mq-display relative text-2xl font-bold text-white md:text-4xl">
                {t('joinCtaTitle')}
              </h2>
              <p className="relative mx-auto mt-3 max-w-lg text-sm text-white/55 md:text-base">
                {t('joinCtaBody')}
              </p>
              <Link
                href={localePath('/join-as-interviewer', locale)}
                className="mq-btn mq-btn-primary mq-btn-shimmer relative mt-8 inline-flex min-h-[48px] items-center gap-2 px-7 text-sm font-bold"
              >
                {t('joinCtaButton')}
                <Arrow size={16} />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <CrystalFooter />
    </div>
  );
}
