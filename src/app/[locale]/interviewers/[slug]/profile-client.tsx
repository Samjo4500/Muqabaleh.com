'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Star, Quote, Clock, CalendarCheck, ThumbsUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlowCard, VerifiedBadge } from '@/components/brand';
import { localePath } from '@/i18n/navigation';

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
  recommendRate: number;
  responseTime: string;
  sectorsAr: string[];
  sectorsEn: string[];
  avatarColor: string;
  initials: string;
}

/* ------------------------------------------------------------------ */
/*  Mock Data Map                                                      */
/* ------------------------------------------------------------------ */

const INTERVIEWER_MAP: Record<string, InterviewerData> = {
  'huda-al-salem': {
    slug: 'huda-al-salem',
    nameAr: 'د. هدى السالم', nameEn: 'Dr. Huda Al-Salem',
    titleAr: 'مديرة موارد بشرية سابقة في الاتصالات', titleEn: 'Former HR Director at STC',
    rating: 4.9, sessionCount: 48, price: 49, recommendRate: 97, responseTime: '< 2h',
    sectorsAr: ['HR', 'اتصالات'], sectorsEn: ['HR', 'Telecom'],
    avatarColor: 'bg-[var(--gold)]', initials: 'هدى',
  },
  'yasser-al-ghamdi': {
    slug: 'yasser-al-ghamdi',
    nameAr: 'م. ياسر الغامدي', nameEn: 'Eng. Yasser Al-Ghamdi',
    titleAr: 'مهندس برمجيات أول سابق في أرامكو', titleEn: 'Former Senior Software Engineer at Aramco',
    rating: 4.8, sessionCount: 35, price: 55, recommendRate: 95, responseTime: '< 3h',
    sectorsAr: ['تقنية المعلومات', 'هندسة'], sectorsEn: ['IT', 'Engineering'],
    avatarColor: 'bg-emerald', initials: 'يغ',
  },
  'rana-al-otaibi': {
    slug: 'rana-al-otaibi',
    nameAr: 'أ. رنا العتيبي', nameEn: 'Rana Al-Otaibi',
    titleAr: 'خبيرة تسويق رقمي', titleEn: 'Digital Marketing Expert',
    rating: 4.9, sessionCount: 27, price: 49, recommendRate: 98, responseTime: '< 1h',
    sectorsAr: ['تسويق', 'مبيعات'], sectorsEn: ['Marketing', 'Sales'],
    avatarColor: 'bg-cyan', initials: 'رع',
  },
  'sultan-al-dosari': {
    slug: 'sultan-al-dosari',
    nameAr: 'م. سلطان الدوسري', nameEn: 'Eng. Sultan Al-Dosari',
    titleAr: 'مدير مالي سابق', titleEn: 'Former Finance Director',
    rating: 4.8, sessionCount: 12, price: 59, recommendRate: 92, responseTime: '< 4h',
    sectorsAr: ['مالية', 'محاسبة'], sectorsEn: ['Finance', 'Accounting'],
    avatarColor: 'bg-amber-500', initials: 'سد',
  },
  'mona-al-qahtani': {
    slug: 'mona-al-qahtani',
    nameAr: 'د. منى القحطاني', nameEn: 'Dr. Mona Al-Qahtani',
    titleAr: 'أستاذة طب سابقة', titleEn: 'Former Professor of Medicine',
    rating: 4.9, sessionCount: 19, price: 65, recommendRate: 96, responseTime: '< 2h',
    sectorsAr: ['طب', 'تعليم'], sectorsEn: ['Medicine', 'Education'],
    avatarColor: 'bg-rose-500', initials: 'مق',
  },
  'khalid-al-shahri': {
    slug: 'khalid-al-shahri',
    nameAr: 'أ. خالد الشهري', nameEn: 'Khalid Al-Shahri',
    titleAr: 'مدير مبيعات سابق', titleEn: 'Former Sales Director',
    rating: 4.7, sessionCount: 8, price: 45, recommendRate: 90, responseTime: '< 5h',
    sectorsAr: ['مبيعات', 'تسويق'], sectorsEn: ['Sales', 'Marketing'],
    avatarColor: 'bg-violet-500', initials: 'خش',
  },
};

/* ------------------------------------------------------------------ */
/*  Mock time slots generator                                          */
/* ------------------------------------------------------------------ */

function generateWeekSlots(weekOffset: number) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset + weekOffset * 7);

  const times = ['09:00', '10:30', '12:00', '14:00', '16:00', '18:00'];
  const slots: { date: string; time: string }[] = [];

  for (let d = 0; d < 7; d++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + d);
    const dateStr = day.toISOString().split('T')[0];
    /* Deterministic 3-4 slots per day */
    const count = d % 2 === 0 ? 4 : 3;
    for (let s = 0; s < count; s++) {
      slots.push({ date: dateStr, time: times[(d * 3 + s) % times.length] });
    }
  }

  return slots;
}

/* ------------------------------------------------------------------ */
/*  Exported Client Component                                           */
/* ------------------------------------------------------------------ */

export function InterviewerProfileClient({ slug, locale }: { slug: string; locale: string }) {
  const t = useTranslations('interviewerProfile');
  const tCommon = useTranslations('common');
  const tInterviewers = useTranslations('interviewers');
  const isRTL = locale === 'ar';

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const data = INTERVIEWER_MAP[slug];
  if (!data) return null;

  const name = isRTL ? data.nameAr : data.nameEn;
  const title = isRTL ? data.titleAr : data.titleEn;
  const sectors = isRTL ? data.sectorsAr : data.sectorsEn;
  const weekDays = t('weekDays').split(',');
  const week1Slots = generateWeekSlots(0);
  const week2Slots = generateWeekSlots(1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Back + Header ── */}
      <Link
        href={localePath('/interviewers', locale)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
      >
        <ArrowRight size={16} strokeWidth={1.75} className={isRTL ? 'rotate-180' : ''} />
        {tCommon('back')}
      </Link>

      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full text-xl font-bold text-[var(--bg-void)] ${data.avatarColor}`}>
          {data.initials}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] md:text-3xl">{name}</h1>
            <VerifiedBadge size="sm" />
          </div>
          <p className="mt-1 text-[var(--text-muted)]">{title}</p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Star size={16} strokeWidth={1.75} className="fill-[var(--gold)] text-[var(--gold)]" />
              <span className="font-semibold text-[var(--text-primary)]">{data.rating}</span>
            </div>
            <span className="text-[var(--text-faint)]">
              {data.sessionCount} {tInterviewers('sessionsPlural')}
            </span>
            <span className="font-semibold text-emerald">
              {data.recommendRate}% {isRTL ? 'توصية' : 'recommendation'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="bio" className="mt-10">
        <TabsList className="border border-white/10 rounded-lg bg-white/5">
          <TabsTrigger value="bio" className="text-sm data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)] data-[state=active]:font-bold">{t('tabBio')}</TabsTrigger>
          <TabsTrigger value="credentials" className="text-sm data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)] data-[state=active]:font-bold">{t('tabCredentials')}</TabsTrigger>
          <TabsTrigger value="stats" className="text-sm data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)] data-[state=active]:font-bold">{t('tabStats')}</TabsTrigger>
          <TabsTrigger value="reviews" className="text-sm data-[state=active]:bg-[var(--gold)] data-[state=active]:text-[var(--bg-void)] data-[state=active]:font-bold">{t('tabReviews')}</TabsTrigger>
        </TabsList>

        {/* Bio Tab */}
        <TabsContent value="bio">
          <GlowCard className="p-6" style={{ transform: 'none' }}>
            <div className="space-y-4 text-[var(--text-muted)] leading-relaxed">
              <p>{t('bio1')}</p>
              <p>{t('bio2')}</p>
              <p>{t('bio3')}</p>
            </div>
          </GlowCard>
        </TabsContent>

        {/* Credentials Tab */}
        <TabsContent value="credentials">
          <GlowCard className="p-6" style={{ transform: 'none' }}>
            <ul className="space-y-3">
              {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                <li key={n} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--gold)]" />
                  {t(`cred${n}` as 'cred1')}
                </li>
              ))}
            </ul>
          </GlowCard>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={CalendarCheck} label={t('sessionCount')} value={String(data.sessionCount)} />
            <StatCard icon={Star} label={t('avgRating')} value={String(data.rating)} />
            <StatCard icon={ThumbsUp} label={t('recommendRate')} value={`${data.recommendRate}%`} />
            <StatCard icon={Clock} label={t('responseTime')} value={data.responseTime} />
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews">
          <div className="space-y-4">
            {([1, 2, 3] as const).map((n) => (
              <GlowCard key={n} className="p-6" style={{ transform: 'none' }}>
                <Quote size={20} strokeWidth={1.75} className="mb-3 text-[var(--gold)]" />
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{t(`review${n}Quote` as 'review1Quote')}</p>
                <div className="mt-4 border-t border-white/5 pt-4">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{t(`review${n}Name` as 'review1Name')}</p>
                  <p className="text-xs text-[var(--text-faint)]">{t(`review${n}Role` as 'review1Role')}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── Slot Picker ── */}
      <div className="mt-12">
        <h2 className="mb-6 text-xl font-bold text-[var(--text-primary)]">{t('slotsTitle')}</h2>
        <SlotWeek slots={week1Slots} weekDays={weekDays} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
        <SlotWeek slots={week2Slots} weekDays={weekDays} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
      </div>

      {/* ── Book CTA ── */}
      <div className="mt-10 flex justify-center">
        <button disabled className="btn-gold cursor-not-allowed opacity-50">
          {t('bookSession')}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stat Card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <GlowCard className="p-5 text-center" style={{ transform: 'none' }}>
      <Icon size={24} strokeWidth={1.75} className="mx-auto mb-3 text-[var(--gold)]" />
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--text-faint)]">{label}</p>
    </GlowCard>
  );
}

/* ------------------------------------------------------------------ */
/*  Slot Week Grid                                                     */
/* ------------------------------------------------------------------ */

function SlotWeek({ slots, weekDays, selectedSlot, onSelect }: {
  slots: { date: string; time: string }[];
  weekDays: string[];
  selectedSlot: string | null;
  onSelect: (slotKey: string) => void;
}) {
  const byDate = new Map<string, string[]>();
  slots.forEach((s) => {
    const list = byDate.get(s.date) ?? [];
    list.push(s.time);
    byDate.set(s.date, list);
  });

  const dates = Array.from(byDate.keys()).sort();

  return (
    <div className="mb-8">
      <p className="mb-3 text-sm text-[var(--text-faint)]">{dates[0] ?? ''}</p>
      <div className="space-y-2">
        {dates.map((date) => {
          const day = new Date(date + 'T00:00:00').getDay();
          const dayIdx = day === 0 ? 6 : day - 1;
          return (
            <div key={date} className="flex items-start gap-4">
              <span className="w-20 shrink-0 pt-2 text-sm font-medium text-[var(--text-muted)]">
                {weekDays[dayIdx] ?? ''}
              </span>
              <div className="flex flex-wrap gap-2">
                {byDate.get(date)?.map((time) => {
                  const key = `${date}-${time}`;
                  const isSelected = selectedSlot === key;
                  return (
                    <button
                      key={key}
                      onClick={() => onSelect(key)}
                      className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'border-[var(--gold)] bg-[var(--gold)]/10 font-semibold text-[var(--gold)]'
                          : 'border-white/10 text-[var(--text-muted)] hover:border-white/20 hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}