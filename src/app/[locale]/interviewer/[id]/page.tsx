'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Star, Play, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useSession } from 'next-auth/react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Review {
  initials: string;
  name: string;
  role: string;
  date: string;
  rating: number;
  comment: string;
}

interface Slot {
  time: string;
  available: boolean;
}

interface DaySlots {
  date: string;
  dayLabel: string;
  slots: Slot[];
}

interface InterviewerProfile {
  id: string;
  name: string;
  nameAr: string;
  initials: string;
  photoUrl: string | null;
  title: string;
  titleAr: string;
  location: string;
  flagEmoji: string;
  rating: number;
  reviewCount: number;
  totalInterviews: number;
  price: number;
  pricePerMin: number;
  languages: string[];
  languageLabels: string[];
  specialties: string[];
  industries: string[];
  bio: string;
  bioAr: string;
  videoUrl: string | null;
  videoPoster: string | null;
  isOnline: boolean;
  timezone: string;
  reviews: Review[];
  availability: DaySlots[];
}

/* ------------------------------------------------------------------ */
/*  Animation Variants                                                 */
/* ------------------------------------------------------------------ */

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Time slot generation                                               */
/* ------------------------------------------------------------------ */

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 17; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}

const ALL_TIME_SLOTS = generateTimeSlots();

const DAY_NAMES_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

function formatSpecialty(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatLanguage(code: string): string {
  if (code === 'AR') return 'العربية';
  if (code === 'EN') return 'English';
  return code;
}

/* ------------------------------------------------------------------ */
/*  Map API response to profile format                                  */
/* ------------------------------------------------------------------ */

function mapApiToProfile(apiData: Record<string, unknown>, locale: string): InterviewerProfile {
  const fullName = (apiData.fullName as string) || '';
  const fullNameAr = (apiData.fullNameAr as string) || fullName;
  const bio = (apiData.bio as string) || '';
  const bioAr = (apiData.bioAr as string) || bio;
  const reviews = (apiData.reviews as Record<string, unknown>[]) || [];
  const rawAvailability = (apiData.availability as Record<string, unknown>[]) || [];

  // Build availability calendar for the current week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday

  const availability: DaySlots[] = [];

  // If API returned availability data, use it to build the weekly calendar
  const availabilityByDay = new Map<number, string[]>();
  for (const a of rawAvailability) {
    const dow = a.weekday as number;
    const startTime = a.startTime as string;
    if (a.isAvailable && startTime) {
      if (!availabilityByDay.has(dow)) availabilityByDay.set(dow, []);
      availabilityByDay.get(dow)!.push(startTime);
    }
  }

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay();
    const dayName = locale === 'ar' ? DAY_NAMES_AR[dow] : DAY_NAMES_EN[dow];
    const availableTimes = availabilityByDay.get(dow) || [];

    const slots: Slot[] = ALL_TIME_SLOTS.map((time) => {
      const isAvailable = availableTimes.some((t) => time.startsWith(t.split(':')[0]));
      return { time, available: isAvailable };
    });

    availability.push({ date: dateStr, dayLabel: dayName, slots });
  }

  const mappedReviews: Review[] = reviews.map((r) => ({
    initials: (r.candidateName as string || 'AN').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
    name: (r.candidateName as string) || 'Anonymous',
    role: '',
    date: r.date
      ? new Date(r.date as string).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : '',
    rating: r.rating as number,
    comment: locale === 'ar' ? ((r.commentAr as string) || (r.comment as string) || '') : ((r.comment as string) || ''),
  }));

  const languages = (apiData.languages as string[]) || ['AR'];
  const specialties = (apiData.specialties as string[]) || [];

  return {
    id: apiData.id as string,
    name: locale === 'ar' ? fullNameAr : fullName,
    nameAr: fullNameAr,
    initials: (apiData.initials as string) || getInitials(fullName),
    photoUrl:
      (apiData.photoUrl as string | null) ||
      (apiData.avatar as string | null) ||
      null,
    title: `${formatSpecialty(specialties[0] || '')} · ${apiData.yearsExperience || '?'} yr`,
    titleAr: `${formatSpecialty(specialties[0] || '')} · ${apiData.yearsExperience || '?'} سنة`,
    location: 'Saudi Arabia',
    flagEmoji: '🇸🇦',
    rating: (apiData.rating as number) || 0,
    reviewCount: mappedReviews.length || (apiData.totalInterviews as number) || 0,
    totalInterviews: (apiData.totalInterviews as number) || 0,
    price: Math.round(((apiData.hourlyRate as number) || 2900) / 100),
    pricePerMin: Math.round(((apiData.hourlyRate as number) || 2900) / 60 / 100),
    languages,
    languageLabels: languages.map(formatLanguage),
    specialties: specialties.map(formatSpecialty),
    industries: (apiData.industries as string[]) || [],
    bio: locale === 'ar' ? bioAr : bio,
    bioAr,
    videoUrl: (apiData.videoIntroUrl as string) || null,
    videoPoster:
      (apiData.photoUrl as string | null) ||
      (apiData.avatar as string | null) ||
      null,
    isOnline: true,
    timezone: locale === 'ar' ? 'الرياض (GMT+3)' : 'Riyadh (GMT+3)',
    reviews: mappedReviews,
    availability,
  };
}

/* ------------------------------------------------------------------ */
/*  Loading Skeleton                                                   */
/* ------------------------------------------------------------------ */

function LoadingSkeleton() {
  return (
    <div className="mt-8 mb-16 grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-5">
      <div className="md:col-span-2">
        <div className="rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] p-6 text-center">
          <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
          <Skeleton className="mx-auto mt-4 h-6 w-36" />
          <Skeleton className="mx-auto mt-2 h-4 w-28" />
          <Skeleton className="mx-auto mt-2 h-4 w-20" />
          <Skeleton className="mx-auto mt-3 h-4 w-40" />
          <Skeleton className="mx-auto mt-3 h-5 w-32 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-8 w-24" />
          <Skeleton className="mx-auto mt-3 h-4 w-32" />
          <div className="mt-3 flex justify-center gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-6 h-12 w-full rounded-xl" />
        </div>
      </div>
      <div className="md:col-span-3">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="mt-8">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
        <div className="mt-10">
          <Skeleton className="h-6 w-40" />
          <div className="mt-4 space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
        <div className="mt-10">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-4 h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Star Rating                                                        */
/* ------------------------------------------------------------------ */

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= Math.round(rating)
              ? 'fill-[var(--gold)] text-[var(--gold)]'
              : 'text-gray-600'
          }
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function InterviewerProfilePage() {
  const t = useTranslations('interviewerProfile');
  const tHI = useTranslations('humanInterviews');
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const id = params.id as string;

  /* ── State ── */
  const [profile, setProfile] = useState<InterviewerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  /* ── Fetch profile ── */
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/interviewers/${id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const json = await res.json();
        if (json.interviewer) {
          const mapped = mapApiToProfile(json.interviewer, locale);
          if (!cancelled) setProfile(mapped);
        } else {
          throw new Error('No interviewer data');
        }
      } catch {
        if (!cancelled) setProfile(getMockProfile(id, locale));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, locale]);

  /* ── Derived ── */
  const bioTruncated = profile?.bio
    ? profile.bio.length > 200
      ? bioExpanded
        ? profile.bio
        : profile.bio.slice(0, 200) + '...'
      : profile.bio
    : '';
  const shouldShowReadMore = (profile?.bio?.length ?? 0) > 200;

  /* ── Slot selection handler ── */
  const handleSlotClick = useCallback(
    (time: string, available: boolean) => {
      if (!available) return;
      setSelectedSlot((prev) => (prev === time ? null : time));
    },
    [],
  );

  /* ── Book slot handler ── */
  const handleBookSlot = useCallback(() => {
    if (!selectedSlot || !id) return;

    // If not logged in, redirect to signin with callback
    if (authStatus !== 'authenticated') {
      const currentPath = window.location.pathname;
      router.push(`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
      return;
    }

    // Parse the selectedSlot key: "YYYY-MM-DD-HH:mm"
    const colonIdx = selectedSlot.indexOf(':');
    const dashBeforeColon = selectedSlot.lastIndexOf('-', colonIdx);
    const datePart = selectedSlot.substring(0, dashBeforeColon);
    const timePart = selectedSlot.substring(dashBeforeColon + 1);
    const [startTime] = timePart.split('-');
    const duration = 30;
    const [startH, startM] = startTime.split(':').map(Number);
    const endMinutes = startH * 60 + startM + duration;
    const endH = String(Math.floor(endMinutes / 60)).padStart(2, '0');
    const endM = String(endMinutes % 60).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    const qsParams = new URLSearchParams({
      date: datePart,
      startTime,
      endTime,
      duration: String(duration),
    });
    router.push(`/${locale}/book/${id}?${qsParams.toString()}`);
  }, [selectedSlot, id, locale, router, authStatus]);

  /* ── Render ── */
  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-void)]">
      <Navbar />

      <main className="flex-1 pt-20">
        {loading && <LoadingSkeleton />}

        {!loading && profile && (
          <div className="mx-auto mt-8 mb-16 grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-5">

            <motion.div
              className="md:col-span-2"
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeInUp}
            >
              <div className="sticky top-24 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[#0B0F17] p-6 text-center">
                {/* Avatar */}
                <div className="mx-auto relative h-[200px] w-[200px]">
                  <div className="relative h-full w-full overflow-hidden rounded-full border-[3px] border-[var(--gold)] bg-[#0B0F17]">
                    {profile.photoUrl ? (
                      <Image
                        src={profile.photoUrl}
                        alt={profile.name}
                        fill
                        className="object-cover"
                        sizes="200px"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center [background-image:linear-gradient(135deg,rgba(212,175,55,0.3),rgba(212,175,55,0.05))]">
                        <span className="text-5xl font-bold text-[var(--gold)]">
                          {profile.initials}
                        </span>
                      </div>
                    )}
                  </div>
                  {profile.isOnline && (
                    <span className="absolute bottom-2 right-2 flex h-5 w-5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-5 w-5 rounded-full bg-green-500 ring-2 ring-[#0B0F17]" />
                    </span>
                  )}
                </div>

                {/* Name */}
                <h1 className="mt-4 text-2xl font-bold text-white">{profile.name}</h1>

                {/* Title */}
                <p className="mt-1 text-sm text-gray-400">{profile.title}</p>

                {/* Location */}
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-gray-400">
                  <span>{profile.flagEmoji}</span>
                  <span>{profile.location}</span>
                </p>

                {/* Rating */}
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <Star size={16} className="fill-[var(--gold)] text-[var(--gold)]" />
                  <span className="font-semibold text-white">
                    {profile.rating.toFixed(1)} / 5.0
                  </span>
                  <span className="text-sm text-gray-400">
                    ({profile.reviewCount} {tHI('reviews')})
                  </span>
                </div>

                {/* Certified badge */}
                <div className="mt-3 inline-flex items-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/5 px-3 py-1 text-xs text-[var(--gold)]">
                  {tHI('certified')}
                </div>

                {/* Price */}
                <p className="mt-4 text-2xl font-bold text-[var(--gold)]">
                  ${profile.price}{' '}
                  <span className="text-sm font-normal text-gray-400">
                    / {tHI('perSession')}
                  </span>
                </p>

                {/* Languages */}
                <p className="mt-3 text-sm text-gray-300">
                  {profile.languageLabels.join(' · ')}
                </p>

                {/* Specialties */}
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {profile.specialties.map((spec) => (
                    <Badge
                      key={spec}
                      className="border-0 bg-[var(--gold)]/10 text-[var(--gold)]"
                    >
                      {spec}
                    </Badge>
                  ))}
                </div>

                {/* Book button */}
                <button
                  onClick={handleBookSlot}
                  disabled={!selectedSlot}
                  className={`mt-6 w-full rounded-xl py-3 text-sm font-bold transition-all duration-200 ${
                    selectedSlot
                      ? 'bg-[var(--gold)] text-black hover:bg-[var(--gold)]/90'
                      : 'cursor-not-allowed bg-gray-700 text-gray-500'
                  }`}
                >
                  {t('bookSlot')}
                </button>
              </div>
            </motion.div>

            <div className="md:col-span-3">
              {/* Video Section */}
              <motion.div
                initial="hidden"
                animate="visible"
                custom={1}
                variants={fadeInUp}
              >
                <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0B0F17]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F17] to-[#1a1f2e]">
                    <div className="absolute inset-0 opacity-5" style={{
                      backgroundImage: 'radial-gradient(circle at 25% 25%, var(--gold) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }} />
                  </div>
                  {profile.videoUrl ? (
                    <video
                      src={profile.videoUrl}
                      controls
                      className="relative z-10 h-full w-full object-contain"
                      poster={profile.videoPoster || undefined}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/80 text-white opacity-80 transition-all duration-200 hover:scale-110 hover:opacity-100"
                        aria-label="Play video"
                      >
                        <Play size={28} className="ml-1" fill="white" />
                      </button>
                    </div>
                  )}
                  <div className="absolute top-3 start-3">
                    <span className="rounded-full bg-[var(--gold)]/10 px-3 py-1 text-xs font-medium text-[var(--gold)]">
                      {t('introVideo')}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Bio Section */}
              <motion.div
                className="mt-8"
                initial="hidden"
                animate="visible"
                custom={2}
                variants={fadeInUp}
              >
                <h2 className="text-xl font-bold text-[var(--gold)]">{t('bio')}</h2>
                <p className="mt-3 leading-relaxed text-gray-300">
                  {bioTruncated}
                </p>
                {shouldShowReadMore && (
                  <button
                    onClick={() => setBioExpanded(!bioExpanded)}
                    className="mt-2 flex items-center gap-1 text-sm font-medium text-[var(--gold)] transition-colors hover:text-[var(--gold)]/80"
                  >
                    {t('readMore')}
                    {locale === 'ar' ? (
                      <ChevronLeft size={14} />
                    ) : (
                      <ChevronRight size={14} />
                    )}
                  </button>
                )}
              </motion.div>

              {/* Reviews Section */}
              <motion.div
                className="mt-10"
                initial="hidden"
                animate="visible"
                custom={3}
                variants={fadeInUp}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{t('reviewsTitle')}</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-[var(--gold)]">
                      {profile.rating.toFixed(1)}
                    </span>
                    <Star size={20} className="fill-[var(--gold)] text-[var(--gold)]" />
                  </div>
                </div>

                {profile.reviews.length > 0 ? (
                  <div className="mt-4 space-y-4">
                    {(showAllReviews ? profile.reviews : profile.reviews.slice(0, 2)).map((review, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-white/5 bg-[#0B0F17] p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/10">
                            <span className="text-xs font-bold text-[var(--gold)]">
                              {review.initials}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-white">
                                {review.name}
                              </p>
                              <span className="text-xs text-gray-500">{review.date}</span>
                            </div>
                            <StarRating rating={review.rating} size={12} />
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed text-gray-400">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                    {profile.reviews.length > 2 && (
                      <button
                        onClick={() => setShowAllReviews(!showAllReviews)}
                        className="mx-auto flex items-center gap-1 px-4 py-2 text-sm font-medium text-[var(--gold)] transition-colors hover:text-[var(--gold)]/80"
                      >
                        {showAllReviews
                          ? (locale === 'ar' ? 'عرض التقييمات الأخيرة' : 'Show fewer reviews')
                          : (locale === 'ar' ? `عرض جميع التقييمات (${profile.reviewCount})` : `Show all reviews (${profile.reviewCount})`)}
                        {locale === 'ar' ? (
                          <ChevronLeft size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">
                    {locale === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}
                  </p>
                )}
              </motion.div>

              {/* Availability Calendar Section */}
              <motion.div
                className="mt-10"
                initial="hidden"
                animate="visible"
                custom={4}
                variants={fadeInUp}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">{t('availability')}</h2>
                  <span className="text-sm text-gray-400">
                    {t('timezone')}: {profile.timezone}
                  </span>
                </div>

                {profile.availability.length === 0 ? (
                  <div className="mt-4 flex h-48 items-center justify-center rounded-xl border border-white/5 bg-[#0B0F17]">
                    <p className="text-sm text-gray-500">{t('noSlots')}</p>
                  </div>
                ) : (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-white/5 bg-[#0B0F17] p-4">
                    <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                      {profile.availability.map((day) => (
                        <div
                          key={day.date}
                          className="text-center text-xs font-semibold text-gray-400 pb-2"
                        >
                          {day.dayLabel}
                        </div>
                      ))}

                      <div className="col-span-7 grid grid-cols-7 gap-2">
                        {profile.availability.map((day) => (
                          <div key={day.date} className="flex flex-col gap-1.5">
                            {ALL_TIME_SLOTS.map((time) => {
                              const slot = day.slots.find(
                                (s) => s.time === time,
                              );
                              const isAvailable = slot?.available ?? false;
                              const slotKey = `${day.date}-${time}`;
                              const isSelected = selectedSlot === slotKey;

                              return (
                                <button
                                  key={time}
                                  disabled={!isAvailable}
                                  onClick={() =>
                                    handleSlotClick(slotKey, isAvailable)
                                  }
                                  className={`rounded-md px-1 py-1.5 text-[10px] leading-none transition-all duration-150 ${
                                    isSelected
                                      ? 'bg-[#d4af37] font-bold text-black'
                                      : isAvailable
                                        ? 'cursor-pointer border border-[var(--gold)]/30 text-gray-300 hover:bg-[var(--gold)]/10 hover:text-white'
                                        : 'cursor-not-allowed bg-gray-800/50 text-gray-600 line-through'
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {!loading && !profile && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="mb-4 rounded-2xl bg-white/5 p-5">
              <MapPin size={40} strokeWidth={1.75} className="text-[var(--text-faint)]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              {locale === 'ar' ? 'لم يتم العثور على المحاور' : 'Interviewer not found'}
            </h3>
          </div>
        )}

        {/* Mobile-only floating Book button bar */}
        {!loading && profile && selectedSlot && (
          <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:hidden">
            <div className="mx-auto max-w-lg">
              <button
                onClick={handleBookSlot}
                className="w-full rounded-xl bg-[var(--gold)] py-3 text-sm font-bold text-black shadow-lg shadow-gold/20 transition-all duration-200 hover:bg-[var(--gold)]/90 active:scale-[0.98]"
              >
                {t('bookSlot')}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mock Data (used when API is unavailable)                            */
/* ------------------------------------------------------------------ */

function getMockProfile(id: string, locale: string): InterviewerProfile {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const days: DaySlots[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay();
    const isWeekend = dow === 5 || dow === 6; // Fri, Sat
    const dayName = locale === 'ar' ? DAY_NAMES_AR[dow] : DAY_NAMES_EN[dow];

    const slots: Slot[] = ALL_TIME_SLOTS.map((time) => {
      const hour = parseInt(time.split(':')[0], 10);
      const booked = !isWeekend && Math.random() < 0.2;
      return {
        time,
        available: isWeekend ? false : !booked && hour >= 10 && hour <= 15,
      };
    });

    days.push({ date: dateStr, dayLabel: dayName, slots });
  }

  if (locale === 'ar') {
    return {
      id,
      name: 'د. سارة المنصوري',
      nameAr: 'د. سارة المنصوري',
      initials: 'سم',
      photoUrl: '/images/interviewers/int-f1.webp',
      title: 'مديرة موارد بشرية — ١٢ سنة',
      titleAr: 'مديرة موارد بشرية — ١٢ سنة',
      location: 'الرياض',
      flagEmoji: '🇸🇦',
      rating: 4.8,
      reviewCount: 127,
      totalInterviews: 127,
      price: 29,
      pricePerMin: 1,
      languages: ['AR', 'EN'],
      languageLabels: ['العربية', 'English'],
      specialties: ['موارد بشرية', 'تطوير تنظيمي', 'توظيف'],
      industries: ['TECH', 'RETAIL'],
      bio: 'خبيرة في موارد بشرية مع أكثر من ١٢ عاماً من الخبرة في قطاع التقنية والحكومة. متخصصة في التوظيف والتطوير التنظيمي وإدارة المواهب. عملت مع كبرى الشركات في المنطقة العربية وأساعدت في بناء فرق عمل عالية الأداء. أسعى دائماً لتقديم تجربة مقابلة واقعية ومفيدة للمرشحين، مع التركيز على نقاط القوة والتحسين. مؤهلة من معهد CIPD البريطاني وعضو في جمعية إدارة الموارد البشرية السعودية.',
      bioAr: 'خبيرة في موارد بشرية مع أكثر من ١٢ عاماً من الخبرة في قطاع التقنية والحكومة. متخصصة في التوظيف والتطوير التنظيمي وإدارة المواهب. عملت مع كبرى الشركات في المنطقة العربية وأساعدت في بناء فرق عمل عالية الأداء. أسعى دائماً لتقديم تجربة مقابلة واقعية ومفيدة للمرشحين، مع التركيز على نقاط القوة والتحسين. مؤهلة من معهد CIPD البريطاني وعضو في جمعية إدارة الموارد البشرية السعودية.',
      videoUrl: null,
      videoPoster: null,
      isOnline: true,
      timezone: 'الرياض (GMT+3)',
      reviews: [
        {
          initials: 'عأ',
          name: 'مرشح · مبيعات',
          role: 'Sales',
          date: '١٥ يناير ٢٠٢٥',
          rating: 5,
          comment: 'مقابلة ممتازة وساعدتني كثيراً في التحضير. الأسئلة كانت واقعية والتغذية الراجعة مفصلة جداً. أنصح بها بشدة لكل من يستعد لمقابلة عمل.',
        },
        {
          initials: 'نم',
          name: 'مرشح · تقنية',
          role: 'Tech',
          date: '١٠ يناير ٢٠٢٥',
          rating: 5,
          comment: 'تجربة رائعة! د. سارة تسأل أسئلة ذكية وتعطي ملاحظات بنّاءة. أشعر بثقة أكبر الآن بعد المقابلة. سأحجز مرة أخرى بالتأكيد.',
        },
        {
          initials: 'خش',
          name: 'مرشح · مالية',
          role: 'Finance',
          date: '٥ يناير ٢٠٢٥',
          rating: 4,
          comment: 'مقابلة جيدة عامة لكن أتمنى لو كان هناك تركيز أكثر على الأسئلة التقنية المتخصصة. التغذية الراجعة كانت مفيدة.',
        },
      ],
      availability: days,
    };
  }

  return {
    id,
    name: 'Dr. Sarah Al-Mansouri',
    nameAr: 'د. سارة المنصوري',
    initials: 'SM',
    photoUrl: '/images/interviewers/int-f1.webp',
    title: 'HR Director — 12 years',
    titleAr: 'مديرة موارد بشرية — ١٢ سنة',
    location: 'Riyadh',
    flagEmoji: '🇸🇦',
    rating: 4.8,
    reviewCount: 127,
    totalInterviews: 127,
    price: 29,
    pricePerMin: 1,
    languages: ['AR', 'EN'],
    languageLabels: ['العربية', 'English'],
    specialties: ['Human Resources', 'Org Development', 'Talent Acquisition'],
    industries: ['TECH', 'RETAIL'],
    bio: 'HR expert with 12+ years across tech and government sectors. Specialized in talent acquisition, organizational development, and performance management. I\'ve worked with leading organizations in the MENA region and helped build high-performing teams. My goal is to provide a realistic, insightful mock interview experience that helps candidates identify their strengths and areas for improvement. CIPD-qualified and member of the Saudi HR Management Association.',
    bioAr: 'خبيرة في موارد بشرية مع أكثر من ١٢ عاماً من الخبرة في قطاع التقنية والحكومة. متخصصة في التوظيف والتطوير التنظيمي وإدارة المواهب.',
    videoUrl: null,
    videoPoster: null,
    isOnline: true,
    timezone: 'Riyadh (GMT+3)',
    reviews: [
      {
        initials: 'OA',
        name: 'Candidate · Sales',
        role: 'Sales',
        date: 'Jan 15, 2025',
        rating: 5,
        comment: 'Incredible interviewer! Asked very relevant behavioral questions and gave detailed, actionable feedback. Highly recommended.',
      },
      {
        initials: 'NM',
        name: 'Candidate · Tech',
        role: 'Tech',
        date: 'Jan 10, 2025',
        rating: 5,
        comment: 'Amazing experience! Dr. Sarah asks smart questions and provides constructive notes. I feel much more confident now. Will definitely book again.',
      },
      {
        initials: 'KS',
        name: 'Candidate · Finance',
        role: 'Finance',
        date: 'Jan 5, 2025',
        rating: 4,
        comment: 'Good session overall. Would have liked more technical depth but the feedback was useful.',
      },
    ],
    availability: days,
  };
}
