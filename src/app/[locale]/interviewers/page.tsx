'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Search, Star, Users, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GlowCard, SectionHeading, SkeletonBlock } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewerApiData {
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
  videoIntroUrl: string | null;
  initials?: string;
  avatar?: string | null;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SECTOR_KEYS = ['TECH', 'FINANCE', 'HR', 'MARKETING', 'SALES', 'ENGINEERING', 'HEALTHCARE', 'RETAIL', 'MANUFACTURING', 'TELECOM', 'FINTECH'] as const;
const LANGUAGE_OPTIONS = [
  { value: 'AR', labelKey: 'dialectMSA' },
  { value: 'EN', labelKey: 'dialectEnglish' },
] as const;

const TIER_RANGES: Record<string, [number, number]> = {
  STANDARD: [0, 3500],
  PREMIUM: [3500, 5000],
  ELITE: [5000, 99999],
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatPrice(cents: number): number {
  return Math.round(cents / 100);
}

function formatSpecialty(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Card Skeleton                                                      */
/* ------------------------------------------------------------------ */

function CardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/5 bg-[#0B0F17] p-5">
      <div className="flex items-start gap-4">
        <SkeletonBlock className="h-14 w-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-5 w-32 rounded" />
          <SkeletonBlock className="h-4 w-48 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <SkeletonBlock className="h-6 w-16 rounded-full" />
        <SkeletonBlock className="h-6 w-20 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-24 rounded" />
      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
        <SkeletonBlock className="h-6 w-16 rounded" />
        <SkeletonBlock className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InterviewersPage() {
  const t = useTranslations('interviewers');
  const tHI = useTranslations('humanInterviews');
  const locale = useLocale();

  const [interviewers, setInterviewers] = useState<InterviewerApiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [language, setLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  /* ── Fetch from API ── */
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        params.set('limit', '50');
        if (sector !== 'all') params.set('role', sector);
        if (language !== 'all') params.set('language', language);
        if (priceRange !== 'all') params.set('price', priceRange);
        if (ratingFilter !== 'all') params.set('rating', ratingFilter);

        const res = await fetch(`/api/interviewers?${params.toString()}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (!cancelled) {
          setInterviewers(data.interviewers || []);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load interviewers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [sector, language, priceRange, ratingFilter]);

  /* ── Client-side search (on top of API results) ── */
  const filtered = useMemo(() => {
    if (!search.trim()) return interviewers;
    const q = search.toLowerCase();
    return interviewers.filter((i) => {
      const name = (locale === 'ar' ? i.fullNameAr : i.fullName) || '';
      const bio = (locale === 'ar' ? i.bioAr : i.bio) || '';
      return name.toLowerCase().includes(q) || bio.toLowerCase().includes(q);
    });
  }, [interviewers, search, locale]);

  /* ── Reset all filters ── */
  const resetFilters = useCallback(() => {
    setSearch('');
    setSector('all');
    setLanguage('all');
    setPriceRange('all');
    setRatingFilter('all');
  }, []);

  /* ── Render ── */
  return (
    <div className="flex min-h-screen flex-col bg-void">
      <Navbar />
      <main className="flex-1 pt-16">
        {/* ── Header ── */}
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow={t('eyebrow')} title={t('title')} sub={t('sub')} />
          </div>
        </section>

        {/* ── Filters ── */}
        <section className="border-t border-white/5 pb-4">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 py-6">
              {/* Search */}
              <div className="relative min-w-0 flex-1 sm:max-w-xs">
                <Search size={16} strokeWidth={1.75} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="glass-input h-9 border-0 ps-9 pe-3"
                />
              </div>

              {/* Sector / Industry */}
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[140px] border-0">
                  <SelectValue placeholder={t('allSectors')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('allSectors')}</SelectItem>
                  {SECTOR_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Language */}
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[140px] border-0">
                  <SelectValue placeholder={t('allLanguages')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('allLanguages')}</SelectItem>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey as 'dialectMSA')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Tier */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[140px] border-0">
                  <SelectValue placeholder={t('anyPrice')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('anyPrice')}</SelectItem>
                  <SelectItem value="STANDARD">{tHI('price29')}</SelectItem>
                  <SelectItem value="PREMIUM">{tHI('price49')}</SelectItem>
                  <SelectItem value="ELITE">{tHI('price99')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Rating */}
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[120px] border-0">
                  <SelectValue placeholder={t('allRatings')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('allRatings')}</SelectItem>
                  <SelectItem value="4.5">{t('rating4Plus')}</SelectItem>
                  <SelectItem value="4.0">{t('rating4')}</SelectItem>
                  <SelectItem value="3.5">{t('rating3')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}
              {(search || sector !== 'all' || language !== 'all' || priceRange !== 'all' || ratingFilter !== 'all') && (
                <button onClick={resetFilters} className="text-sm text-[var(--gold)] hover:underline">
                  {t('emptyCta')}
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── Grid / Empty / Loading ── */}
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Loading */}
            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-2xl bg-red-500/10 p-4">
                  <Users size={40} strokeWidth={1.75} className="text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  {t('emptyTitle')}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">{error}</p>
                <button onClick={() => window.location.reload()} className="btn-ghost mt-6 text-sm">
                  {t('emptyCta')}
                </button>
              </div>
            )}

            {/* Results */}
            {!loading && !error && filtered.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <InterviewerCard
                    key={item.id}
                    data={item}
                    locale={locale}
                    t={t}
                    tHI={tHI}
                  />
                ))}
              </div>
            )}

            {/* Empty (no results after filtering) */}
            {!loading && !error && filtered.length === 0 && interviewers.length > 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-2xl bg-white/5 p-4">
                  <Users size={40} strokeWidth={1.75} className="text-[var(--text-faint)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">{t('emptyTitle')}</h3>
                <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">{t('emptySub')}</p>
                <button onClick={resetFilters} className="btn-ghost mt-6 text-sm">
                  {t('emptyCta')}
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Interviewer Card                                                    */
/* ------------------------------------------------------------------ */

function InterviewerCard({ data, locale, t, tHI }: {
  data: InterviewerApiData;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  tHI: ReturnType<typeof useTranslations>;
}) {
  const name = (locale === 'ar' ? data.fullNameAr : data.fullName) || data.fullName;
  const bio = (locale === 'ar' ? data.bioAr : data.bio) || '';
  const initials = data.initials || getInitials(data.fullName);
  const price = formatPrice(data.hourlyRate);
  const specialties = data.specialties.map(formatSpecialty);
  const langLabels = data.languages.map((l) => {
    if (l === 'AR') return t('dialectMSA');
    if (l === 'EN') return t('dialectEnglish');
    return l;
  });

  // Truncate bio for card
  const shortBio = bio.length > 80 ? bio.slice(0, 80) + '...' : bio;

  return (
    <GlowCard className="flex flex-col gap-4 p-5">
      {/* Avatar + Info */}
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--gold)] text-sm font-bold text-[var(--bg-void)]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-[var(--text-primary)]">{name}</h3>
          <p className="mt-0.5 line-clamp-2 text-sm text-[var(--text-muted)]">{shortBio}</p>
        </div>
      </div>

      {/* Specialty tags */}
      <div className="flex flex-wrap gap-2">
        {specialties.slice(0, 3).map((s) => (
          <Badge key={s} variant="outline" className="border-white/10 text-xs text-[var(--text-muted)]">
            {s}
          </Badge>
        ))}
      </div>

      {/* Rating + Sessions + Languages */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Star size={16} strokeWidth={1.75} className="fill-[var(--gold)] text-[var(--gold)]" />
          <span className="font-semibold text-[var(--text-primary)]">{data.rating.toFixed(1)}</span>
        </div>
        <span className="text-[var(--text-faint)]">
          {data.totalInterviews} {data.totalInterviews > 10 ? t('sessionsPlural') : t('sessions')}
        </span>
        <span className="text-[var(--text-faint)]">·</span>
        <span className="text-[var(--text-faint)]">{langLabels.join(' / ')}</span>
      </div>

      {/* Price + CTA */}
      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
        <div className="text-sm text-[var(--text-muted)]">
          {t('from')}{' '}
          <span className="text-lg font-bold text-[var(--gold)]">${price}</span>
          <span className="text-xs text-[var(--text-faint)]">/ {tHI('perSession')}</span>
        </div>
        <Link
          href={`/${locale}/interviewer/${data.id}`}
          className="btn-ghost px-4 py-2 text-sm"
        >
          {t('viewProfile')}
        </Link>
      </div>
    </GlowCard>
  );
}
