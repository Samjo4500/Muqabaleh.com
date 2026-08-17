import { timezoneForCity } from './constants';

function tzOffsetMs(timeZone: string, date: Date): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  );
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUTC - date.getTime();
}

export function zonedDate(
  timeZone: string,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0,
): Date {
  const utc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const first = new Date(utc);
  const offset = tzOffsetMs(timeZone, first);
  const adjusted = new Date(utc - offset);
  const offset2 = tzOffsetMs(timeZone, adjusted);
  if (offset2 !== offset) return new Date(utc - offset2);
  return adjusted;
}

export function zonedParts(
  date: Date,
  timeZone: string,
): { year: number; month: number; day: number; hour: number; weekday: number } {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts = Object.fromEntries(
    dtf.formatToParts(date).map((p) => [p.type, p.value]),
  );
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    weekday: weekdayMap[parts.weekday] ?? 0,
  };
}

function addCalendarDays(
  year: number,
  month: number,
  day: number,
  days: number,
): { year: number; month: number; day: number } {
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

/** 09:00 in the lead timezone, `days` calendar days after `from`. */
export function addDaysAtNine(
  from: Date,
  days: number,
  timeZone = 'Asia/Dubai',
): Date {
  const parts = zonedParts(from, timeZone);
  const next = addCalendarDays(parts.year, parts.month, parts.day, days);
  return zonedDate(timeZone, next.year, next.month, next.day, 9, 0);
}

/** Next Monday 09:00 in timezone. If already Monday before 09:00, use today. */
export function nextMondayAtNine(
  from: Date,
  timeZone = 'Asia/Dubai',
): Date {
  const parts = zonedParts(from, timeZone);
  let add = (8 - parts.weekday) % 7;
  if (add === 0) add = parts.hour < 9 ? 0 : 7;
  const next = addCalendarDays(parts.year, parts.month, parts.day, add);
  return zonedDate(timeZone, next.year, next.month, next.day, 9, 0);
}

export function hoursFromNow(hours: number, from = new Date()): Date {
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

export function cityTimezone(city?: string | null): string {
  return timezoneForCity(city);
}

export type LeadSendSnapshot = {
  lastJobsBrowseAt?: Date | null;
  practiceCount?: number | null;
  lastPracticedAt?: Date | null;
  lastJobClickAt?: Date | null;
  lastApplyClickAt?: Date | null;
  enrolledAt?: Date | null;
};

export function shouldSkipSignupStep(
  step: number,
  lead: LeadSendSnapshot,
): boolean {
  if (step === 3 && lead.lastJobsBrowseAt) return true;
  if (step === 4 && (lead.practiceCount ?? 0) >= 2) return true;
  if (
    step === 5 &&
    ((lead.practiceCount ?? 0) >= 2 || lead.lastJobsBrowseAt)
  ) {
    return true;
  }
  return false;
}

export function shouldSkipJobClick(lead: LeadSendSnapshot): boolean {
  if (!lead.lastJobClickAt) return true;
  if (
    lead.lastPracticedAt &&
    lead.lastJobClickAt &&
    lead.lastPracticedAt >= lead.lastJobClickAt
  ) {
    return true;
  }
  return false;
}

export type PrefSnapshot = {
  frequency: string;
  pausedUntil?: Date | null;
  unsubscribedAt?: Date | null;
};

export function canSendNurture(
  pref: PrefSnapshot | null | undefined,
  now = new Date(),
): { ok: boolean; reason?: string } {
  if (!pref) return { ok: true };
  if (pref.frequency === 'UNSUBSCRIBED' || pref.unsubscribedAt) {
    return { ok: false, reason: 'unsubscribed' };
  }
  if (pref.pausedUntil && pref.pausedUntil > now) {
    return { ok: false, reason: 'paused' };
  }
  if (pref.frequency === 'PAUSED') {
    return { ok: false, reason: 'paused' };
  }
  if (pref.frequency === 'MONTHLY_DIGEST') {
    return { ok: false, reason: 'monthly_digest' };
  }
  return { ok: true };
}

/** LESS_OFTEN: keep odd steps (1, 3, 5) and skip even ones. */
export function skipForLessOften(frequency: string, step: number): boolean {
  return frequency === 'LESS_OFTEN' && step % 2 === 0;
}
