'use client';

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpLeft,
  ArrowUpRight,
  Briefcase,
  Check,
  Clock,
  Globe2,
  Search,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import { getLocaleSwitchPath, localePath } from '@/i18n/navigation';
import { BrandLogo } from '@/components/landing/crystal/BrandLogo';
import { CrystalFooter } from '@/components/landing/crystal/CrystalFooter';
import { CrystalNavbar } from '@/components/landing/crystal/CrystalNavbar';
import { easeCrystal, fadeUp, stagger } from '@/components/landing/crystal/motion';
import { cn } from '@/lib/utils';

type InterviewerApiData = {
  id: string;
  fullName: string;
  fullNameAr: string | null;
  currentTitle?: string | null;
  currentTitleAr?: string | null;
  bio: string | null;
  bioAr: string | null;
  photoUrl?: string | null;
  yearsExperience?: number | null;
  experienceBand?: string | null;
  specialties: string[];
  industries: string[];
  languages: string[];
  priceTier: string;
  hourlyRate: number;
  rating: number;
  totalInterviews: number;
  initials?: string;
  isOnline?: boolean;
  responseTime?: string | null;
};

const INDUSTRY_OPTS = [
  'TECH',
  'FINTECH',
  'FINANCE',
  'HEALTHCARE',
  'RETAIL',
  'TELECOM',
  'MANUFACTURING',
] as const;

const SPECIALTY_OPTS = [
  'SOFTWARE_ENGINEER',
  'PROJECT_MANAGER',
  'HR_MANAGER',
  'DATA_ANALYST',
  'MARKETING_SPECIALIST',
  'SALES_MANAGER',
  'OPERATIONS_MANAGER',
  'ACCOUNTANT',
  'CUSTOMER_SERVICE',
  'GRAPHIC_DESIGNER',
] as const;

const PRICE_TIERS = [
  {
    id: 'STANDARD',
    price: '$29',
    ring: 'border-teal-300/50',
    wash: 'from-teal-400/20 via-teal-500/5 to-transparent',
    glow: 'shadow-[0_0_40px_-12px_rgba(45,212,191,0.5)]',
  },
  {
    id: 'PREMIUM',
    price: '$39',
    ring: 'border-amber-300/50',
    wash: 'from-amber-300/25 via-amber-400/5 to-transparent',
    glow: 'shadow-[0_0_40px_-12px_rgba(251,191,36,0.45)]',
  },
  {
    id: 'ELITE',
    price: '$59',
    ring: 'border-rose-300/45',
    wash: 'from-rose-400/20 via-orange-400/5 to-transparent',
    glow: 'shadow-[0_0_40px_-12px_rgba(251,113,133,0.45)]',
  },
] as const;

const EXPERIENCE_BANDS = [
  { id: 'JUNIOR', years: '1–4' },
  { id: 'MID', years: '5–9' },
  { id: 'SENIOR', years: '10–14' },
  { id: 'EXPERT', years: '15+' },
] as const;

const HERO_PHOTOS = [
  '/images/interviewers/int-f1.webp',
  '/images/interviewers/int-m1.webp',
  '/images/interviewers/int-f2.webp',
  '/images/interviewers/int-m2.webp',
  '/images/interviewers/fahd.webp',
  '/images/interviewers/int-f3.webp',
] as const;

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

function formatPrice(cents: number) {
  return Math.round(cents / 100);
}

function formatSpecialty(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function tierTone(tier: string) {
  if (tier === 'ELITE') return 'text-rose-100 bg-rose-500/20 border-rose-300/35';
  if (tier === 'PREMIUM') return 'text-amber-50 bg-amber-400/20 border-amber-300/35';
  return 'text-teal-50 bg-teal-500/20 border-teal-300/35';
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
      <div className="aspect-[4/5] animate-pulse bg-white/8" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-full animate-pulse rounded bg-white/8" />
        <div className="h-10 animate-pulse rounded-xl bg-white/8" />
      </div>
    </div>
  );
}

function SelectorLabel({
  children,
  onClear,
  clearLabel,
}: {
  children: ReactNode;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
        {children}
      </h2>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-teal-200/80 transition hover:text-teal-100"
        >
          {clearLabel}
        </button>
      ) : null}
    </div>
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
  const [industry, setIndustry] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [language, setLanguage] = useState('');
  const [price, setPrice] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (industry) params.set('industry', industry);
        if (specialty) params.set('specialty', specialty);
        if (language) params.set('language', language);
        if (price) params.set('price', price);
        if (experience) params.set('experience', experience);
        if (rating) params.set('rating', rating);
        if (sortBy) params.set('sortBy', sortBy);
        if (deferredSearch.trim()) params.set('search', deferredSearch.trim());

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
  }, [industry, specialty, language, price, experience, rating, sortBy, deferredSearch]);

  const hasFilters =
    search.trim().length > 0 ||
    !!industry ||
    !!specialty ||
    !!language ||
    !!price ||
    !!experience ||
    !!rating;

  const resetFilters = useCallback(() => {
    setSearch('');
    setIndustry('');
    setSpecialty('');
    setLanguage('');
    setPrice('');
    setExperience('');
    setRating('');
    setSortBy('rating');
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

  const specialtyLabel = (key: string) => {
    const known = SPECIALTY_OPTS as readonly string[];
    if (known.includes(key)) {
      return t(`specialtyLabels.${key}` as 'specialtyLabels.SOFTWARE_ENGINEER');
    }
    return formatSpecialty(key);
  };

  const activeCount = useMemo(
    () => [industry, specialty, language, price, experience, rating].filter(Boolean).length,
    [industry, specialty, language, price, experience, rating],
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
      <CrystalNavbar locale={locale} />

      <main>
        {/* Hero — brand + living photo mosaic */}
        <section className="relative overflow-hidden pb-10 pt-8 md:pb-14 md:pt-12">
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse 70% 50% at 20% 10%, rgba(45,212,191,0.16), transparent 55%), radial-gradient(ellipse 50% 45% at 90% 30%, rgba(232,201,122,0.12), transparent 50%)',
            }}
          />

          <div className="mq-wrap relative">
            <div className="grid items-end gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <motion.div initial="hidden" animate="show" variants={stagger}>
                <motion.div
                  variants={fadeUp}
                  className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-teal-100/90"
                >
                  <Sparkles size={13} className="text-amber-200" />
                  {t('eyebrow')}
                </motion.div>

                <motion.div variants={fadeUp} className="mb-5">
                  <Link
                    href={localePath('/', locale)}
                    aria-label="Muqabaleh"
                    className="inline-flex"
                  >
                    <BrandLogo size="hero" priority className="mq-logo-glow" />
                  </Link>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="mq-display mb-4 max-w-xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl"
                >
                  {t('title')}
                </motion.h1>
                <motion.p
                  variants={fadeUp}
                  className="mb-8 max-w-lg text-base leading-relaxed text-white/60 md:text-lg"
                >
                  {t('sub')}
                </motion.p>

                <motion.form
                  variants={fadeUp}
                  className="relative flex max-w-xl flex-col gap-3 sm:flex-row"
                  onSubmit={(e) => {
                    e.preventDefault();
                    document
                      .getElementById('experts-gallery')
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
                  className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/45"
                >
                  {[t('trust1'), t('trust2'), t('trust3')].map((item) => (
                    <li key={item} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-300/80" />
                      {item}
                    </li>
                  ))}
                </motion.ul>
              </motion.div>

              {/* Photo mosaic */}
              <div className="relative mx-auto w-full max-w-md lg:max-w-none">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {HERO_PHOTOS.map((src, i) => (
                    <motion.div
                      key={src}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 * i, duration: 0.55, ease: easeCrystal }}
                      className={cn(
                        'relative overflow-hidden rounded-2xl border border-white/15',
                        i === 1 || i === 4 ? 'row-span-2 aspect-[3/4]' : 'aspect-square',
                      )}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 30vw, 180px"
                        priority={i < 3}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
                    </motion.div>
                  ))}
                </div>
                <div
                  className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] blur-2xl"
                  style={{
                    background:
                      'radial-gradient(circle at 40% 40%, rgba(45,212,191,0.22), transparent 55%), radial-gradient(circle at 70% 70%, rgba(232,201,122,0.16), transparent 50%)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Curated selectors */}
        <section className="relative pb-4">
          <div className="mq-wrap space-y-7">
            {/* Price */}
            <div>
              <SelectorLabel
                onClear={price ? () => setPrice('') : undefined}
                clearLabel={t('clearOne')}
              >
                {t('filterPrice')}
              </SelectorLabel>
              <div className="grid gap-3 sm:grid-cols-3">
                {PRICE_TIERS.map((tier) => {
                  const active = price === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setPrice(active ? '' : tier.id)}
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border p-4 text-start transition',
                        active
                          ? cn(tier.ring, tier.glow, 'bg-white/[0.07]')
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]',
                      )}
                    >
                      <div
                        className={cn(
                          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90',
                          tier.wash,
                        )}
                      />
                      <div className="relative flex items-start justify-between gap-2">
                        <div>
                          <div className="text-base font-bold text-white">
                            {t(`tier.${tier.id}` as 'tier.STANDARD')}
                          </div>
                          <div className="mt-1 text-xs leading-relaxed text-white/55">
                            {t(`tierDesc.${tier.id}` as 'tierDesc.STANDARD')}
                          </div>
                        </div>
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition',
                            active
                              ? 'border-white/50 bg-white text-slate-950'
                              : 'border-white/20 text-transparent',
                          )}
                        >
                          <Check size={14} />
                        </span>
                      </div>
                      <div className="relative mt-4 mq-display text-2xl font-bold text-white">
                        {tier.price}
                        <span className="ms-1 text-sm font-medium text-white/45">
                          / {t('perSession')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience */}
            <div>
              <SelectorLabel
                onClear={experience ? () => setExperience('') : undefined}
                clearLabel={t('clearOne')}
              >
                {t('filterExperience')}
              </SelectorLabel>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                {EXPERIENCE_BANDS.map((band) => {
                  const active = experience === band.id;
                  return (
                    <button
                      key={band.id}
                      type="button"
                      onClick={() => setExperience(active ? '' : band.id)}
                      className={cn(
                        'rounded-2xl border px-3 py-4 text-center transition',
                        active
                          ? 'border-teal-300/50 bg-teal-400/15 shadow-[0_0_30px_-10px_rgba(45,212,191,0.55)]'
                          : 'border-white/10 bg-white/[0.03] hover:border-white/20',
                      )}
                    >
                      <div className="mq-display text-2xl font-bold tabular-nums text-white sm:text-3xl">
                        {band.years}
                      </div>
                      <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/45">
                        {t(`experience.${band.id}` as 'experience.MID')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Industry */}
            <div>
              <SelectorLabel
                onClear={industry ? () => setIndustry('') : undefined}
                clearLabel={t('clearOne')}
              >
                {t('filterIndustry')}
              </SelectorLabel>
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTS.map((opt) => {
                  const active = industry === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIndustry(active ? '' : opt)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-semibold transition',
                        active
                          ? 'border-amber-300/50 bg-amber-400/15 text-amber-50 shadow-[0_0_24px_-8px_rgba(251,191,36,0.5)]'
                          : 'border-white/12 bg-white/[0.03] text-white/65 hover:border-white/25 hover:text-white',
                      )}
                    >
                      {sectorLabel(opt)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary row */}
            <div className="flex flex-col gap-4 border-t border-white/10 pt-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                  {t('filterSpecialty')}
                </span>
                {SPECIALTY_OPTS.map((opt) => {
                  const active = specialty === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSpecialty(active ? '' : opt)}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        active
                          ? 'border-teal-300/45 bg-teal-400/15 text-teal-100'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80',
                      )}
                    >
                      {specialtyLabel(opt)}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                  {t('allLanguages')}
                </span>
                {(['AR', 'EN'] as const).map((opt) => {
                  const active = language === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setLanguage(active ? '' : opt)}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        active
                          ? 'border-teal-300/45 bg-teal-400/15 text-teal-100'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80',
                      )}
                    >
                      {opt === 'AR' ? t('dialectMSA') : t('dialectEnglish')}
                    </button>
                  );
                })}

                <span className="ms-2 me-1 text-[11px] font-bold uppercase tracking-wide text-white/35">
                  {t('allRatings')}
                </span>
                {(['4.5', '4.0', '3.5'] as const).map((opt) => {
                  const active = rating === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setRating(active ? '' : opt)}
                      className={cn(
                        'rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        active
                          ? 'border-amber-300/45 bg-amber-400/15 text-amber-50'
                          : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/80',
                      )}
                    >
                      {opt === '4.5'
                        ? t('rating4Plus')
                        : opt === '4.0'
                          ? t('rating4')
                          : t('rating3')}
                    </button>
                  );
                })}

                <div className="ms-auto flex items-center gap-3">
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45 transition hover:text-teal-300"
                    >
                      <X size={13} />
                      {t('clearFilters')}
                      {activeCount > 0 ? (
                        <span className="rounded-full bg-teal-400/15 px-1.5 py-0.5 text-[10px] text-teal-100">
                          {activeCount}
                        </span>
                      ) : null}
                    </button>
                  ) : null}
                  <label className="flex items-center gap-2 text-xs text-white/45">
                    <span className="hidden sm:inline">{t('sortLabel')}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-xl border border-white/15 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white outline-none"
                    >
                      <option value="rating">{t('sort.rating')}</option>
                      <option value="price_low">{t('sort.priceLow')}</option>
                      <option value="price_high">{t('sort.priceHigh')}</option>
                      <option value="experience">{t('sort.experience')}</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Photo gallery */}
        <section id="experts-gallery" className="mq-section scroll-mt-28 !pt-6 md:!pt-8">
          <div className="mq-wrap">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="mq-display text-2xl font-bold text-white sm:text-3xl">
                  {t('galleryTitle')}
                </h2>
                <p className="mt-1 text-sm text-white/50">
                  <span className="font-semibold text-teal-300">
                    {loading ? '—' : interviewers.length}
                  </span>{' '}
                  {t('results')}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

            {!loading && !error && interviewers.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {interviewers.map((person, index) => {
                    const name =
                      (isAr ? person.fullNameAr : person.fullName) || person.fullName;
                    const title =
                      (isAr ? person.currentTitleAr : person.currentTitle) ||
                      person.currentTitle ||
                      '';
                    const bio = (isAr ? person.bioAr : person.bio) || '';
                    const priceDollars = formatPrice(person.hourlyRate);

                    return (
                      <motion.article
                        key={person.id}
                        layout
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{
                          duration: 0.35,
                          delay: Math.min(index * 0.04, 0.2),
                          ease: easeCrystal,
                        }}
                        whileHover={{ y: -6 }}
                        className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-white/12 bg-slate-950/45 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/6]">
                          {person.photoUrl ? (
                            <Image
                              src={person.photoUrl}
                              alt={name}
                              fill
                              className="object-cover transition duration-700 group-hover:scale-[1.04]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-teal-500/30 to-slate-900 text-5xl font-bold text-white/80">
                              {person.initials || name.slice(0, 1)}
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />

                          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
                            <span
                              className={cn(
                                'rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md',
                                tierTone(person.priceTier),
                              )}
                            >
                              {t(`tier.${person.priceTier}` as 'tier.STANDARD')}
                            </span>
                            {person.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/30 bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 backdrop-blur-md">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                                {t('online')}
                              </span>
                            ) : null}
                          </div>

                          <div className="absolute inset-x-0 bottom-0 p-5">
                            <div className="mb-2 flex items-center gap-2 text-sm text-amber-100">
                              <Star size={15} className="fill-amber-300 text-amber-300" />
                              <span className="font-bold tabular-nums">
                                {person.rating.toFixed(1)}
                              </span>
                              <span className="text-white/40">·</span>
                              <span className="text-white/60">
                                {person.totalInterviews}{' '}
                                {person.totalInterviews === 1
                                  ? t('sessions')
                                  : t('sessionsPlural')}
                              </span>
                            </div>
                            <h3 className="mq-display text-2xl font-bold leading-tight text-white">
                              {name}
                            </h3>
                            {title ? (
                              <p className="mt-1 line-clamp-2 text-sm text-white/70">{title}</p>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 p-5">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/55">
                            {person.yearsExperience != null ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Briefcase size={13} className="text-teal-200/80" />
                                {t('yearsLabel', { years: person.yearsExperience })}
                              </span>
                            ) : null}
                            {person.responseTime ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Clock size={13} className="text-amber-200/80" />
                                {person.responseTime}
                              </span>
                            ) : null}
                            {person.languages[0] ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Globe2 size={13} className="text-cyan-200/80" />
                                {person.languages
                                  .slice(0, 2)
                                  .map((lang) =>
                                    lang === 'AR'
                                      ? t('dialectMSA')
                                      : lang === 'EN'
                                        ? t('dialectEnglish')
                                        : lang,
                                  )
                                  .join(' · ')}
                              </span>
                            ) : null}
                          </div>

                          {bio ? (
                            <p className="line-clamp-2 text-sm leading-relaxed text-white/55">
                              {bio}
                            </p>
                          ) : null}

                          <div className="flex flex-wrap gap-1.5">
                            {person.industries.slice(0, 2).map((ind) => (
                              <span
                                key={ind}
                                className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-50/90"
                              >
                                {sectorLabel(ind)}
                              </span>
                            ))}
                            {person.specialties.slice(0, 2).map((spec) => (
                              <span
                                key={spec}
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-white/65"
                              >
                                {specialtyLabel(spec)}
                              </span>
                            ))}
                          </div>

                          <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-4">
                            <div>
                              <div className="text-[11px] uppercase tracking-wider text-white/40">
                                {t('from')}
                              </div>
                              <div className="mq-display text-xl font-bold text-teal-300">
                                ${priceDollars}
                                <span className="ms-1 text-sm font-medium text-white/40">
                                  / {t('perSession')}
                                </span>
                              </div>
                            </div>
                            <Link
                              href={localePath(`/interviewer/${person.id}`, locale)}
                              className="mq-btn mq-btn-primary inline-flex min-h-[42px] items-center gap-1.5 px-4 text-sm font-bold"
                            >
                              {t('viewProfile')}
                              <Arrow size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : null}

            {!loading && !error && interviewers.length === 0 ? (
              <div className="mq-panel mq-facet mq-facet-cyan mx-auto max-w-lg p-8 text-center">
                <h3 className="mq-display mb-2 text-xl font-bold text-white">{t('emptyTitle')}</h3>
                <p className="mb-6 text-sm text-white/60">{t('emptySub')}</p>
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
