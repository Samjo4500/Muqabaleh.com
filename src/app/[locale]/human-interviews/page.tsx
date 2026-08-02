'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Star, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewerCard {
  id: string;
  name: string;
  initials: string;
  rating: number;
  reviewCount: number;
  title: string;
  specialty: string;
  region: string;
  price: number;
}

interface FetchResponse {
  interviewers: InterviewerCard[];
  total: number;
  hasMore: boolean;
}

/* ------------------------------------------------------------------ */
/*  Filter Constants                                                   */
/* ------------------------------------------------------------------ */

const ROLES = [
  'roleSales', 'roleTech', 'roleMarketing', 'roleHR',
  'roleFinance', 'roleOperations', 'roleDesign', 'roleCS',
  'rolePM', 'roleData',
] as const;

const EXPERIENCE = ['expJunior', 'expMid', 'expSenior', 'expExecutive'] as const;
const LANGUAGES = ['langArabic', 'langEnglish', 'langBilingual'] as const;
const PRICES = [29, 49, 99] as const;
const RATINGS = [4.0, 4.5] as const;

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Skeleton Card                                                      */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] p-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-[120px] w-[120px] rounded-full" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-7 w-24" />
        <Skeleton className="mt-3 h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter Sidebar Content (shared between desktop & mobile sheet)     */
/* ------------------------------------------------------------------ */

function FilterSidebarContent({
  t,
  roles,
  setRoles,
  experience,
  setExperience,
  languages,
  setLanguages,
  prices,
  setPrices,
  ratings,
  setRatings,
  onClear,
}: {
  t: ReturnType<typeof useTranslations>;
  roles: string[];
  setRoles: (v: string[]) => void;
  experience: string;
  setExperience: (v: string) => void;
  languages: string[];
  setLanguages: (v: string[]) => void;
  prices: number[];
  setPrices: (v: number[]) => void;
  ratings: number[];
  setRatings: (v: number[]) => void;
  onClear: () => void;
}) {
  const toggleRole = (role: string) => {
    setRoles(roles.includes(role) ? roles.filter((r) => r !== role) : [...roles, role]);
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(languages.includes(lang) ? languages.filter((l) => l !== lang) : [...languages, lang]);
  };

  const togglePrice = (price: number) => {
    setPrices(prices.includes(price) ? prices.filter((p) => p !== price) : [...prices, price]);
  };

  const toggleRating = (rating: number) => {
    setRatings(ratings.includes(rating) ? ratings.filter((r) => r !== rating) : [...ratings, rating]);
  };

  const hasActiveFilters =
    roles.length > 0 ||
    experience !== '' ||
    languages.length > 0 ||
    prices.length > 0 ||
    ratings.length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[var(--gold)] font-bold">{t('filtersTitle')}</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--gold)]"
          >
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Role Filter — Checkboxes */}
      <FilterGroup label={t('filterRole')}>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => {
            const key = role as string;
            const active = roles.includes(key);
            return (
              <label
                key={role}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <Checkbox
                  checked={active}
                  onCheckedChange={() => toggleRole(key)}
                  className="data-[state=checked]:border-[var(--gold)] data-[state=checked]:bg-[var(--gold)] data-[state=checked]:text-[var(--bg-void)]"
                />
                <span className={active ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}>
                  {t(role as Parameters<typeof t>[0])}
                </span>
              </label>
            );
          })}
        </div>
      </FilterGroup>

      {/* Experience — Radio-like pills */}
      <FilterGroup label={t('filterExperience')}>
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE.map((exp) => {
            const key = exp as string;
            const active = experience === key;
            return (
              <button
                key={exp}
                onClick={() => setExperience(experience === key ? '' : key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                    : 'border-white/10 text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--text-primary)]'
                }`}
              >
                {t(exp as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Language — Toggle pills */}
      <FilterGroup label={t('filterLanguage')}>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => {
            const key = lang as string;
            const active = languages.includes(key);
            return (
              <button
                key={lang}
                onClick={() => toggleLanguage(key)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                    : 'border-white/10 text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--text-primary)]'
                }`}
              >
                {t(lang as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* Price — Checkboxes */}
      <FilterGroup label={t('filterPrice')}>
        <div className="flex flex-col gap-2">
          {PRICES.map((price) => {
            const active = prices.includes(price);
            const tKey = `price${price}` as Parameters<typeof t>[0];
            return (
              <label
                key={price}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-white/5"
              >
                <Checkbox
                  checked={active}
                  onCheckedChange={() => togglePrice(price)}
                  className="data-[state=checked]:border-[var(--gold)] data-[state=checked]:bg-[var(--gold)] data-[state=checked]:text-[var(--bg-void)]"
                />
                <span className={active ? 'text-[var(--gold)]' : 'text-[var(--text-muted)]'}>
                  {t(tKey)}
                </span>
              </label>
            );
          })}
        </div>
      </FilterGroup>

      {/* Rating — Pills */}
      <FilterGroup label={t('filterRating')}>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map((rating) => {
            const active = ratings.includes(rating);
            const tKey = rating === 4.0 ? 'rating4' : 'rating45';
            return (
              <button
                key={rating}
                onClick={() => toggleRating(rating)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]'
                    : 'border-white/10 text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--text-primary)]'
                }`}
              >
                <Star size={14} className="fill-current" />
                {t(tKey as Parameters<typeof t>[0])}
              </button>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-faint)]">
        {label}
      </p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interviewer Card                                                    */
/* ------------------------------------------------------------------ */

function InterviewerCardComponent({
  data,
  t,
  locale,
  index,
}: {
  data: InterviewerCard;
  t: ReturnType<typeof useTranslations>;
  locale: string;
  index: number;
}) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        href={`/interviewer/${data.id}`}
        className="group block rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#d4af37]"
      >
        {/* Avatar */}
        <div className="mx-auto flex justify-center">
          <div className="flex h-[120px] w-[120px] items-center justify-center rounded-full border-2 border-[#d4af37] bg-[var(--bg-void)]">
            <span className="text-3xl font-bold text-[var(--gold)]">{data.initials}</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="mt-4 text-center text-lg font-bold text-white">{data.name}</h3>

        {/* Rating */}
        <div className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-[var(--text-muted)]">
          <Star size={14} className="fill-[var(--gold)] text-[var(--gold)]" />
          <span className="font-semibold text-[var(--text-primary)]">{data.rating}</span>
          <span>({data.reviewCount} {t('reviews')})</span>
        </div>

        {/* Title / Role */}
        <p className="mt-1 text-center text-sm text-gray-400">{data.title}</p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge className="border-0 bg-[var(--gold)]/10 text-xs text-[var(--gold)]">
            {data.specialty}
          </Badge>
          <Badge className="border-0 bg-[var(--gold)]/10 text-xs text-[var(--gold)]">
            {data.region}
          </Badge>
        </div>

        {/* Price */}
        <p className="mt-4 text-center text-xl font-bold text-[var(--gold)]">
          ${data.price} <span className="text-sm font-normal text-[var(--text-muted)]">/ {t('perSession')}</span>
        </p>

        {/* CTA */}
        <button className="mt-3 w-full rounded-lg border border-[var(--gold)] py-2.5 text-sm font-semibold text-[var(--gold)] transition-all duration-200 hover:bg-[var(--gold)]/10">
          {t('bookNow')}
        </button>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function HumanInterviewsPage() {
  const t = useTranslations('humanInterviews');
  const locale = useLocale();

  /* ── Filter state ── */
  const [roles, setRoles] = useState<string[]>([]);
  const [experience, setExperience] = useState('');
  const [languages, setLanguages] = useState<string[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [ratings, setRatings] = useState<number[]>([]);

  /* ── Data state ── */
  const [interviewers, setInterviewers] = useState<InterviewerCard[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /* ── Mobile sheet ── */
  const [sheetOpen, setSheetOpen] = useState(false);

  /* ── Refs ── */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(1);

  /* ── Clear all ── */
  const clearAll = useCallback(() => {
    setRoles([]);
    setExperience('');
    setLanguages([]);
    setPrices([]);
    setRatings([]);
  }, []);

  /* ── Build query params ── */
  const buildParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (roles.length > 0) params.set('roles', roles.join(','));
      if (experience) params.set('experience', experience);
      if (languages.length > 0) params.set('languages', languages.join(','));
      if (prices.length > 0) params.set('prices', prices.join(','));
      if (ratings.length > 0) params.set('minRating', String(Math.min(...ratings)));
      return params.toString();
    },
    [roles, experience, languages, prices, ratings],
  );

  /* ── Fetch interviewers ── */
  const fetchInterviewers = useCallback(
    async (page: number, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      try {
        const qs = buildParams(page);
        const res = await fetch(`/api/interviewers?${qs}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data: FetchResponse = await res.json();
        if (append) {
          setInterviewers((prev) => [...prev, ...data.interviewers]);
        } else {
          setInterviewers(data.interviewers);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
        pageRef.current = page;
      } catch {
        // silently fail — shows empty state
        if (!append) {
          setInterviewers([]);
          setTotal(0);
          setHasMore(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildParams],
  );

  /* ── Debounced re-fetch on filter change ── */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchInterviewers(1);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchInterviewers]);

  /* ── Load more ── */
  const handleLoadMore = () => {
    fetchInterviewers(pageRef.current + 1, true);
  };

  /* ── Active filter count for mobile badge ── */
  const activeFilterCount =
    roles.length +
    (experience ? 1 : 0) +
    languages.length +
    prices.length +
    ratings.length;

  /* ── Filter sidebar props ── */
  const filterProps = {
    t,
    roles,
    setRoles,
    experience,
    setExperience,
    languages,
    setLanguages,
    prices,
    setPrices,
    ratings,
    setRatings,
    onClear: clearAll,
  };

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-void)]">
      <Navbar />

      <main className="flex-1 pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* ── Mobile Filter Button ── */}
          <div className="mb-6 flex items-center justify-between md:hidden">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">{t('browseTitle')}</h1>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="relative gap-2 border-white/10 text-[var(--text-muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                >
                  <SlidersHorizontal size={16} />
                  {t('mobileFilterBtn')}
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)] text-xs font-bold text-[var(--bg-void)]">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side={locale === 'ar' ? 'right' : 'left'}
                className="w-80 overflow-y-auto border-white/10 bg-[var(--bg-panel)]"
              >
                <SheetHeader>
                  <SheetTitle className="text-[var(--gold)]">{t('filtersTitle')}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 px-1">
                  <FilterSidebarContent {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* ── Layout: Sidebar + Grid ── */}
          <div className="flex flex-col gap-6 md:flex-row">
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden w-72 flex-shrink-0 md:block">
              <div className="sticky top-24 rounded-xl border border-[rgba(212,175,55,0.1)] bg-[#0B0F17]/50 p-5">
                <FilterSidebarContent {...filterProps} />
              </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="min-w-0 flex-1">
              {/* Header row — hidden on mobile (shown above) */}
              <div className="mb-6 hidden items-center justify-between md:flex">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{t('browseTitle')}</h1>
                {!loading && (
                  <span className="text-sm text-[var(--text-muted)]">
                    {t('resultCount', { count: total })}
                  </span>
                )}
              </div>

              {/* Mobile result count */}
              {!loading && (
                <p className="mb-4 text-sm text-[var(--text-muted)] md:hidden">
                  {t('resultCount', { count: total })}
                </p>
              )}

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && interviewers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 rounded-2xl bg-white/5 p-5">
                    <SlidersHorizontal size={40} strokeWidth={1.75} className="text-[var(--text-faint)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('noResults')}</h3>
                  <button
                    onClick={clearAll}
                    className="btn-ghost mt-6 text-sm"
                  >
                    {t('clearFilters')}
                  </button>
                </div>
              )}

              {/* Cards Grid */}
              {!loading && interviewers.length > 0 && (
                <>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <AnimatePresence mode="popLayout">
                      {interviewers.map((interviewer, i) => (
                        <InterviewerCardComponent
                          key={interviewer.id}
                          data={interviewer}
                          t={t}
                          locale={locale}
                          index={i}
                        />
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="mt-10 flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="btn-ghost flex items-center gap-2 text-sm disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
                        ) : null}
                        {t('loadMore')}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
