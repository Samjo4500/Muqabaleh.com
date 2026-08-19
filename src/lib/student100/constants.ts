export const STUDENT100_CAP = 100;
export const STUDENT100_CREDITS = 3;
export const STUDENT100_DAYS = 30;
/** Campaign opens 20 Aug 2026 00:00 Asia/Riyadh (UTC+3). */
export const STUDENT100_START_AT = new Date('2026-08-20T00:00:00+03:00');
export const STUDENT100_PATH = '/student100';

export const STUDENT100_RESERVED_STATUSES = ['PENDING', 'ACTIVATED'] as const;

export function packExpiresAt(from = new Date()): Date {
  return new Date(from.getTime() + STUDENT100_DAYS * 24 * 60 * 60 * 1000);
}

export function isCampaignOpen(now = new Date()): boolean {
  return now.getTime() >= STUDENT100_START_AT.getTime();
}

export function remainingFromReserved(reserved: number): number {
  return Math.max(0, STUDENT100_CAP - reserved);
}
