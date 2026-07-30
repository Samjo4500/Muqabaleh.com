'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Search, Star, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GlowCard, SectionHeading, EmptyState } from '@/components/brand';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface InterviewerData {
  slug: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  rating: number;
  sessionCount: number;
  price: number;
  sectorsAr: string[];
  sectorsEn: string[];
  sectorKeys: string[];
  gender: 'male' | 'female';
  languageKeys: string[];
  avatarColor: string;
  initials: string;
}

/* ------------------------------------------------------------------ */
/*  Seed Data                                                          */
/* ------------------------------------------------------------------ */

const INTERVIEWERS: InterviewerData[] = [
  {
    slug: 'huda-al-salem',
    nameAr: 'د. هدى السالم',
    nameEn: 'Dr. Huda Al-Salem',
    titleAr: 'مديرة موارد بشرية سابقة في الاتصالات',
    titleEn: 'Former HR Director at STC',
    rating: 4.9, sessionCount: 48, price: 49,
    sectorsAr: ['HR', 'اتصالات'], sectorsEn: ['HR', 'Telecom'],
    sectorKeys: ['HR'], gender: 'female', languageKeys: ['dialectMSA', 'dialectGulf'],
    avatarColor: 'bg-[var(--gold)]', initials: 'هدى',
  },
  {
    slug: 'yasser-al-ghamdi',
    nameAr: 'م. ياسر الغامدي',
    nameEn: 'Eng. Yasser Al-Ghamdi',
    titleAr: 'مهندس برمجيات أول سابق في أرامكو',
    titleEn: 'Former Senior Software Engineer at Aramco',
    rating: 4.8, sessionCount: 35, price: 55,
    sectorsAr: ['تقنية المعلومات', 'هندسة'], sectorsEn: ['IT', 'Engineering'],
    sectorKeys: ['IT', 'Engineering'], gender: 'male', languageKeys: ['dialectMSA', 'dialectEnglish'],
    avatarColor: 'bg-emerald', initials: 'يغ',
  },
  {
    slug: 'rana-al-otaibi',
    nameAr: 'أ. رنا العتيبي',
    nameEn: 'Rana Al-Otaibi',
    titleAr: 'خبيرة تسويق رقمي',
    titleEn: 'Digital Marketing Expert',
    rating: 4.9, sessionCount: 27, price: 49,
    sectorsAr: ['تسويق', 'مبيعات'], sectorsEn: ['Marketing', 'Sales'],
    sectorKeys: ['Marketing', 'Sales'], gender: 'female', languageKeys: ['dialectMSA', 'dialectGulf'],
    avatarColor: 'bg-cyan', initials: 'رع',
  },
  {
    slug: 'sultan-al-dosari',
    nameAr: 'م. سلطان الدوسري',
    nameEn: 'Eng. Sultan Al-Dosari',
    titleAr: 'مدير مالي سابق',
    titleEn: 'Former Finance Director',
    rating: 4.8, sessionCount: 12, price: 59,
    sectorsAr: ['مالية', 'محاسبة'], sectorsEn: ['Finance', 'Accounting'],
    sectorKeys: ['Finance'], gender: 'male', languageKeys: ['dialectGulf'],
    avatarColor: 'bg-amber-500', initials: 'سد',
  },
  {
    slug: 'mona-al-qahtani',
    nameAr: 'د. منى القحطاني',
    nameEn: 'Dr. Mona Al-Qahtani',
    titleAr: 'أستاذة طب سابقة',
    titleEn: 'Former Professor of Medicine',
    rating: 4.9, sessionCount: 19, price: 65,
    sectorsAr: ['طب', 'تعليم'], sectorsEn: ['Medicine', 'Education'],
    sectorKeys: ['Medicine', 'Education'], gender: 'female', languageKeys: ['dialectMSA', 'dialectEnglish'],
    avatarColor: 'bg-rose-500', initials: 'مق',
  },
  {
    slug: 'khalid-al-shahri',
    nameAr: 'أ. خالد الشهري',
    nameEn: 'Khalid Al-Shahri',
    titleAr: 'مدير مبيعات سابق',
    titleEn: 'Former Sales Director',
    rating: 4.7, sessionCount: 8, price: 45,
    sectorsAr: ['مبيعات', 'تسويق'], sectorsEn: ['Sales', 'Marketing'],
    sectorKeys: ['Sales', 'Marketing'], gender: 'male', languageKeys: ['dialectGulf', 'dialectEnglish'],
    avatarColor: 'bg-violet-500', initials: 'خش',
  },
];

const SECTOR_KEYS = ['IT', 'Finance', 'HR', 'Marketing', 'Sales', 'Engineering', 'Medicine', 'Education'] as const;
const LANGUAGE_KEYS = ['dialectMSA', 'dialectGulf', 'dialectEnglish', 'dialectFrench'] as const;

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InterviewersPage() {
  const t = useTranslations('interviewers');
  const locale = useLocale();

  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('all');
  const [language, setLanguage] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [rating, setRating] = useState('all');
  const [gender, setGender] = useState('all');

  const resetFilters = () => {
    setSearch('');
    setSector('all');
    setLanguage('all');
    setPriceRange('all');
    setRating('all');
    setGender('all');
  };

  const filtered = useMemo(() => {
    return INTERVIEWERS.filter((i) => {
      const name = locale === 'ar' ? i.nameAr : i.nameEn;
      const title = locale === 'ar' ? i.titleAr : i.titleEn;
      if (search && !name.includes(search) && !title.includes(search)) return false;
      if (sector !== 'all' && !i.sectorKeys.includes(sector)) return false;
      if (language !== 'all' && !i.languageKeys.includes(language)) return false;
      if (priceRange === '0-49' && i.price > 49) return false;
      if (priceRange === '50-59' && (i.price < 50 || i.price > 59)) return false;
      if (priceRange === '60+' && i.price < 60) return false;
      if (rating === '4.5' && i.rating < 4.5) return false;
      if (rating === '4.0' && i.rating < 4.0) return false;
      if (rating === '3.5' && i.rating < 3.5) return false;
      if (gender !== 'all' && i.gender !== gender) return false;
      return true;
    });
  }, [search, sector, language, priceRange, rating, gender, locale]);

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

              {/* Sector */}
              <Select value={sector} onValueChange={setSector}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[140px] border-0">
                  <SelectValue placeholder={t('allSectors')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('allSectors')}</SelectItem>
                  {SECTOR_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>{t(`sector${key}` as 'sectorIT')}</SelectItem>
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
                  {LANGUAGE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>{t(key as 'dialectMSA')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Range */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[120px] border-0">
                  <SelectValue placeholder={t('anyPrice')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('anyPrice')}</SelectItem>
                  <SelectItem value="0-49">$0 — $49</SelectItem>
                  <SelectItem value="50-59">$50 — $59</SelectItem>
                  <SelectItem value="60+">$60+</SelectItem>
                </SelectContent>
              </Select>

              {/* Rating */}
              <Select value={rating} onValueChange={setRating}>
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

              {/* Gender */}
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="glass-input h-9 w-auto min-w-[110px] border-0">
                  <SelectValue placeholder={t('allGenders')} />
                </SelectTrigger>
                <SelectContent className="bg-[var(--bg-panel)] border-white/10">
                  <SelectItem value="all">{t('allGenders')}</SelectItem>
                  <SelectItem value="male">{t('genderMale')}</SelectItem>
                  <SelectItem value="female">{t('genderFemale')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* ── Grid / Empty ── */}
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {filtered.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <InterviewerCard key={item.slug} data={item} locale={locale} t={t} />
                ))}
              </div>
            ) : (
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

function InterviewerCard({ data, locale, t }: {
  data: InterviewerData;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const name = locale === 'ar' ? data.nameAr : data.nameEn;
  const title = locale === 'ar' ? data.titleAr : data.titleEn;
  const sectors = locale === 'ar' ? data.sectorsAr : data.sectorsEn;

  return (
    <GlowCard className="flex flex-col gap-4 p-5">
      {/* Avatar + Info */}
      <div className="flex items-start gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${data.avatarColor} text-sm font-bold text-[var(--bg-void)]`}>
          {data.initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-[var(--text-primary)]">{name}</h3>
          <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">{title}</p>
        </div>
      </div>

      {/* Sector tags */}
      <div className="flex flex-wrap gap-2">
        {sectors.map((s) => (
          <Badge key={s} variant="outline" className="border-white/10 text-xs text-[var(--text-muted)]">
            {s}
          </Badge>
        ))}
      </div>

      {/* Rating + Sessions */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Star size={16} strokeWidth={1.75} className="fill-[var(--gold)] text-[var(--gold)]" />
          <span className="font-semibold text-[var(--text-primary)]">{data.rating}</span>
        </div>
        <span className="text-[var(--text-faint)]">
          {data.sessionCount} {data.sessionCount > 10 ? t('sessionsPlural') : t('sessions')}
        </span>
      </div>

      {/* Price + CTA */}
      <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
        <div className="text-sm text-[var(--text-muted)]">
          {t('from')}{' '}
          <span className="text-lg font-bold text-[var(--gold)]">${data.price}</span>
        </div>
        <Link href={`/interviewers/${data.slug}`} className="btn-ghost px-4 py-2 text-sm">
          {t('viewProfile')}
        </Link>
      </div>
    </GlowCard>
  );
}
