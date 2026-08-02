'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SlotStatus = 'available' | 'blocked' | 'booked' | 'past';

type SlotKey = string; // "YYYY-MM-DD_HH:MM"

type BookedSlot = {
  candidate: string;
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const DAY_NAMES_AR = ['الأحد', 'الثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slotKey(dateStr: string, hour: number, minute: number): SlotKey {
  return `${dateStr}_${pad(hour)}:${pad(minute)}`;
}

function isToday(d: Date): boolean {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function isPastSlot(d: Date, hour: number, minute: number): boolean {
  const now = new Date();
  const slotTime = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute);
  return slotTime.getTime() < now.getTime();
}

function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Fill in leading empty days for the first row
  const startDow = firstDay.getDay();
  for (let i = 0; i < startDow; i++) {
    days.push(new Date(year, month, 1 - (startDow - i)));
  }

  // Actual days
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Fill trailing days
  const endDow = lastDay.getDay();
  const remaining = endDow === 6 ? 0 : 6 - endDow;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

/* ------------------------------------------------------------------ */
/*  Time slots: 9:00 – 17:00, 30-min blocks                            */
/* ------------------------------------------------------------------ */

const TIME_SLOTS: { hour: number; minute: number; label: string }[] = [];
for (let h = 9; h < 17; h++) {
  TIME_SLOTS.push({ hour: h, minute: 0, label: `${h}:00` });
  TIME_SLOTS.push({ hour: h, minute: 30, label: `${h}:30` });
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delay: 0.15, duration: 0.45, ease: 'easeOut' as const },
  },
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CalendarPage() {
  const t = useTranslations('interviewerDash');
  const tc = useTranslations('common');
  const locale = useLocale();
  const dayNames = locale === 'ar' ? DAY_NAMES_AR : DAY_NAMES_EN;

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-indexed

  // Availability state: maps SlotKey -> SlotStatus
  const [slots, setSlots] = useState<Record<SlotKey, SlotStatus>>(() => {
    const initial: Record<SlotKey, SlotStatus> = {};

    // Seed some blocked, booked, and past slots
    const today = new Date();

    // Some past slots (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    initial[slotKey(dateKey(yesterday), 9, 0)] = 'past';
    initial[slotKey(dateKey(yesterday), 9, 30)] = 'past';

    // Some blocked slots (tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    initial[slotKey(dateKey(tomorrow), 10, 0)] = 'blocked';
    initial[slotKey(dateKey(tomorrow), 14, 0)] = 'blocked';
    initial[slotKey(dateKey(tomorrow), 14, 30)] = 'blocked';

    // Some booked slots (day after tomorrow)
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    initial[slotKey(dateKey(dayAfter), 11, 0)] = 'booked';
    initial[slotKey(dateKey(dayAfter), 11, 30)] = 'booked';

    // Another booked slot (in 5 days)
    const fiveDays = new Date(today);
    fiveDays.setDate(fiveDays.getDate() + 5);
    initial[slotKey(dateKey(fiveDays), 13, 0)] = 'booked';

    return initial;
  });

  // Mock booked slot candidate names
  const bookedNames: Record<SlotKey, string> = useMemo(() => {
    const names: Record<SlotKey, string> = {};
    Object.entries(slots).forEach(([key, status]) => {
      if (status === 'booked') {
        const candidates = ['سارة المحمدي', 'أحمد العتيبي', 'نورة القحطاني'];
        names[key] = candidates[Math.floor(Math.random() * candidates.length)];
      }
    });
    return names;
  }, []);

  const days = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    locale === 'ar' ? 'ar-SA' : 'en-US',
    { year: 'numeric', month: 'long' }
  );

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }

  function toggleSlot(key: SlotKey) {
    setSlots((prev) => {
      const current = prev[key];
      if (!current || current === 'available') {
        return { ...prev, [key]: 'blocked' };
      }
      if (current === 'blocked') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return prev; // booked & past are immutable
    });
  }

  function getSlotStatus(d: Date, hour: number, minute: number): SlotStatus {
    const dk = dateKey(d);
    const sk = slotKey(dk, hour, minute);
    if (slots[sk]) return slots[sk];
    if (isPastSlot(d, hour, minute)) return 'past';
    // For current month only, default available; outside months show nothing
    if (d.getMonth() !== viewMonth || d.getFullYear() !== viewYear) return 'past';
    return 'available';
  }

  function slotClass(status: SlotStatus): string {
    switch (status) {
      case 'available':
        return 'border-gold/50 outline text-gold hover:bg-gold/10 cursor-pointer';
      case 'blocked':
        return 'bg-gray-800 text-gray-600 line-through';
      case 'booked':
        return 'bg-gold/20 text-gold';
      case 'past':
        return 'bg-gray-900 text-gray-700';
      default:
        return '';
    }
  }

  function isOtherMonth(d: Date): boolean {
    return d.getMonth() !== viewMonth || d.getFullYear() !== viewYear;
  }

  return (
    <div className="space-y-6">
      {/* Page title */}
      <h1 className="text-2xl font-bold text-gold md:text-3xl">
        {t('calendar')}
      </h1>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          {locale === 'ar' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
        <button
          type="button"
          onClick={nextMonth}
          className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          {locale === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-gold/50" />
          {locale === 'ar' ? 'متاح' : 'Available'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-gray-800" />
          {locale === 'ar' ? 'محظور' : 'Blocked'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-gold/20" />
          {locale === 'ar' ? 'محجوز' : 'Booked'}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-gray-900" />
          {locale === 'ar' ? 'انتهى' : 'Past'}
        </span>
      </div>

      {/* Calendar grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="overflow-x-auto"
      >
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((name) => (
              <div
                key={name}
                className="py-2 text-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide"
              >
                {name}
              </div>
            ))}
          </div>

          {/* Week rows */}
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-1 mb-1">
              {days.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, dayIdx) => {
                const otherMonth = isOtherMonth(day);
                const today = isToday(day);

                return (
                  <div
                    key={dayIdx}
                    className={`bg-[#0B0F17] rounded-lg p-1.5 border ${
                      otherMonth
                        ? 'border-white/[0.03] opacity-40'
                        : today
                          ? 'border-gold/30'
                          : 'border-white/[0.06]'
                    }`}
                  >
                    {/* Day number */}
                    <div
                      className={`text-xs font-medium mb-1 px-1 ${
                        today ? 'text-gold' : otherMonth ? 'text-gray-600' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {day.getDate()}
                    </div>

                    {/* Time slots */}
                    <div className="space-y-0.5">
                      {otherMonth
                        ? null
                        : TIME_SLOTS.map((ts) => {
                            const status = getSlotStatus(day, ts.hour, ts.minute);
                            const sk = slotKey(dateKey(day), ts.hour, ts.minute);
                            const interactive = status === 'available' || status === 'blocked';

                            return (
                              <button
                                key={ts.label}
                                type="button"
                                disabled={!interactive}
                                onClick={() => toggleSlot(sk)}
                                className={`w-full rounded px-1 py-0.5 text-[10px] leading-tight transition-colors ${slotClass(status)} ${
                                  status === 'blocked' ? 'cursor-pointer hover:bg-gray-700' : ''
                                }`}
                              >
                                {status === 'booked' ? (
                                  <span className="block truncate font-medium">
                                    {bookedNames[sk] || '—'}
                                  </span>
                                ) : (
                                  <span className="block truncate">{ts.label}</span>
                                )}
                              </button>
                            );
                          })}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Save button */}
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-sm font-semibold text-[#0B0F17] transition-colors hover:bg-gold/90 cursor-pointer"
        >
          <Check size={18} strokeWidth={2} />
          {tc('save')}
        </button>
      </div>
    </div>
  );
}
